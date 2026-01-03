'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TwilioIntegration {
  account_id: string
  twilio_account_sid: string
  twilio_auth_token: string
  twilio_phone_e164: string
}

export function TwilioSettings({ 
  integration,
  accountId,
  webhookUrl,
}: { 
  integration: TwilioIntegration | null
  accountId: string
  webhookUrl: string
}) {
  const [accountSid, setAccountSid] = useState(integration?.twilio_account_sid || '')
  const [authToken, setAuthToken] = useState(integration?.twilio_auth_token || '')
  const [phoneNumber, setPhoneNumber] = useState(integration?.twilio_phone_e164 || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  async function handleSave() {
    if (!accountSid || !authToken || !phoneNumber) {
      setError('All fields are required')
      return
    }

    setSaving(true)
    setError(null)

    const twilioData = {
      account_id: integration?.account_id || accountId,
      twilio_account_sid: accountSid,
      twilio_auth_token: authToken,
      twilio_phone_e164: phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`,
    }

    const { error: dbError } = await supabase
      .from('integrations_twilio')
      .upsert(twilioData as never)

    if (dbError) {
      setError(dbError.message)
    } else {
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      {integration ? (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Connected: {integration.twilio_phone_e164}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Connect your Twilio account to receive and record phone calls.
        </p>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="twilioSid" className="block text-sm font-medium mb-2">
            Account SID
          </label>
          <input
            id="twilioSid"
            type="text"
            value={accountSid}
            onChange={(e) => setAccountSid(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-accent border border-border focus:border-primary transition-colors font-mono text-sm"
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>

        <div>
          <label htmlFor="twilioToken" className="block text-sm font-medium mb-2">
            Auth Token
          </label>
          <input
            id="twilioToken"
            type="password"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-accent border border-border focus:border-primary transition-colors font-mono text-sm"
            placeholder="••••••••••••••••••••••••••••••••"
          />
        </div>

        <div>
          <label htmlFor="twilioPhone" className="block text-sm font-medium mb-2">
            Twilio Phone Number
          </label>
          <input
            id="twilioPhone"
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-accent border border-border focus:border-primary transition-colors"
            placeholder="+1234567890"
          />
        </div>

        <div className="bg-accent rounded-lg p-4">
          <p className="text-sm font-medium mb-2">Webhook URL</p>
          <p className="text-xs text-muted-foreground mb-2">
            Configure this URL in your Twilio phone number settings as the webhook for incoming calls:
          </p>
          <code className="text-xs bg-background px-2 py-1 rounded block overflow-x-auto">
            {webhookUrl}
          </code>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Twilio Settings'}
        </button>
      </div>
    </div>
  )
}

