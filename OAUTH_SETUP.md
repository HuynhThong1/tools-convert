# YouTube OAuth Setup with Auto-Refresh

This guide will help you set up automatic OAuth token management so you never have to manually refresh tokens.

## Prerequisites

1. A Google Cloud Project
2. YouTube Data API v3 enabled
3. OAuth 2.0 credentials

## Step-by-Step Setup

### 1. Create Google Cloud Project & Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3:
   - Go to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Add Authorized redirect URIs:
     - For local testing: `http://localhost:3000/api/auth/callback`
     - For production: `https://yourdomain.com/api/auth/callback`
   - Click "Create"
   - Save your **Client ID** and **Client Secret**

### 2. Get Your Refresh Token

#### Method 1: Using the Built-in Callback (Easier)

1. Add your credentials to `.env.local`:
   ```bash
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

2. Start your app locally:
   ```bash
   npm run dev
   ```

3. Visit this URL in your browser (replace YOUR_CLIENT_ID):
   ```
   https://accounts.google.com/o/oauth2/v2/auth?client_id=654239162010-n1kb5cu1mjjbei7m2h8rqkelo1rg2nj1.apps.googleusercontent.com&redirect_uri=https://tools-convert.vercel.app/api/auth/callback&response_type=code&scope=https://www.googleapis.com/auth/youtube.readonly&access_type=offline&prompt=consent
   ```

4. Sign in with your Google account and authorize the app

5. You'll see a page with your tokens - **SAVE THE REFRESH TOKEN**

6. Add all three environment variables to your `.env.local`:
   ```bash
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REFRESH_TOKEN=your_refresh_token_here
   ```

#### Method 2: Using OAuth Playground (Alternative)

1. Go to [Google OAuth Playground](https://developers.google.com/oauthplayground/)

2. Click the settings icon (⚙️) in the top right

3. Check "Use your own OAuth credentials"

4. Enter your Client ID and Client Secret

5. In Step 1:
   - Find "YouTube Data API v3"
   - Select all scopes or just `https://www.googleapis.com/auth/youtube.readonly`
   - Click "Authorize APIs"
   - Sign in with your Google account

6. In Step 2:
   - Click "Exchange authorization code for tokens"
   - Copy the **Refresh token** (only shown once!)

7. Add to your environment variables:
   ```bash
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REFRESH_TOKEN=your_refresh_token
   ```

### 3. Deploy to Vercel

1. Add environment variables to Vercel:
   - Go to your project → Settings → Environment Variables
   - Add all three variables:
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `GOOGLE_REFRESH_TOKEN`

2. Redeploy your application

3. Done! Tokens will now auto-refresh automatically 🎉

## How It Works

1. **First Request**: App uses refresh token to get a new access token
2. **Token Cached**: Access token is cached in memory with expiration time
3. **Subsequent Requests**: Cached token is used (no API calls needed)
4. **Before Expiry**: When token is about to expire (1 minute before), app automatically refreshes it
5. **Never Expires**: As long as refresh token is valid, access tokens auto-refresh forever!

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLIENT_ID` | For auto-refresh | OAuth 2.0 Client ID from Google Cloud |
| `GOOGLE_CLIENT_SECRET` | For auto-refresh | OAuth 2.0 Client Secret from Google Cloud |
| `GOOGLE_REFRESH_TOKEN` | For auto-refresh | Long-lived refresh token (never expires) |
| `YOUTUBE_OAUTH_TOKEN` | Alternative | Manual access token (expires in 1 hour) |

## Testing

Test that auto-refresh is working:

```bash
# Check Vercel logs after deployment
# You should see "Refreshing OAuth token..." when token expires
```

## Troubleshooting

### "Invalid refresh token"
- Refresh token was revoked or expired
- Re-run OAuth flow with `prompt=consent` parameter

### "Token refresh failed"
- Check Client ID and Client Secret are correct
- Verify refresh token is properly saved
- Check Vercel logs for detailed error

### "Unauthorized" errors
- Make sure YouTube Data API v3 is enabled
- Verify OAuth consent screen is configured
- Check the scope includes YouTube access

## Security Notes

⚠️ **IMPORTANT**:
- Never commit credentials to Git
- Use environment variables for all sensitive data
- Refresh tokens are like passwords - keep them secret
- Rotate credentials if they're compromised

## Fallback Behavior

If OAuth auto-refresh is not configured, the app will:
1. Try to use `YOUTUBE_OAUTH_TOKEN` if set (expires in 1 hour)
2. Fall back to agent-based requests (may hit bot detection)

This ensures the app works even without OAuth, but with reduced reliability.
