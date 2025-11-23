# Vercel Deployment Guide

This project is configured for deployment on Vercel with the following setup:

## Prerequisites

- A Vercel account (https://vercel.com)
- Git repository connected to your Vercel account

## Deployment Steps

### Option 1: Deploy from GitHub

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Vercel will automatically detect Next.js and use the correct settings
5. Click "Deploy"

### Option 2: Deploy using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

## Configuration

### vercel.json

The `vercel.json` file includes:

- **Memory**: 3008MB for API routes (needed for video processing)
- **Max Duration**: 300 seconds (5 minutes) for long-running conversions
- **Region**: iad1 (US East) - change this based on your target audience
- **Headers**: Cache control for API routes

### Environment Variables

No environment variables are required for basic functionality.

### Build Configuration

The project uses:
- **Framework**: Next.js 15
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node Version**: 20.x (recommended)

## Important Notes

### yt-dlp Binary

⚠️ **Important**: The `yt-dlp` binary needs to be available in the deployment environment.

For Vercel deployment, you have two options:

1. **Use a serverless-friendly alternative**: Consider using `ytdl-core` or `@distube/ytdl-core` instead
2. **Include the binary in your repo**: Add the yt-dlp binary to the `bin/` folder (not recommended for large files)

### Function Limits

Vercel has the following limits:
- Free tier: 10s execution time
- Hobby tier: 10s execution time
- Pro tier: 60s execution time
- Enterprise: Up to 900s execution time

For video conversion, you may need a **Pro or Enterprise** plan due to processing time.

### Recommended Alternatives for Vercel

If you're on the free/hobby tier, consider:

1. **Client-side download**: Use `ytdl-core` in the browser
2. **Webhook/Queue system**: Use a background job service
3. **Different platform**: Deploy to Railway, Render, or a VPS where you have more control

## Testing Locally

Before deploying, test the build locally:

```bash
# Run tests
npm test

# Build the project
npm run build

# Start production server
npm start
```

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Verify Node version compatibility
- Check build logs for specific errors

### API Timeouts

- Increase function duration in `vercel.json`
- Consider upgrading Vercel plan
- Optimize video processing code

### Binary Not Found

- Ensure `yt-dlp` binary is accessible
- Check file permissions
- Verify path in `route.ts`

## Post-Deployment

After deployment:

1. Test the API endpoint: `https://your-domain.vercel.app/api/convert?url=...`
2. Check Vercel function logs for any errors
3. Monitor usage and performance metrics
4. Set up custom domain (optional)

## Support

For issues:
- Check Vercel logs: https://vercel.com/dashboard
- Review Next.js documentation: https://nextjs.org/docs
- Check project README for additional info
