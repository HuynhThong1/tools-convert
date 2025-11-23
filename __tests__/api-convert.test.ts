/**
 * API Route Test
 * Tests the /api/convert endpoint
 */
import { GET } from '../app/api/convert/route'
import path from 'path'

// Mock yt-dlp-wrap
jest.mock('yt-dlp-wrap', () => {
  return jest.fn().mockImplementation(() => ({
    getVideoInfo: jest.fn().mockResolvedValue({
      title: 'Test Video Title',
      duration: 180
    }),
    execPromise: jest.fn().mockResolvedValue(undefined)
  }))
})

// Mock fs promises
jest.mock('fs', () => ({
  promises: {
    access: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue(Buffer.from('fake-mp3-data')),
    unlink: jest.fn().mockResolvedValue(undefined)
  }
}))

// Helper to create mock NextRequest
function createMockRequest(url: string) {
  return {
    nextUrl: new URL(url)
  } as any
}

describe('API /api/convert', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 when URL parameter is missing', async () => {
    const request = createMockRequest('http://localhost:3000/api/convert')
    const response = await GET(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Missing url parameter')
  })

  it('returns 400 when YouTube URL is invalid', async () => {
    const request = createMockRequest('http://localhost:3000/api/convert?url=https://invalid.com')
    const response = await GET(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Invalid YouTube URL')
  })

  it('processes valid YouTube URL and returns MP3 file', async () => {
    const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    const request = createMockRequest(`http://localhost:3000/api/convert?url=${encodeURIComponent(validUrl)}`)

    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('audio/mpeg')
    expect(response.headers.get('Content-Disposition')).toContain('.mp3')
    expect(response.headers.get('Content-Disposition')).toContain('Test_Video_Title')
  }, 10000)

  it('handles yt-dlp binary not found error', async () => {
    const fs = require('fs')
    fs.promises.access.mockRejectedValueOnce(new Error('ENOENT'))

    const validUrl = 'https://www.youtube.com/watch?v=test'
    const request = createMockRequest(`http://localhost:3000/api/convert?url=${encodeURIComponent(validUrl)}`)

    const response = await GET(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toContain('yt-dlp binary not found')
  })
})
