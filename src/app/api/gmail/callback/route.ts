import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { google } from 'googleapis'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=${error}`)
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=no_code`)
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`
    )

    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get user email
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const { data: userInfo } = await oauth2.userinfo.get()

    if (!tokens.refresh_token || !userInfo.email) {
      throw new Error('Missing refresh token or email')
    }

    // Get current user's account
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/login`)
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('user_id', user.id)
      .single()

    const profile = profileData as { account_id: string } | null

    if (!profile) {
      throw new Error('Profile not found')
    }

    // Upsert Gmail integration - use type assertion to bypass strict checking
    const gmailData = {
      account_id: profile.account_id,
      google_refresh_token: tokens.refresh_token,
      google_email: userInfo.email,
      last_sync_at: null,
    }
    
    await supabase
      .from('integrations_gmail')
      .upsert(gmailData as never)

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?gmail=connected`)
  } catch (error) {
    console.error('[Gmail Callback] Error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=oauth_failed`)
  }
}

