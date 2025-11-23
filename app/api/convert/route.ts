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

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  // Basic YouTube URL validation
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
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

    // Create temp file path with timestamp
    const timestamp = Date.now()
    const outputTemplate = path.join(os.tmpdir(), `yt_${timestamp}.%(ext)s`)

    console.log('Starting download (this may take 30-60 seconds)...')

    // Download best audio directly without getting info first (faster)
    await withTimeout(
      ytDlp.execPromise([
        url,
        '-f', 'bestaudio', // Download best audio in native format
        '-o', outputTemplate,
        '--no-playlist',
        '--no-warnings',
        '--quiet'
      ]),
      300000 // 5 minute timeout
    )

    console.log('Download complete, finding file...')

    // Find the downloaded file (could be .webm, .m4a, etc.)
    const tmpDir = os.tmpdir()
    const files = await fs.readdir(tmpDir)
    const downloadedFile = files.find(f => f.startsWith(`yt_${timestamp}.`))

    if (!downloadedFile) {
      throw new Error('Downloaded file not found')
    }

    outputPath = path.join(tmpDir, downloadedFile)
    const fileExt = path.extname(downloadedFile).toLowerCase()

    // Determine content type
    const contentType = fileExt === '.m4a' ? 'audio/mp4' :
                       fileExt === '.webm' ? 'audio/webm' : 'audio/mpeg'

    console.log('Download complete, sending file...')

    // Read the file
    const fileBuffer = await fs.readFile(outputPath)

    // Delete temp file
    await fs.unlink(outputPath)
    outputPath = null

    // Return the audio file
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="youtube_audio${fileExt}"`,
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
