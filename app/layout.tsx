import type { Metadata } from 'next'

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
      <body>{children}</body>
    </html>
  )
}
