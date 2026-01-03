'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function FollowUpActions({ followUpId }: { followUpId: string }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function updateStatus(status: 'done' | 'ignored') {
    setLoading(true)
    await supabase
      .from('follow_ups')
      .update({ status } as never)
      .eq('id', followUpId as never)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={() => updateStatus('done')}
        disabled={loading}
        className="p-1.5 rounded hover:bg-accent text-green-500 hover:text-green-400 transition-colors disabled:opacity-50"
        title="Mark as done"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </button>
      <button
        onClick={() => updateStatus('ignored')}
        disabled={loading}
        className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        title="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

