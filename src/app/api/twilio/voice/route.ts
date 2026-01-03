import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { normalizePhone } from '@/lib/utils/phone'
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
      From,
      To,
      Direction,
      CallStatus,
    } = body

    console.log('[Twilio Voice] Incoming webhook:', { CallSid, From, To, Direction, CallStatus })

    // Look up the account by the To number
    const toNormalized = normalizePhone(To)
    if (!toNormalized) {
      console.error('[Twilio Voice] Invalid To number:', To)
      return new NextResponse(generateTwiml('Error processing call'), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    const { data: twilioIntegration, error: integrationError } = await supabase
      .from('integrations_twilio')
      .select('*')
      .eq('twilio_phone_e164', toNormalized)
      .single()

    if (integrationError || !twilioIntegration) {
      console.error('[Twilio Voice] No integration found for number:', toNormalized)
      return new NextResponse(generateTwiml('Number not configured'), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    // Verify Twilio signature
    const signature = request.headers.get('x-twilio-signature')
    const url = request.url
    
    if (!signature || !validateTwilioSignature(signature, url, body, twilioIntegration.twilio_auth_token)) {
      console.error('[Twilio Voice] Invalid signature')
      return new NextResponse('Forbidden', { status: 403 })
    }

    const accountId = twilioIntegration.account_id

    // Normalize caller phone
    const fromNormalized = normalizePhone(From)
    if (!fromNormalized) {
      console.error('[Twilio Voice] Invalid From number:', From)
      return new NextResponse(generateTwiml('Error processing call'), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    // Determine call direction
    const direction = Direction?.toLowerCase()?.includes('inbound') ? 'inbound' : 'outbound'
    
    // For inbound: caller is "From", for outbound: called party is "To"
    const customerPhoneNumber = direction === 'inbound' ? fromNormalized : toNormalized

    // Check if this number is blocked (personal contact)
    const { data: blockedNumber } = await supabase
      .from('blocked_numbers')
      .select('id')
      .eq('account_id', accountId)
      .eq('phone_e164', customerPhoneNumber)
      .single()

    if (blockedNumber) {
      console.log('[Twilio Voice] Blocked number, skipping customer creation:', customerPhoneNumber)
      // Still return TwiML to handle the call, but don't create customer
      return new NextResponse(generateTwiml('Call connected'), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    // Find or create customer
    let customerId: string

    const { data: existingPhone } = await supabase
      .from('customer_phones')
      .select('customer_id')
      .eq('account_id', accountId)
      .eq('phone_e164', customerPhoneNumber)
      .single()

    if (existingPhone) {
      customerId = existingPhone.customer_id
    } else {
      // Create new customer
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          account_id: accountId,
          display_name: null,
          last_interaction_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (customerError || !newCustomer) {
        console.error('[Twilio Voice] Failed to create customer:', customerError)
        return new NextResponse(generateTwiml('Error processing call'), {
          status: 200,
          headers: { 'Content-Type': 'text/xml' },
        })
      }

      customerId = newCustomer.id

      // Create phone entry
      await supabase
        .from('customer_phones')
        .insert({
          account_id: accountId,
          customer_id: customerId,
          phone_e164: customerPhoneNumber,
        })
    }

    // Update customer last interaction
    await supabase
      .from('customers')
      .update({ last_interaction_at: new Date().toISOString() })
      .eq('id', customerId)

    // Check if call already exists
    const { data: existingCall } = await supabase
      .from('calls')
      .select('id')
      .eq('twilio_call_sid', CallSid)
      .single()

    if (!existingCall) {
      // Create call record
      await supabase
        .from('calls')
        .insert({
          account_id: accountId,
          customer_id: customerId,
          twilio_call_sid: CallSid,
          direction,
          from_phone: fromNormalized,
          to_phone: toNormalized,
          started_at: new Date().toISOString(),
          recording_status: 'pending',
        })
    }

    // Generate TwiML to record the call
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>This call may be recorded for quality purposes.</Say>
  <Record 
    recordingStatusCallback="${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/recording" 
    recordingStatusCallbackMethod="POST"
    recordingStatusCallbackEvent="completed"
    transcribe="false"
    timeout="30"
    playBeep="false"
  />
  <Say>Thank you for calling. Goodbye.</Say>
</Response>`

    return new NextResponse(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.error('[Twilio Voice] Error:', error)
    return new NextResponse(generateTwiml('An error occurred'), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}

function generateTwiml(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>${message}</Say>
</Response>`
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

