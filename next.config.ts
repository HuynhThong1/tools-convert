import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  serverExternalPackages: ['yt-dlp-wrap', 'youtube-dl-exec', 'fluent-ffmpeg'],
}

export default nextConfig
