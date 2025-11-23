import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '@/lib/youtube-oauth'

/**
 * OAuth Callback Handler
 * This endpoint handles the OAuth redirect and exchanges the code for tokens
 *
 * Usage:
 * 1. Add this URL to Google Cloud Console authorized redirect URIs:
 *    https://yourdomain.com/api/auth/callback
 * 2. Visit: https://accounts.google.com/o/oauth2/v2/auth?
 *    client_id=YOUR_CLIENT_ID&
 *    redirect_uri=https://yourdomain.com/api/auth/callback&
 *    response_type=code&
 *    scope=https://www.googleapis.com/auth/youtube.readonly&
 *    access_type=offline&
 *    prompt=consent
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.json({ error: `OAuth error: ${error}` }, { status: 400 })
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json({
      error: 'OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
    }, { status: 500 })
  }

  const redirectUri = `${request.nextUrl.origin}/api/auth/callback`

  try {
    const tokens = await exchangeCodeForTokens(code, clientId, clientSecret, redirectUri)

    // Return the tokens for the user to save
    return NextResponse.json({
      success: true,
      message: 'OAuth successful! Save these tokens as environment variables:',
      tokens: {
        GOOGLE_REFRESH_TOKEN: tokens.refresh_token,
        GOOGLE_CLIENT_ID: clientId,
        GOOGLE_CLIENT_SECRET: clientSecret,
      },
      instructions: [
        '1. Add these to your Vercel environment variables',
        '2. Redeploy your application',
        '3. The app will now auto-refresh tokens automatically!',
        '',
        'IMPORTANT: Save the GOOGLE_REFRESH_TOKEN - it will not be shown again!'
      ]
    })
  } catch (error) {
    console.error('OAuth exchange error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to exchange code for tokens'
    }, { status: 500 })
  }
}
