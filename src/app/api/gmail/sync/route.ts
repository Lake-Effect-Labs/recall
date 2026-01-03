import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { google } from 'googleapis'
import { extractEmailAddress, normalizeEmail, isNewsletter, isNoReplyEmail } from '@/lib/utils/email'
import { extractPhoneNumbers } from '@/lib/utils/phone'
import { processExtraction } from '@/app/api/twilio/recording/route'

export async function POST() {
  const supabase = await createClient()
  const adminDb = createAdminClient()

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get profile and account
    const { data: profileData } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('user_id', user.id)
      .single()

    const profile = profileData as { account_id: string } | null

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get Gmail integration
    const { data: gmailData } = await supabase
      .from('integrations_gmail')
      .select('*')
      .eq('account_id', profile.account_id as never)
      .single()

    const gmailIntegration = gmailData as {
      google_refresh_token: string | null
      google_email: string | null
      last_sync_at: string | null
    } | null

    if (!gmailIntegration?.google_refresh_token) {
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 })
    }

    // Set up OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )

    oauth2Client.setCredentials({
      refresh_token: gmailIntegration.google_refresh_token,
    })

    // Refresh the access token to ensure we have the right scopes
    try {
      const { credentials } = await oauth2Client.refreshAccessToken()
      oauth2Client.setCredentials(credentials)
    } catch (refreshError) {
      console.error('[Gmail Sync] Token refresh error:', refreshError)
      return NextResponse.json(
        { error: 'Gmail connection expired. Please disconnect and reconnect Gmail in Settings.' },
        { status: 401 }
      )
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    // Calculate query - get messages from last sync or last 7 days
    const lastSync = gmailIntegration.last_sync_at
      ? new Date(gmailIntegration.last_sync_at)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const query = `after:${Math.floor(lastSync.getTime() / 1000)}`

    // List messages
    const { data: messageList } = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 50,
    })

    const messages = messageList.messages || []
    let emailsProcessed = 0

    for (const msg of messages) {
      try {
        // Check if already processed
        const { data: existing } = await adminDb
          .from('emails')
          .select('id')
          .eq('account_id', profile.account_id)
          .eq('gmail_message_id', msg.id!)
          .single()

        if (existing) continue

        // Fetch full message
        const { data: fullMessage } = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'full',
        })

        if (!fullMessage.payload) continue

        // Parse headers
        const headers: Record<string, string> = {}
        fullMessage.payload.headers?.forEach((h) => {
          if (h.name && h.value) {
            headers[h.name] = h.value
          }
        })

        const from = headers['From'] || ''
        const to = headers['To'] || ''
        const subject = headers['Subject'] || ''
        const date = headers['Date'] || ''

        // Extract email from "From" header for better filtering
        const fromEmail = extractEmailAddress(from)
        
        // Skip newsletters and automated emails
        if (isNewsletter(headers, from, subject)) {
          continue
        }

        // Additional check: skip if from email looks like a service/automated email
        if (isNoReplyEmail(fromEmail)) {
          continue
        }

        // Skip if too many recipients (likely a mass email)
        const toAddresses = to.split(',').map(e => extractEmailAddress(e.trim()))
        if (toAddresses.length > 5) {
          continue
        }

        // Skip if subject is empty or very short (likely automated)
        if (!subject || subject.trim().length < 3) {
          continue
        }

        // Determine direction
        const fromEmail = extractEmailAddress(from)
        const isFromUser = fromEmail === gmailIntegration.google_email?.toLowerCase()
        const direction = isFromUser ? 'sent' : 'received'

        // Get body text
        let bodyText = ''
        let bodySnippet = fullMessage.snippet || ''

        function extractBody(part: typeof fullMessage.payload): string {
          if (part?.body?.data) {
            return Buffer.from(part.body.data, 'base64').toString('utf-8')
          }
          if (part?.parts) {
            for (const p of part.parts) {
              if (p.mimeType === 'text/plain') {
                return extractBody(p)
              }
            }
            for (const p of part.parts) {
              const result = extractBody(p)
              if (result) return result
            }
          }
          return ''
        }

        bodyText = extractBody(fullMessage.payload)

        // Determine participant email (the other party)
        const participantEmail = isFromUser 
          ? toAddresses[0] 
          : fromEmail

        if (!participantEmail) continue

        // Find existing customer (only enrich, don't create new ones)
        // Customers should only be created from phone calls
        let customerId: string | null = null

        // Try to find by email
        const { data: existingEmail } = await adminDb
          .from('customer_emails')
          .select('customer_id')
          .eq('account_id', profile.account_id)
          .eq('email_lower', normalizeEmail(participantEmail))
          .single()

        if (existingEmail) {
          customerId = existingEmail.customer_id
        } else {
          // Try to find by phone in email body/signature
          const phones = extractPhoneNumbers(bodyText)

          for (const phone of phones) {
            const { data: existingPhone } = await adminDb
              .from('customer_phones')
              .select('customer_id')
              .eq('account_id', profile.account_id)
              .eq('phone_e164', phone)
              .single()

            if (existingPhone) {
              customerId = existingPhone.customer_id

              // Add this email to the existing customer
              await adminDb
                .from('customer_emails')
                .insert({
                  account_id: profile.account_id,
                  customer_id: customerId,
                  email_lower: normalizeEmail(participantEmail),
                })
                .onConflict(['account_id', 'email_lower'])
                .doNothing()

              break
            }
          }

          // If no existing customer found, skip this email
          // Customers should only be created from phone calls, not emails
          if (!customerId) {
            continue
          }
        }

        // Update customer last interaction
        const emailDate = new Date(date)
        await adminDb
          .from('customers')
          .update({ last_interaction_at: emailDate.toISOString() })
          .eq('id', customerId)
          .lt('last_interaction_at', emailDate.toISOString())

        // Save email
        const { data: savedEmail, error: emailError } = await adminDb
          .from('emails')
          .insert({
            account_id: profile.account_id,
            customer_id: customerId,
            gmail_message_id: msg.id!,
            thread_id: fullMessage.threadId || null,
            direction,
            from_email: fromEmail,
            to_emails: toAddresses,
            subject: subject || null,
            body_snippet: bodySnippet.slice(0, 500),
            body_text: bodyText.slice(0, 10000),
            sent_at: new Date(date).toISOString(),
          })
          .select()
          .single()

        if (emailError) {
          console.error('[Gmail Sync] Failed to save email:', emailError)
          continue
        }

        // Process extraction (inline for MVP)
        if (savedEmail && bodyText.length > 50) {
          const { data: customer } = await adminDb
            .from('customers')
            .select('id, summary')
            .eq('id', customerId)
            .single()

          await processExtraction(
            {
              id: savedEmail.id,
              account_id: profile.account_id,
              customer_id: customerId,
              customers: customer,
            },
            `Subject: ${subject}\n\n${bodyText}`,
            'email'
          )
        }

        emailsProcessed++
      } catch (msgError) {
        console.error('[Gmail Sync] Error processing message:', msg.id, msgError)
      }
    }

    // Update last sync time
    await adminDb
      .from('integrations_gmail')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('account_id', profile.account_id)

    return NextResponse.json({
      success: true,
      emailsProcessed,
      messagesChecked: messages.length,
    })
  } catch (error) {
    console.error('[Gmail Sync] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    )
  }
}

function extractNameFromEmail(emailHeader: string): string | null {
  // Try to extract name from "John Doe <john@example.com>" format
  const match = emailHeader.match(/^([^<]+)\s*</)
  if (match) {
    return match[1].trim().replace(/"/g, '')
  }
  return null
}

