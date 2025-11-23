# YouTube to MP3 Converter

A Next.js application that converts YouTube videos to MP3 audio files using TypeScript, ytdl-core, and ffmpeg.

## Features

- 🎵 Convert YouTube videos to MP3 format
- ⚡ Built with Next.js 15 and TypeScript
- 🧪 Comprehensive unit tests with Jest
- 🚀 Automated deployment to Vercel via GitHub Actions
- 📦 Server-side audio processing with ffmpeg
- 🎨 Clean, responsive UI

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Testing**: Jest + React Testing Library
- **Audio Processing**: @distube/ytdl-core + fluent-ffmpeg + ffmpeg-static
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel

> **Note**: This project uses `@distube/ytdl-core`, a maintained fork of `ytdl-core` that provides better compatibility with YouTube's frequent API changes.

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ytbtomp3
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run unit tests
- `npm run test:integration` - Run integration test with real YouTube URL
- `npm run type-check` - Run TypeScript type checking

## Testing

The project includes comprehensive unit tests for:

- **UI Components**: Testing form interactions, error handling, and dynamic content rendering
- **API Routes**: Testing URL validation, error responses, and conversion logic

Run tests with:
```bash
npm test
```

## Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/HuynhThong1/tools-convert)

Or deploy manually:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **Configure (if needed)**
   - The project includes `vercel.json` with optimized settings
   - API routes have 5-minute timeout (300s)
   - 3GB memory allocated for video processing

### Deployment Configuration

The project includes:
- ✅ `vercel.json` - Vercel-specific configuration
- ✅ `next.config.ts` - Next.js production settings
- ✅ `.vercelignore` - Files to exclude from deployment
- ✅ Standalone output mode for optimal performance

### Important Notes for Vercel

⚠️ **Function Timeout**: Video conversion can take time. Make sure you have:
- **Pro Plan or higher** for extended function duration (60s+)
- For Free/Hobby tier, consider shorter videos or alternative approaches

⚠️ **yt-dlp Binary**: The current implementation uses `yt-dlp-wrap`. For production:
- Ensure `yt-dlp` binary is available in `/bin` folder
- Or switch to `@distube/ytdl-core` for serverless compatibility
- See `DEPLOYMENT.md` for detailed instructions

### Testing Before Deployment

```bash
# Run all tests
npm test

# Build production bundle
npm run build

# Test production build locally
npm start
```

### Alternative Deployment Options

- **Railway**: `railway up`
- **Render**: Connect GitHub repo
- **Docker**: See `DEPLOYMENT.md` for container setup
- **VPS**: Traditional server deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Deployment

### Vercel Deployment

The project is configured for automatic deployment to Vercel using GitHub Actions.

#### Setup Steps:

1. Create a Vercel account and project at [vercel.com](https://vercel.com)

2. Get your Vercel credentials:
   - Go to Vercel Dashboard → Settings → Tokens
   - Create a new token and save it as `VERCEL_TOKEN`
   - Get your `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` from `.vercel/project.json` after running `vercel link`

3. Add secrets to GitHub:
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `VERCEL_TOKEN`
     - `VERCEL_ORG_ID`
     - `VERCEL_PROJECT_ID`

4. Push to main branch to trigger deployment:
```bash
git push origin main
```

The GitHub Action will:
- Run type checking
- Execute all tests
- Deploy to Vercel (on main branch only)

## How It Works

1. User pastes a YouTube URL into the input field
2. The app validates the URL on the client side
3. When submitted, the browser navigates to `/api/convert?url=...`
4. The API route:
   - Validates the YouTube URL using `ytdl-core`
   - Fetches the highest quality audio stream
   - Transcodes it to MP3 using `ffmpeg`
   - Streams the MP3 back to the browser for download
5. The browser downloads the resulting MP3 file

## Project Structure

```
ytbtomp3/
├── app/
│   ├── api/
│   │   └── convert/
│   │       └── route.ts          # API route for YouTube to MP3 conversion
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Home page component
├── __tests__/
│   ├── page.test.tsx             # Tests for home page
│   └── convert.test.ts           # Tests for API route
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions workflow
├── jest.config.js                # Jest configuration
├── jest.setup.ts                 # Jest setup file
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
└── package.json                  # Project dependencies
```

## Environment Variables

No environment variables are required for basic functionality. The application uses `ffmpeg-static` which bundles ffmpeg automatically.

## Limitations

- YouTube's rate limiting may affect availability
- Large videos may take longer to process
- Server resources limit concurrent conversions

## Troubleshooting

### "Could not extract functions" Error

This error occurs when YouTube changes their player code. The project uses `@distube/ytdl-core`, which is actively maintained and usually updates quickly. If you encounter this:

1. Update to the latest version:
   ```bash
   npm update @distube/ytdl-core
   ```

2. Check for updates at: https://github.com/distubejs/ytdl-core

3. As a temporary workaround, you may see warnings about decipher functions, but the download should still work for most videos.

### Testing with Real URLs

Run the integration test to verify functionality with a real YouTube URL:

```bash
npm run test:integration
```

This will test URL validation, video info fetching, and format availability.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Acknowledgments

- [ytdl-core](https://github.com/fent/node-ytdl-core) for YouTube downloading
- [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) for audio processing
- [Next.js](https://nextjs.org/) for the React framework
