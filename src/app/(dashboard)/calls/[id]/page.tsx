import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { DateDisplay } from '@/components/DateDisplay'

interface CallWithRelations {
  id: string
  account_id: string
  customer_id: string
  twilio_call_sid: string
  direction: 'inbound' | 'outbound'
  from_phone: string
  to_phone: string
  started_at: string
  duration_seconds: number | null
  recording_url: string | null
  recording_status: string | null
  created_at: string
  customers: {
    id: string
    display_name: string | null
    company: string | null
  } | null
  transcripts: Array<{
    raw_text: string
  }>
}

export default async function CallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('calls')
    .select(`
      *,
      customers(id, display_name, company),
      transcripts(raw_text)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  const call = data as unknown as CallWithRelations

  // Get memories extracted from this call
  const { data: memoriesData } = await supabase
    .from('memories')
    .select('*')
    .eq('source', 'call')
    .eq('source_id', id)
    .order('created_at', { ascending: false })

  const memories = memoriesData as Array<{
    id: string
    type: 'personal' | 'business' | 'commitment'
    content: string
    created_at: string
  }> | null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/calls"
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Call with {call.customers?.display_name || call.from_phone}
          </h1>
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              call.direction === 'inbound' 
                ? 'bg-blue-500/10 text-blue-400' 
                : 'bg-green-500/10 text-green-400'
            }`}>
              {call.direction === 'inbound' ? 'Incoming' : 'Outgoing'}
            </span>
            <span><DateDisplay date={call.started_at} format="long" /></span>
            {call.duration_seconds && (
              <span>{formatDuration(call.duration_seconds)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Transcript */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Transcript
            </h2>
            
            {call.transcripts?.[0]?.raw_text ? (
              <div className="prose prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {call.transcripts[0].raw_text}
                </p>
              </div>
            ) : call.recording_status === 'pending' ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-accent mx-auto flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-primary animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-muted-foreground">Transcription in progress...</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No transcript available for this call.
              </p>
            )}
          </div>
        </div>

        {/* Extracted info */}
        <div className="space-y-6">
          {/* Customer link */}
          {call.customers && (
            <div className="bg-card rounded-xl border p-4">
              <h3 className="text-sm font-medium mb-3">Customer</h3>
              <Link
                href={`/customers/${call.customers.id}`}
                className="flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {call.customers.display_name?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="font-medium">{call.customers.display_name || 'Unknown'}</div>
                  {call.customers.company && (
                    <div className="text-sm text-muted-foreground">{call.customers.company}</div>
                  )}
                </div>
              </Link>
            </div>
          )}

          {/* Extracted memories */}
          {memories && memories.length > 0 && (
            <div className="bg-card rounded-xl border p-4">
              <h3 className="text-sm font-medium mb-3">Extracted from this call</h3>
              <ul className="space-y-2">
                {memories.map((memory) => (
                  <li key={memory.id} className="text-sm flex items-start gap-2">
                    <span className={`shrink-0 px-1.5 py-0.5 rounded text-xs ${
                      memory.type === 'personal' 
                        ? 'bg-purple-500/10 text-purple-400'
                        : memory.type === 'business'
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-orange-500/10 text-orange-400'
                    }`}>
                      {memory.type}
                    </span>
                    <span className="text-muted-foreground">{memory.content}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Call details */}
          <div className="bg-card rounded-xl border p-4">
            <h3 className="text-sm font-medium mb-3">Call Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">From</dt>
                <dd>{call.from_phone}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">To</dt>
                <dd>{call.to_phone}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Twilio SID</dt>
                <dd className="font-mono text-xs">{call.twilio_call_sid.slice(0, 20)}...</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

