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
    lower.includes('notification@')
  )
}

export function isNewsletter(headers: Record<string, string>, from: string, subject: string): boolean {
  // Check for List-Unsubscribe header
  if (headers['List-Unsubscribe'] || headers['list-unsubscribe']) {
    return true
  }

  // Check from address
  if (isNoReplyEmail(from)) {
    return true
  }

  // Check for common receipt/newsletter patterns in subject
  const receiptPatterns = [
    /receipt/i,
    /invoice/i,
    /order confirmation/i,
    /shipping confirmation/i,
    /your order/i,
    /newsletter/i,
    /unsubscribe/i,
  ]

  for (const pattern of receiptPatterns) {
    if (pattern.test(subject)) {
      return true
    }
  }

  return false
}

