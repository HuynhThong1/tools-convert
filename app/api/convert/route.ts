import { NextRequest, NextResponse } from 'next/server'
import YTDlpWrap from 'yt-dlp-wrap'
import path from 'path'
import { promises as fs } from 'fs'
import os from 'os'
import ffmpegPath from 'ffmpeg-static'

const ytDlpPath = path.join(process.cwd(), 'bin', 'yt-dlp.exe')

// Timeout wrapper
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    ),
  ])
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  const format = request.nextUrl.searchParams.get('format') || 'webm' // mp3, webm, m4a

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  // Basic YouTube URL validation
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
  }

  // Validate format
  const validFormats = ['mp3', 'webm', 'm4a']
  if (!validFormats.includes(format)) {
    return NextResponse.json({ error: 'Invalid format. Use: mp3, webm, or m4a' }, { status: 400 })
  }

  let outputPath: string | null = null

  try {
    console.log('Processing:', url)

    // Check if yt-dlp exists
    try {
      await fs.access(ytDlpPath)
    } catch {
      return NextResponse.json({
        error: 'yt-dlp binary not found. Please ensure yt-dlp.exe is in the bin/ folder.'
      }, { status: 500 })
    }

    const ytDlp = new YTDlpWrap(ytDlpPath)

    // Get video info for title
    console.log('Fetching video info...')
    const info = await withTimeout(ytDlp.getVideoInfo(url), 60000) // 60 second timeout
    const title = info.title?.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').substring(0, 100) || 'audio'

    console.log('Title:', info.title)

    // Create temp file path with title
    const timestamp = Date.now()
    const outputTemplate = path.join(os.tmpdir(), `yt_${timestamp}_${title}.%(ext)s`)

    console.log(`Starting download in ${format} format (this may take 30-60 seconds)...`)

    // Build download arguments based on format
    const downloadArgs = [
      url,
      '-o', outputTemplate,
      '--no-playlist',
      '--quiet'
    ]

    if (format === 'mp3') {
      // Convert to MP3 (requires ffmpeg)
      downloadArgs.push(
        '-x', // Extract audio
        '--audio-format', 'mp3',
        '--audio-quality', '5', // 128kbps
        '--ffmpeg-location', ffmpegPath || ''
      )
    } else if (format === 'm4a') {
      // Download m4a
      downloadArgs.push('-f', 'bestaudio[ext=m4a]/bestaudio')
    } else {
      // Download webm (default, fastest)
      downloadArgs.push('-f', 'bestaudio')
    }

    // Download audio
    await withTimeout(
      ytDlp.execPromise(downloadArgs),
      300000 // 5 minute timeout
    )

    console.log('Download complete, finding file...')

    // Find the downloaded file
    const tmpDir = os.tmpdir()
    const files = await fs.readdir(tmpDir)
    const downloadedFile = files.find(f => f.startsWith(`yt_${timestamp}_${title}.`))

    if (!downloadedFile) {
      throw new Error('Downloaded file not found')
    }

    outputPath = path.join(tmpDir, downloadedFile)
    const fileExt = path.extname(downloadedFile).toLowerCase()

    // Determine content type
    const contentType = fileExt === '.m4a' ? 'audio/mp4' :
                       fileExt === '.webm' ? 'audio/webm' : 'audio/mpeg'

    console.log('Sending file...')

    // Read the file
    const fileBuffer = await fs.readFile(outputPath)

    // Delete temp file
    await fs.unlink(outputPath)
    outputPath = null

    // Return the audio file with video title as filename
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

    // Clean up temp file if it exists
    if (outputPath) {
      try {
        await fs.unlink(outputPath)
      } catch {}
    }

    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to process video'
    }, { status: 500 })
  }
}
