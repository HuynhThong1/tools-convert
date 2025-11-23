/**
 * YouTube OAuth Token Manager
 * Handles automatic token refresh for YouTube API access
 */

interface TokenData {
  access_token: string
  refresh_token?: string
  expires_at: number
}

let cachedToken: TokenData | null = null

/**
 * Get a valid OAuth token, refreshing if necessary
 */
export async function getValidToken(): Promise<string | null> {
  // Check if we have client credentials for auto-refresh
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  // If no refresh setup, return static token if available
  if (!clientId || !clientSecret || !refreshToken) {
    return process.env.YOUTUBE_OAUTH_TOKEN || null
  }

  // Check if cached token is still valid
  if (cachedToken && cachedToken.expires_at > Date.now() + 60000) {
    return cachedToken.access_token
  }

  // Refresh the token
  try {
    const tokenData = await refreshAccessToken(clientId, clientSecret, refreshToken)
    cachedToken = tokenData
    return tokenData.access_token
  } catch (error) {
    console.error('Failed to refresh token:', error)
    // Fallback to static token if refresh fails
    return process.env.YOUTUBE_OAUTH_TOKEN || null
  }
}

/**
 * Refresh the OAuth access token using refresh token
 */
async function refreshAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<TokenData> {
  const tokenEndpoint = 'https://oauth2.googleapis.com/token'

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token refresh failed: ${error}`)
  }

  const data = await response.json()

  return {
    access_token: data.access_token,
    refresh_token: refreshToken, // Keep the same refresh token
    expires_at: Date.now() + (data.expires_in * 1000), // Convert seconds to milliseconds
  }
}

/**
 * Exchange authorization code for tokens (one-time setup)
 * This is used during initial OAuth setup
 */
export async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ access_token: string; refresh_token: string }> {
  const tokenEndpoint = 'https://oauth2.googleapis.com/token'

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Code exchange failed: ${error}`)
  }

  const data = await response.json()

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  }
}
