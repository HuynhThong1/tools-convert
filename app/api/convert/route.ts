import { NextRequest, NextResponse } from 'next/server'
import ytdl from '@distube/ytdl-core'
import path from 'path'
import { promises as fs } from 'fs'
import os from 'os'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  const format = request.nextUrl.searchParams.get('format') || 'webm'

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  // Basic YouTube URL validation
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
  }

  // Validate format (only webm and m4a work with ytdl-core, no mp3 conversion)
  const validFormats = ['webm', 'm4a']
  if (!validFormats.includes(format)) {
    return NextResponse.json({
      error: 'Invalid format. Use: webm or m4a (mp3 conversion not available on serverless)'
    }, { status: 400 })
  }

  try {
    console.log('Processing:', url)

    // Validate URL
    if (!ytdl.validateURL(url)) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    // Get video info
    console.log('Fetching video info...')
    const info = await ytdl.getInfo(url)
    const title = info.videoDetails.title
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 100) || 'audio'

    console.log('Title:', info.videoDetails.title)

    // Select audio format
    const audioFormat = format === 'm4a'
      ? ytdl.chooseFormat(info.formats, {
          quality: 'highestaudio',
          filter: (fmt) => (fmt.mimeType?.includes('mp4') || fmt.mimeType?.includes('m4a')) ?? false
        })
      : ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' })

    if (!audioFormat) {
      throw new Error('No suitable audio format found')
    }

    console.log('Downloading audio...')

    // Download to buffer (better for serverless)
    const chunks: Buffer[] = []
    const stream = ytdl(url, { format: audioFormat })

    await new Promise<void>((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('end', () => resolve())
      stream.on('error', (err) => reject(err))
    })

    const fileBuffer = Buffer.concat(chunks)
    const fileExt = format === 'm4a' ? '.m4a' : '.webm'
    const contentType = format === 'm4a' ? 'audio/mp4' : 'audio/webm'

    console.log('Sending file...')

    // Return the audio file
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${title}${fileExt}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to process video'
    }, { status: 500 })
  }
}
