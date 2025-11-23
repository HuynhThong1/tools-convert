import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"
// Add <Analytics /> inside <body> after {children}:
// <body>{children}<Analytics /></body>

export const metadata: Metadata = {
  title: 'YouTube to MP3 Converter',
  description: 'Convert YouTube videos to MP3 audio files',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}<Analytics /></body>
    </html>
  )
}
