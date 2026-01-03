export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function extractEmailAddress(emailHeader: string): string {
  // Extract email from format like "John Doe <john@example.com>"
  const match = emailHeader.match(/<([^>]+)>/)
  if (match) {
    return normalizeEmail(match[1])
  }
  return normalizeEmail(emailHeader)
}

export function isNoReplyEmail(email: string): boolean {
  const lower = email.toLowerCase()
  return (
    lower.includes('noreply') ||
    lower.includes('no-reply') ||
    lower.includes('donotreply') ||
    lower.includes('do-not-reply') ||
    lower.includes('mailer-daemon') ||
    lower.includes('notifications@') ||
    lower.includes('notification@') ||
    lower.includes('@update.') ||
    lower.includes('@updates.') ||
    lower.includes('@service.') ||
    lower.includes('@services.') ||
    lower.includes('@mail.') ||
    lower.includes('@email.') ||
    lower.includes('@automated') ||
    lower.includes('@system')
  )
}

export function isNewsletter(headers: Record<string, string>, from: string, subject: string): boolean {
  // Check for List-Unsubscribe header
  if (headers['List-Unsubscribe'] || headers['list-unsubscribe']) {
    return true
  }

  // Extract email from "From" header
  const fromEmail = extractEmailAddress(from)
  
  // Check from address for no-reply patterns
  if (isNoReplyEmail(fromEmail)) {
    return true
  }

  // Check for common automated/service email domains
  const automatedDomains = [
    'paypal.com',
    'strava.com',
    'amazon.com',
    'ebay.com',
    'etsy.com',
    'shopify.com',
    'square.com',
    'stripe.com',
    'venmo.com',
    'zelle.com',
    'chase.com',
    'bankofamerica.com',
    'wellsfargo.com',
    'linkedin.com',
    'facebook.com',
    'twitter.com',
    'instagram.com',
    'snapchat.com',
    'tiktok.com',
    'youtube.com',
    'netflix.com',
    'spotify.com',
    'apple.com',
    'google.com',
    'microsoft.com',
    'adobe.com',
    'salesforce.com',
    'hubspot.com',
    'mailchimp.com',
    'constantcontact.com',
    'sendgrid.com',
    'twilio.com',
    'stripe.com',
  ]

  const fromDomain = fromEmail.split('@')[1]?.toLowerCase()
  if (fromDomain && automatedDomains.some(domain => fromDomain === domain || fromDomain.endsWith('.' + domain))) {
    // Only allow if it's a personal email (not service/update/notification)
    const personalPatterns = [
      /^[a-z0-9._%+-]+@/, // Standard email format
    ]
    
    // If it's from a known automated domain and contains service/update/notification keywords, skip it
    if (
      fromEmail.includes('service@') ||
      fromEmail.includes('update@') ||
      fromEmail.includes('updates@') ||
      fromEmail.includes('notification@') ||
      fromEmail.includes('notifications@') ||
      fromEmail.includes('mail@') ||
      fromEmail.includes('noreply@') ||
      fromEmail.includes('no-reply@') ||
      fromEmail.includes('automated@') ||
      fromEmail.includes('system@')
    ) {
      return true
    }
  }

  // Check for common receipt/newsletter/notification patterns in subject
  const receiptPatterns = [
    /receipt/i,
    /invoice/i,
    /order confirmation/i,
    /shipping confirmation/i,
    /your order/i,
    /newsletter/i,
    /unsubscribe/i,
    /notification/i,
    /update from/i,
    /kudos/i,
    /activity on/i,
    /charge of/i,
    /payment/i,
    /transaction/i,
    /alert/i,
    /reminder/i,
    /promo/i,
    /promotion/i,
    /special offer/i,
    /discount/i,
    /sale/i,
  ]

  for (const pattern of receiptPatterns) {
    if (pattern.test(subject)) {
      return true
    }
  }

  // Check for Precedence: bulk or list headers
  if (headers['Precedence'] === 'bulk' || headers['Precedence'] === 'list') {
    return true
  }

  // Check for X-Auto-Response-Suppress header (indicates automated)
  if (headers['X-Auto-Response-Suppress']) {
    return true
  }

  return false
}

