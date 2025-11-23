# Troubleshooting Guide

## "Sign in to confirm you're not a bot" Error

This error occurs when YouTube detects automated requests and blocks them with bot detection measures.

### Solutions

#### Option 1: Use OAuth Token (Recommended)

1. **Get an OAuth Token:**
   - Go to [Google OAuth Playground](https://developers.google.com/oauthplayground/)
   - In "Step 1", find and select **YouTube Data API v3** → All available scopes
   - Click **"Authorize APIs"** and sign in with your Google account
   - In "Step 2", click **"Exchange authorization code for tokens"**
   - Copy the **"Access token"** value

2. **Add to Vercel:**
   - Go to your Vercel project → Settings → Environment Variables
   - Add a new variable:
     - Name: `YOUTUBE_OAUTH_TOKEN`
     - Value: (paste your OAuth token)
   - Redeploy your application

3. **For Local Development:**
   - Create a `.env.local` file in your project root:
     ```bash
     YOUTUBE_OAUTH_TOKEN=your_oauth_token_here
     ```

**Note:** OAuth tokens expire after 1 hour by default. For production use, consider:
- Using a service account with longer-lived credentials
- Implementing automatic token refresh
- Using a proxy service

#### Option 2: Use a Proxy Service

If OAuth tokens are not feasible, consider using a third-party API service like:
- [RapidAPI YouTube APIs](https://rapidapi.com/hub/youtube)
- [YouTube API alternatives](https://www.abstraction.io/)

These services handle bot detection for you but may have usage limits or costs.

#### Option 3: Try Different Videos

Sometimes the issue is video-specific. Try with:
- Publicly available, popular videos
- Videos without age restrictions
- Recently uploaded videos

### Current Implementation

The app uses `@distube/ytdl-core` with:
- Custom user agent to appear more like a real browser
- Agent with cookies support
- OAuth token support (if `YOUTUBE_OAUTH_TOKEN` is set)

### Rate Limiting

YouTube may also rate-limit requests. If you encounter errors:
- Wait a few minutes between requests
- Don't make too many requests in a short time
- Consider implementing request queuing or caching

### Still Having Issues?

If the error persists:
1. Check Vercel logs for detailed error messages
2. Verify the YouTube URL is valid and publicly accessible
3. Try the video in a regular YouTube downloader to confirm it's downloadable
4. Consider switching to a different library like `youtube-dl` or a third-party API service

## Other Common Issues

### Timeout Errors (10 second limit)

**Problem:** Large videos fail with timeout errors on Vercel Hobby plan.

**Solution:**
- The Hobby plan has a 10-second function timeout
- Try shorter videos or smaller formats
- Upgrade to Vercel Pro for 60-second timeout
- Consider using a background job queue for longer videos

### Memory Limit Errors

**Problem:** Very large videos exceed the 1GB memory limit.

**Solution:**
- Current settings are optimized for Hobby plan (1024MB)
- Use WebM format (usually smaller than M4A)
- Upgrade to Vercel Pro for higher limits if needed
- Consider streaming directly instead of buffering

### Build Errors

**Problem:** Build fails during deployment.

**Solution:**
```bash
# Clear cache and rebuild locally
rm -rf .next node_modules
npm install
npm run build

# Check for TypeScript errors
npm run type-check

# Run tests
npm test
```

## Getting Help

If you continue experiencing issues:
1. Check the [GitHub Issues](https://github.com/HuynhThong1/tools-convert/issues)
2. Create a new issue with:
   - Error message
   - Steps to reproduce
   - YouTube URL (if public)
   - Deployment logs
