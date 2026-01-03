import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'

export function normalizePhone(phone: string, defaultCountry: string = 'US'): string | null {
  try {
    if (!phone) return null
    
    // Clean input
    const cleaned = phone.replace(/[^\d+]/g, '')
    if (!cleaned) return null

    // Try parsing with default country
    if (isValidPhoneNumber(cleaned, defaultCountry as 'US')) {
      const parsed = parsePhoneNumber(cleaned, defaultCountry as 'US')
      return parsed?.format('E.164') || null
    }

    // Try parsing as-is (might have country code)
    if (isValidPhoneNumber(cleaned)) {
      const parsed = parsePhoneNumber(cleaned)
      return parsed?.format('E.164') || null
    }

    return null
  } catch {
    return null
  }
}

export function extractPhoneNumbers(text: string): string[] {
  // Simple regex to find potential phone numbers
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g
  const matches = text.match(phoneRegex) || []
  
  const normalized: string[] = []
  for (const match of matches) {
    const phone = normalizePhone(match)
    if (phone && !normalized.includes(phone)) {
      normalized.push(phone)
    }
  }
  
  return normalized
}

