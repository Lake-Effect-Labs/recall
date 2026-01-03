import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DateDisplay } from '@/components/DateDisplay'

interface CallListItem {
  id: string
  direction: 'inbound' | 'outbound'
  from_phone: string
  to_phone: string
  started_at: string
  duration_seconds: number | null
  customers: {
    display_name: string | null
    company: string | null
  } | null
  transcripts: Array<{ id: string }>
}

export default async function CallsPage() {
  const supabase = await createClient()

  const { data: callsData } = await supabase
    .from('calls')
    .select(`
      *,
      customers(display_name, company),
      transcripts(id)
    `)
    .order('started_at', { ascending: false })
    .limit(50)

  const calls = callsData as unknown as CallListItem[] | null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calls</h1>
        <p className="text-muted-foreground">Recent phone calls and transcripts</p>
      </div>

      {!calls || calls.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent mx-auto flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No calls yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Set up your Twilio integration in Settings to start receiving calls.
            Incoming calls will be recorded and transcribed automatically.
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Set up Twilio
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-xl border divide-y divide-border">
          {calls.map((call) => (
            <Link
              key={call.id}
              href={`/calls/${call.id}`}
              className="block p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    call.direction === 'inbound' 
                      ? 'bg-blue-500/10 text-blue-400' 
                      : 'bg-green-500/10 text-green-400'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {call.direction === 'inbound' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      )}
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">
                      {call.customers?.display_name || call.from_phone}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className={call.direction === 'inbound' ? 'text-blue-400' : 'text-green-400'}>
                        {call.direction === 'inbound' ? 'Incoming' : 'Outgoing'}
                      </span>
                      <span>•</span>
                      <span>{call.from_phone} → {call.to_phone}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    <DateDisplay date={call.started_at} format="short" />
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 justify-end">
                    {call.duration_seconds && (
                      <span>{formatDuration(call.duration_seconds)}</span>
                    )}
                    {call.transcripts && call.transcripts.length > 0 && (
                      <span className="text-primary">Transcribed</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

