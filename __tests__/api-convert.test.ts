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
      title: 'Test Video Title - Amazing Song',
      duration: 180
    }),
    execPromise: jest.fn().mockResolvedValue(undefined)
  }))
})

// Mock fs promises
jest.mock('fs', () => {
  let mockFiles: string[] = []

  return {
    promises: {
      access: jest.fn().mockResolvedValue(undefined),
      readFile: jest.fn().mockResolvedValue(Buffer.from('fake-audio-data')),
      unlink: jest.fn().mockResolvedValue(undefined),
      readdir: jest.fn().mockImplementation(() => {
        // Return files that match the pattern yt_<timestamp>_<title>.<ext>
        return Promise.resolve([
          'some_other_file.txt',
          ...mockFiles
        ])
      })
    },
    __setMockFiles: (files: string[]) => { mockFiles = files }
  }
})

// Helper to create mock NextRequest
function createMockRequest(url: string) {
  return {
    nextUrl: new URL(url)
  } as any
}

describe('API /api/convert', () => {
  const FIXED_TIMESTAMP = 1234567890

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock Date.now() to return fixed timestamp
    jest.spyOn(Date, 'now').mockReturnValue(FIXED_TIMESTAMP)

    // Setup mock to return file with fixed timestamp
    const fs = require('fs')
    const mockReaddir = fs.promises.readdir as jest.Mock
    mockReaddir.mockImplementation(() => {
      return Promise.resolve([
        `yt_${FIXED_TIMESTAMP}_Test_Video_Title_-_Amazing_Song.webm`,
        'other_file.txt'
      ])
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
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

  it('processes valid YouTube URL and returns audio file with title', async () => {
    const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    const request = createMockRequest(`http://localhost:3000/api/convert?url=${encodeURIComponent(validUrl)}&format=webm`)

    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('audio/webm')
    expect(response.headers.get('Content-Disposition')).toContain('Test_Video_Title_-_Amazing_Song')
  }, 10000)

  it('supports mp3 format parameter', async () => {
    const fs = require('fs')
    const mockReaddir = fs.promises.readdir as jest.Mock
    mockReaddir.mockResolvedValueOnce([
      `yt_${FIXED_TIMESTAMP}_Test_Video_Title_-_Amazing_Song.mp3`,
      'other_file.txt'
    ])

    const validUrl = 'https://www.youtube.com/watch?v=test'
    const request = createMockRequest(`http://localhost:3000/api/convert?url=${encodeURIComponent(validUrl)}&format=mp3`)

    const response = await GET(request)

    expect(response.status).toBe(200)
  }, 10000)

  it('returns 400 for invalid format', async () => {
    const validUrl = 'https://www.youtube.com/watch?v=test'
    const request = createMockRequest(`http://localhost:3000/api/convert?url=${encodeURIComponent(validUrl)}&format=invalid`)

    const response = await GET(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain('Invalid format')
  })

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
