# Complete Setup Guide

This guide will walk you through setting up the YouTube to Audio Converter with auto-refreshing OAuth tokens.

## Prerequisites Checklist

- [ ] Node.js 20.x or higher installed
- [ ] Git installed
- [ ] A Google account
- [ ] (Optional) A Vercel account for deployment

## Step 1: Local Development Setup

### 1.1 Install Dependencies

```bash
npm install
```

### 1.2 Copy Environment File

```bash
# Copy the example environment file
cp .env.example .env.local
```

### 1.3 Test Without OAuth (Optional)

```bash
# Start development server
npm run dev

# Open http://localhost:3000
# The app will work but may encounter "bot detection" errors
```

## Step 2: Google Cloud Setup (For OAuth)

### 2.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `youtube-audio-converter`
4. Click "Create"
5. Wait for project creation to complete

### 2.2 Enable YouTube Data API

1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "YouTube Data API v3"
3. Click on it
4. Click "Enable"
5. Wait for activation

### 2.3 Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type (unless you have Google Workspace)
3. Click "Create"

**App Information:**
- App name: `YouTube Audio Converter`
- User support email: (your email)
- Developer contact: (your email)

4. Click "Save and Continue"

**Scopes:**
5. Click "Add or Remove Scopes"
6. Filter for "YouTube Data API v3"
7. Select: `https://www.googleapis.com/auth/youtube.readonly`
8. Click "Update" → "Save and Continue"

**Test Users (for development):**
9. Click "Add Users"
10. Add your email address
11. Click "Save and Continue"
12. Review and click "Back to Dashboard"

### 2.4 Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: `YouTube Audio Converter Client`

**Authorized JavaScript origins:**
```
http://localhost:3000
https://yourdomain.com
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback
https://yourdomain.com/api/auth/callback
```

5. Click "Create"
6. **SAVE** your Client ID and Client Secret!

## Step 3: Get Refresh Token

### Method A: Using Built-in Callback (Easiest)

1. **Add credentials to `.env.local`:**
```bash
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

2. **Start your app:**
```bash
npm run dev
```

3. **Visit the OAuth URL:**

Replace `YOUR_CLIENT_ID` with your actual Client ID:

```
http://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/api/auth/callback&response_type=code&scope=https://www.googleapis.com/auth/youtube.readonly&access_type=offline&prompt=consent
```

4. **Sign in and authorize:**
- Click "Continue" (if app is unverified)
- Select your Google account
- Click "Allow"

5. **Copy your tokens:**
- You'll see a page with your tokens
- **Copy the `GOOGLE_REFRESH_TOKEN`** (very important!)
- Save all three values

6. **Update `.env.local`:**
```bash
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

### Method B: Using OAuth Playground

1. Go to [Google OAuth Playground](https://developers.google.com/oauthplayground/)

2. Click settings icon (⚙️) in top right

3. Check "Use your own OAuth credentials"

4. Enter your credentials:
   - OAuth Client ID: (paste your Client ID)
   - OAuth Client secret: (paste your Client Secret)

5. In Step 1:
   - Scroll to "YouTube Data API v3"
   - Check: `https://www.googleapis.com/auth/youtube.readonly`
   - Click "Authorize APIs"
   - Sign in and allow access

6. In Step 2:
   - Click "Exchange authorization code for tokens"
   - **Copy the Refresh token** (only shown once!)

7. Update `.env.local`:
```bash
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

## Step 4: Test the Setup

### 4.1 Restart Development Server

```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

### 4.2 Test a Download

1. Go to http://localhost:3000
2. Paste a YouTube URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
3. Select format (WebM or M4A)
4. Click "Download Audio"
5. If successful, you're all set! 🎉

### 4.3 Check Logs

```bash
# In the terminal running the dev server, you should see:
# Processing: https://www.youtube.com/watch?v=...
# Fetching video info...
# Title: ...
# Downloading audio...
# Sending file...
```

## Step 5: Run Tests

```bash
# Run all tests
npm test

# You should see:
# Test Suites: 2 passed, 2 total
# Tests:       12 passed, 12 total
```

## Step 6: Deploy to Vercel

### 6.1 Connect to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit with OAuth setup"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/your-repo.git
git branch -M main
git push -u origin main
```

### 6.2 Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 6.3 Add Environment Variables

In Vercel project settings → Environment Variables, add:

```bash
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

**Important:** Add these to all environments (Production, Preview, Development)

### 6.4 Update OAuth Redirect URIs

1. Go back to Google Cloud Console
2. "APIs & Services" → "Credentials"
3. Click on your OAuth Client ID
4. Add to "Authorized redirect URIs":
```
https://your-vercel-app.vercel.app/api/auth/callback
```
5. Click "Save"

### 6.5 Deploy

```bash
# Push to trigger deployment
git push origin main

# Or use Vercel CLI
npx vercel --prod
```

## Step 7: Verify Production

1. Visit your Vercel URL
2. Test downloading a YouTube video
3. Check Vercel logs for any errors
4. Monitor function duration (should be under 10 seconds for Hobby plan)

## Troubleshooting

### "Invalid client" error
- Check Client ID and Client Secret are correct
- Verify they match in both Google Cloud Console and `.env.local`

### "Redirect URI mismatch" error
- Ensure redirect URI in Google Cloud Console matches exactly
- Check for trailing slashes
- Verify HTTP vs HTTPS

### "Sign in to confirm you're not a bot" error
- OAuth is not configured properly
- Check all three environment variables are set
- Verify refresh token is valid

### "Token refresh failed" error
- Refresh token may be expired or revoked
- Re-run OAuth flow with `prompt=consent`
- Check Client Secret is correct

### Tests failing
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm test
```

### Build failing on Vercel
- Check environment variables are set in Vercel
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

## Quick Commands Reference

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server

# Testing
npm test             # Run tests once
npm run test:watch   # Run tests in watch mode

# Linting & Type checking
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check

# Deployment
git push origin main # Auto-deploy via GitHub Actions
npx vercel --prod   # Deploy directly to Vercel
```

## Security Checklist

- [x] `.env.local` is in `.gitignore`
- [x] Never commit credentials to Git
- [x] Use environment variables in Vercel
- [x] Enable OAuth consent screen
- [x] Limit API scopes to minimum required
- [x] Keep refresh tokens secure
- [x] Rotate credentials if compromised

## Next Steps

- ✅ Setup complete!
- 📖 Read [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- 📚 Review [OAUTH_SETUP.md](./OAUTH_SETUP.md) for advanced configuration
- 🚀 Start building features!

## Support

- **Issues:** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **OAuth Help:** See [OAUTH_SETUP.md](./OAUTH_SETUP.md)
- **GitHub Issues:** [Create an issue](https://github.com/HuynhThong1/tools-convert/issues)

---

**Congratulations! Your YouTube Audio Converter is now configured and ready to use!** 🎉
