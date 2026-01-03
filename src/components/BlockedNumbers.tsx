'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { normalizePhone } from '@/lib/utils/phone'

interface BlockedNumber {
  id: string
  phone_e164: string
  label: string | null
}

export function BlockedNumbers({ accountId }: { accountId: string }) {
  const [blockedNumbers, setBlockedNumbers] = useState<BlockedNumber[]>([])
  const [phoneNumber, setPhoneNumber] = useState('')
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadBlockedNumbers()
  }, [])

  async function loadBlockedNumbers() {
    const { data, error } = await supabase
      .from('blocked_numbers')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading blocked numbers:', error)
    } else {
      setBlockedNumbers(data || [])
    }
  }

  async function handleAdd() {
    if (!phoneNumber.trim()) {
      setError('Phone number is required')
      return
    }

    const normalized = normalizePhone(phoneNumber)
    if (!normalized) {
      setError('Invalid phone number format')
      return
    }

    setLoading(true)
    setError(null)

    const { error: insertError } = await supabase
      .from('blocked_numbers')
      .insert({
        account_id: accountId,
        phone_e164: normalized,
        label: label.trim() || null,
      })

    if (insertError) {
      setError(insertError.message)
    } else {
      setPhoneNumber('')
      setLabel('')
      loadBlockedNumbers()
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this number from blocked list?')) return

    const { error } = await supabase
      .from('blocked_numbers')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      loadBlockedNumbers()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Blocked numbers won't create customer records. Use this for personal contacts like family members.
        </p>
      </div>

      {/* Add blocked number */}
      <div className="space-y-3">
        <div>
          <label htmlFor="blockPhone" className="block text-sm font-medium mb-2">
            Phone Number
          </label>
          <input
            id="blockPhone"
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-accent border border-border focus:border-primary transition-colors"
            placeholder="+1234567890 or (123) 456-7890"
          />
        </div>

        <div>
          <label htmlFor="blockLabel" className="block text-sm font-medium mb-2">
            Label (optional)
          </label>
          <input
            id="blockLabel"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-accent border border-border focus:border-primary transition-colors"
            placeholder="e.g., Family, Personal, etc."
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={loading || !phoneNumber.trim()}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding...' : 'Add Blocked Number'}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* List of blocked numbers */}
      {blockedNumbers.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">Blocked Numbers ({blockedNumbers.length})</h3>
          <div className="space-y-2">
            {blockedNumbers.map((blocked) => (
              <div
                key={blocked.id}
                className="flex items-center justify-between p-3 rounded-lg bg-accent border border-border"
              >
                <div>
                  <div className="font-medium">{blocked.phone_e164}</div>
                  {blocked.label && (
                    <div className="text-sm text-muted-foreground">{blocked.label}</div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(blocked.id)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {blockedNumbers.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-8">
          No blocked numbers yet. Add numbers above to exclude them from customer tracking.
        </div>
      )}
    </div>
  )
}

