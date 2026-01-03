'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DateDisplay } from './DateDisplay'

interface GmailIntegration {
  account_id: string
  google_email: string | null
  last_sync_at: string | null
}

export function GmailSettings({ 
  integration,
}: { 
  integration: GmailIntegration | null
}) {
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const router = useRouter()

  async function handleConnect() {
    window.location.href = '/api/gmail/auth'
  }

  async function handleSync() {
    setSyncing(true)
    setError(null)
    setSyncResult(null)

    try {
      const res = await fetch('/api/gmail/sync', { method: 'POST' })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Sync failed')
      }
      
      setSyncResult(`Synced ${data.emailsProcessed} emails`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  async function handleDisconnect() {
    const res = await fetch('/api/gmail/disconnect', { method: 'POST' })
    if (res.ok) {
      router.refresh()
    }
  }

  if (!integration?.google_email) {
    return (
      <div className="space-y-4">
        <div className="bg-accent rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">How it works</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Click "Connect Gmail" below</li>
                <li>Sign in with your Google account</li>
                <li>Grant read-only access to your inbox</li>
                <li>We'll automatically sync customer emails</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-sm text-blue-400 flex items-start gap-2">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              <strong>Privacy:</strong> We only request read-only access. We never send emails or modify your inbox. 
              You can disconnect anytime.
            </span>
          </p>
        </div>

        <button
          onClick={handleConnect}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white text-gray-800 font-medium hover:bg-gray-100 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Connect Gmail
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Connected: {integration.google_email}
      </div>

      {integration.last_sync_at && (
        <p className="text-sm text-muted-foreground">
          Last synced: <DateDisplay date={integration.last_sync_at} format="short" />
        </p>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {syncResult && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          {syncResult}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          Disconnect
        </button>
      </div>
    </div>
  )
}

