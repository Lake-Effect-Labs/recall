'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AccountSettings({ 
  accountId, 
  accountName 
}: { 
  accountId: string
  accountName: string 
}) {
  const [name, setName] = useState(accountName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleSave() {
    setSaving(true)
    await supabase
      .from('accounts')
      .update({ name } as never)
      .eq('id', accountId as never)
    setSaving(false)
    setSaved(true)
    router.refresh()
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="accountName" className="block text-sm font-medium mb-2">
          Account Name
        </label>
        <input
          id="accountName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-accent border border-border focus:border-primary transition-colors"
          placeholder="My Business"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving || name === accountName}
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
      </button>
    </div>
  )
}

