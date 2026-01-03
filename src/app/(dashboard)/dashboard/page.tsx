import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CustomerSearch } from '@/components/CustomerSearch'
import { DateDisplay } from '@/components/DateDisplay'

interface CustomerListItem {
  id: string
  display_name: string | null
  company: string | null
  summary: string | null
  last_interaction_at: string | null
  customer_phones: Array<{ phone_e164: string }>
  customer_emails: Array<{ email_lower: string }>
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  // Get customers with their phone and email counts
  let query = supabase
    .from('customers')
    .select(`
      *,
      customer_phones(phone_e164),
      customer_emails(email_lower)
    `)
    .order('last_interaction_at', { ascending: false, nullsFirst: false })
    .limit(50)

  if (q) {
    // Search by name, company, phone, or email
    query = query.or(`display_name.ilike.%${q}%,company.ilike.%${q}%`)
  }

  const { data: customersData, error } = await query

  if (error) {
    console.error('Error fetching customers:', error)
  }

  const customers = customersData as unknown as CustomerListItem[] | null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Your relationship memory at a glance</p>
        </div>
      </div>

      <CustomerSearch initialQuery={q || ''} />

      {!customers || customers.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent mx-auto flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No customers yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {q 
              ? `No customers found matching "${q}"`
              : 'Customers will appear here automatically when they call you or you sync emails. Set up Twilio and Gmail integrations in Settings to get started.'
            }
          </p>
          {!q && (
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Go to Settings
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {customers.map((customer, index) => (
            <Link
              key={customer.id}
              href={`/customers/${customer.id}`}
              className={`block bg-card rounded-xl border p-6 hover:border-primary/50 hover:bg-card/80 transition-all animate-fade-in`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg shrink-0">
                    {customer.display_name?.charAt(0)?.toUpperCase() || customer.customer_phones?.[0]?.phone_e164?.slice(-4) || '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {customer.display_name || customer.customer_phones?.[0]?.phone_e164 || 'Unknown'}
                    </h3>
                    {customer.company && (
                      <p className="text-muted-foreground text-sm">{customer.company}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      {customer.customer_phones && customer.customer_phones.length > 0 && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {customer.customer_phones[0].phone_e164}
                        </span>
                      )}
                      {customer.customer_emails && customer.customer_emails.length > 0 && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {customer.customer_emails[0].email_lower}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {customer.last_interaction_at && (
                  <div className="text-sm text-muted-foreground">
                    <DateDisplay date={customer.last_interaction_at} format="relative" />
                  </div>
                )}
              </div>

              {customer.summary && (
                <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                  {customer.summary}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}


