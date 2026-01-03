import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { transcribeAudio, extractFromText } from '@/lib/openai'
import twilio from 'twilio'

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()

  try {
    // Parse form data
    const formData = await request.formData()
    const body: Record<string, string> = {}
    formData.forEach((value, key) => {
      body[key] = value.toString()
    })

    const {
      CallSid,
      RecordingUrl,
      RecordingStatus,
      RecordingDuration,
    } = body

    console.log('[Twilio Recording] Webhook:', { CallSid, RecordingStatus, RecordingDuration })

    // Find the call
    const { data: call, error: callError } = await supabase
      .from('calls')
      .select('*, customers(*)')
      .eq('twilio_call_sid', CallSid)
      .single()

    if (callError || !call) {
      console.error('[Twilio Recording] Call not found:', CallSid)
      return NextResponse.json({ error: 'Call not found' }, { status: 404 })
    }

    // Get Twilio credentials for this account
    const { data: twilioIntegration } = await supabase
      .from('integrations_twilio')
      .select('*')
      .eq('account_id', call.account_id)
      .single()

    if (!twilioIntegration) {
      console.error('[Twilio Recording] No integration found for account:', call.account_id)
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    // Verify signature
    const signature = request.headers.get('x-twilio-signature')
    const url = request.url

    if (!signature || !validateTwilioSignature(signature, url, body, twilioIntegration.twilio_auth_token)) {
      console.error('[Twilio Recording] Invalid signature')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update call with recording info
    await supabase
      .from('calls')
      .update({
        recording_url: RecordingUrl,
        recording_status: RecordingStatus,
        duration_seconds: parseInt(RecordingDuration) || null,
      })
      .eq('id', call.id)

    if (RecordingStatus === 'completed' && RecordingUrl) {
      // Check if already transcribed
      const { data: existingTranscript } = await supabase
        .from('transcripts')
        .select('id')
        .eq('call_id', call.id)
        .single()

      if (!existingTranscript) {
        // Process transcription async (inline for MVP, can move to queue later)
        processTranscription(call, RecordingUrl, twilioIntegration).catch(console.error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Twilio Recording] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function processTranscription(
  call: {
    id: string
    account_id: string
    customer_id: string
    customers: { id: string; summary: string | null } | null
  },
  recordingUrl: string,
  twilioIntegration: {
    twilio_account_sid: string
    twilio_auth_token: string
  }
) {
  const supabase = createAdminClient()

  try {
    console.log('[Transcription] Starting for call:', call.id)

    // Fetch recording audio from Twilio
    const audioUrl = `${recordingUrl}.wav`
    const authHeader = Buffer.from(
      `${twilioIntegration.twilio_account_sid}:${twilioIntegration.twilio_auth_token}`
    ).toString('base64')

    const audioResponse = await fetch(audioUrl, {
      headers: {
        Authorization: `Basic ${authHeader}`,
      },
    })

    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio: ${audioResponse.status}`)
    }

    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer())
    console.log('[Transcription] Audio fetched, size:', audioBuffer.length)

    // Transcribe with Whisper
    const transcriptText = await transcribeAudio(audioBuffer)
    console.log('[Transcription] Complete, length:', transcriptText.length)

    // Save transcript
    await supabase
      .from('transcripts')
      .insert({
        account_id: call.account_id,
        call_id: call.id,
        raw_text: transcriptText,
      })

    // Extract insights
    await processExtraction(call, transcriptText, 'call')

    console.log('[Transcription] Done for call:', call.id)
  } catch (error) {
    console.error('[Transcription] Error:', error)
    
    // Update recording status to failed
    await supabase
      .from('calls')
      .update({ recording_status: 'transcription_failed' })
      .eq('id', call.id)
  }
}

export async function processExtraction(
  item: {
    id: string
    account_id: string
    customer_id: string
    customers?: { id: string; summary: string | null } | null
  },
  text: string,
  source: 'call'
) {
  const supabase = createAdminClient()

  try {
    console.log('[Extraction] Starting for', source, item.id)

    const extraction = await extractFromText(text, source)

    // Save memories - dedupe by content
    const memoryTypes: Array<{ type: 'personal' | 'business' | 'commitment'; facts: string[] }> = [
      { type: 'personal', facts: extraction.personal_facts },
      { type: 'business', facts: extraction.business_context },
      { type: 'commitment', facts: extraction.commitments },
    ]

    for (const { type, facts } of memoryTypes) {
      for (const content of facts) {
        if (!content.trim()) continue

        // Check for duplicates
        const { data: existing } = await supabase
          .from('memories')
          .select('id')
          .eq('customer_id', item.customer_id)
          .eq('content', content)
          .single()

        if (!existing) {
          await supabase
            .from('memories')
            .insert({
              account_id: item.account_id,
              customer_id: item.customer_id,
              type,
              content,
              source,
              source_id: item.id,
            })
        }
      }
    }

    // Save follow-ups
    for (const suggestion of extraction.follow_up_suggestions) {
      if (!suggestion.trim()) continue

      await supabase
        .from('follow_ups')
        .insert({
          account_id: item.account_id,
          customer_id: item.customer_id,
          suggestion,
          status: 'pending',
          source,
          source_id: item.id,
        })
    }

    // Save call summary (meeting notes)
    if (source === 'call') {
      await supabase
        .from('calls')
        .update({ summary: extraction.summary })
        .eq('id', item.id)
    }

    // Update customer summary
    const existingSummary = item.customers?.summary || ''
    const newSummary = existingSummary
      ? `${existingSummary}\n\n${extraction.summary}`
      : extraction.summary

    // Keep summary under 1000 chars
    const trimmedSummary = newSummary.length > 1000
      ? newSummary.slice(-1000)
      : newSummary

    await supabase
      .from('customers')
      .update({ summary: trimmedSummary })
      .eq('id', item.customer_id)

    console.log('[Extraction] Done for', source, item.id)
  } catch (error) {
    console.error('[Extraction] Error:', error)
  }
}

function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>,
  authToken: string
): boolean {
  try {
    return twilio.validateRequest(authToken, signature, url, params)
  } catch (error) {
    console.error('[Twilio] Signature validation error:', error)
    return false
  }
}

