import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FollowUpActions } from '@/components/FollowUpActions'
import { DateDisplay } from '@/components/DateDisplay'
import { DeleteCustomerButton } from '@/components/DeleteCustomerButton'

interface CustomerWithRelations {
  id: string
  account_id: string
  display_name: string | null
  company: string | null
  summary: string | null
  last_interaction_at: string | null
  created_at: string
  customer_phones: Array<{ phone_e164: string }>
  customer_emails: Array<{ email_lower: string }>
}

interface CallWithTranscript {
  id: string
  direction: 'inbound' | 'outbound'
  started_at: string
  duration_seconds: number | null
  transcripts: Array<{ raw_text: string }>
}

interface EmailData {
  id: string
  direction: 'sent' | 'received'
  sent_at: string | null
  created_at: string
  subject: string | null
  body_snippet: string | null
}

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch customer with related data
  const { data: customerData, error } = await supabase
    .from('customers')
    .select(`
      *,
      customer_phones(phone_e164),
      customer_emails(email_lower)
    `)
    .eq('id', id)
    .single()

  if (error || !customerData) {
    notFound()
  }

  const customer = customerData as unknown as CustomerWithRelations

  // Fetch memories grouped by type
  const { data: memoriesData } = await supabase
    .from('memories')
    .select('*')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })

  const memories = memoriesData as Array<{
    id: string
    type: 'personal' | 'business' | 'commitment'
    content: string
    created_at: string
  }> | null

  // Fetch pending follow-ups
  const { data: followUpsData } = await supabase
    .from('follow_ups')
    .select('*')
    .eq('customer_id', id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  const followUps = followUpsData as Array<{
    id: string
    suggestion: string
    created_at: string
  }> | null

  // Fetch recent calls
  const { data: calls } = await supabase
    .from('calls')
    .select('*, transcripts(raw_text)')
    .eq('customer_id', id)
    .order('started_at', { ascending: false })
    .limit(10)

  // Fetch recent emails
  const { data: emails } = await supabase
    .from('emails')
    .select('*')
    .eq('customer_id', id)
    .order('sent_at', { ascending: false })
    .limit(10)

  // Group memories by type
  const personalFacts = memories?.filter(m => m.type === 'personal') || []
  const businessContext = memories?.filter(m => m.type === 'business') || []
  const commitments = memories?.filter(m => m.type === 'commitment') || []

  // Build timeline
  const callsTyped = (calls || []) as unknown as CallWithTranscript[]
  const emailsTyped = (emails || []) as unknown as EmailData[]

  const timeline = [
    ...callsTyped.map(call => ({
      type: 'call' as const,
      id: call.id,
      date: new Date(call.started_at),
      data: call,
    })),
    ...emailsTyped.map(email => ({
      type: 'email' as const,
      id: email.id,
      date: new Date(email.sent_at || email.created_at),
      data: email,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              {customer.display_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {customer.display_name || 'Unknown Customer'}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground text-sm">
                {customer.company && <span>{customer.company}</span>}
                {customer.customer_phones?.[0] && (
                  <span>{customer.customer_phones[0].phone_e164}</span>
                )}
                {customer.customer_emails?.[0] && (
                  <span>{customer.customer_emails[0].email_lower}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <DeleteCustomerButton 
          customerId={customer.id} 
          customerName={customer.display_name || 'this customer'} 
        />
      </div>

      {/* Pre-call Brief Card */}
      <div className="bg-gradient-to-br from-primary/10 via-card to-card rounded-xl border border-primary/20 p-6 glow animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h2 className="text-lg font-semibold">Pre-Call Brief</h2>
        </div>

        {customer.summary ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">{customer.summary}</p>

            {/* Key points */}
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              {/* Last interaction */}
              {customer.last_interaction_at && (
                <div className="bg-background/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Last Contact</div>
                  <div className="font-medium"><DateDisplay date={customer.last_interaction_at} format="short" /></div>
                </div>
              )}

              {/* Open commitments count */}
              {commitments.length > 0 && (
                <div className="bg-background/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Open Commitments</div>
                  <div className="font-medium">{commitments.length} items</div>
                </div>
              )}
            </div>

            {/* Pending follow-ups */}
            {followUps && followUps.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Suggested Next Actions
                </h3>
                <ul className="space-y-2">
                  {followUps.map((fu: { id: string; suggestion: string; created_at: string }) => (
                    <li key={fu.id} className="flex items-start gap-3 bg-background/50 rounded-lg p-3">
                      <div className="flex-1 text-sm">{fu.suggestion}</div>
                      <FollowUpActions followUpId={fu.id} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No interaction data yet. Brief will appear after calls or emails are processed.
          </p>
        )}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column - Memories */}
        <div className="lg:col-span-1 space-y-6">
          {/* Personal Facts */}
          <MemorySection
            title="Personal Facts"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            memories={personalFacts}
          />

          {/* Business Context */}
          <MemorySection
            title="Business Context"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            memories={businessContext}
          />

          {/* Commitments */}
          <MemorySection
            title="Open Commitments"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            memories={commitments}
          />
        </div>

        {/* Right column - Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Timeline
            </h2>

            {timeline.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No interactions yet
              </p>
            ) : (
              <div className="space-y-4">
                {timeline.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="border-l-2 border-border pl-4 py-2">
                    {item.type === 'call' ? (
                      <CallTimelineItem call={item.data} />
                    ) : (
                      <EmailTimelineItem email={item.data} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MemorySection({
  title,
  icon,
  memories,
}: {
  title: string
  icon: React.ReactNode
  memories: Array<{ id: string; content: string; created_at: string }>
}) {
  return (
    <div className="bg-card rounded-xl border p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
        {icon}
        {title}
      </h3>
      {memories.length === 0 ? (
        <p className="text-muted-foreground text-sm">None yet</p>
      ) : (
        <ul className="space-y-2">
          {memories.slice(0, 5).map((memory) => (
            <li key={memory.id} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>{memory.content}</span>
            </li>
          ))}
          {memories.length > 5 && (
            <li className="text-xs text-muted-foreground">
              +{memories.length - 5} more
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

function CallTimelineItem({ call }: { call: CallWithTranscript }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
          call.direction === 'inbound' 
            ? 'bg-blue-500/10 text-blue-400' 
            : 'bg-green-500/10 text-green-400'
        }`}>
          {call.direction === 'inbound' ? 'Incoming' : 'Outgoing'} Call
        </span>
        <span className="text-muted-foreground">
          <DateDisplay date={call.started_at} format="short" />
        </span>
        {call.duration_seconds && (
          <span className="text-muted-foreground">
            ({formatDuration(call.duration_seconds)})
          </span>
        )}
      </div>
      {call.transcripts?.[0]?.raw_text && (
        <Link 
          href={`/calls/${call.id}`}
          className="text-sm text-muted-foreground mt-1 line-clamp-2 hover:text-foreground transition-colors block"
        >
          {call.transcripts[0].raw_text.slice(0, 200)}...
        </Link>
      )}
    </div>
  )
}

function EmailTimelineItem({ email }: { email: EmailData }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
          email.direction === 'received' 
            ? 'bg-purple-500/10 text-purple-400' 
            : 'bg-orange-500/10 text-orange-400'
        }`}>
          {email.direction === 'received' ? 'Received' : 'Sent'} Email
        </span>
        <span className="text-muted-foreground">
          <DateDisplay date={email.sent_at || email.created_at} format="short" />
        </span>
      </div>
      {email.subject && (
        <p className="text-sm font-medium mt-1">{email.subject}</p>
      )}
      {email.body_snippet && (
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {email.body_snippet}
        </p>
      )}
    </div>
  )
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

