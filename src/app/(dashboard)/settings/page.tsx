import { createClient } from '@/lib/supabase/server'
import { TwilioSettings } from '@/components/TwilioSettings'
import { AccountSettings } from '@/components/AccountSettings'
import { BlockedNumbers } from '@/components/BlockedNumbers'

interface ProfileWithAccount {
  account_id: string
  email: string | null
  accounts: { name: string | null } | null
}

interface TwilioIntegration {
  account_id: string
  twilio_account_sid: string
  twilio_auth_token: string
  twilio_phone_e164: string
}

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*, accounts(*)')
    .single()

  const profile = profileData as unknown as ProfileWithAccount | null

  const { data: twilioData } = await supabase
    .from('integrations_twilio')
    .select('*')
    .single()

  const twilioIntegration = twilioData as unknown as TwilioIntegration | null

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and integrations</p>
      </div>

      {/* Account Settings */}
      <section className="bg-card rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Account
        </h2>
        <AccountSettings 
          accountId={profile?.account_id || ''} 
          accountName={profile?.accounts?.name || ''} 
        />
      </section>

      {/* Twilio Integration */}
      <section className="bg-card rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Twilio (Phone Calls)
        </h2>
        <TwilioSettings 
          integration={twilioIntegration}
          accountId={profile?.account_id || ''}
          webhookUrl={`${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/voice`}
        />
      </section>

      {/* Blocked Numbers */}
      <section className="bg-card rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          Blocked Numbers (Personal Contacts)
        </h2>
        <BlockedNumbers accountId={profile?.account_id || ''} />
      </section>
    </div>
  )
}

