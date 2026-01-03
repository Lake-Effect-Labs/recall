import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('user_id', user.id)
      .single()

    const profile = profileData as { account_id: string } | null

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    await supabase
      .from('integrations_gmail')
      .delete()
      .eq('account_id', profile.account_id as never)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Gmail Disconnect] Error:', error)
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }
}

