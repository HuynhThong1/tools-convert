/**
 * API Route Test
 * Tests the /api/convert endpoint
 */
import { GET } from '../app/api/convert/route'
import { Readable } from 'stream'

// Mock @distube/ytdl-core
jest.mock('@distube/ytdl-core', () => {
  const mockStream = () => {
    return new Readable({
      read() {
        this.push(Buffer.from('fake-audio-data'))
        this.push(null) // End the stream
      }
    })
  }

  const ytdlMock: any = jest.fn().mockImplementation(mockStream)

  ytdlMock.validateURL = jest.fn().mockImplementation((url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be')
  })

  ytdlMock.getInfo = jest.fn().mockResolvedValue({
    videoDetails: {
      title: 'Test Video Title - Amazing Song',
      lengthSeconds: '180'
    },
    formats: [
      {
        mimeType: 'audio/webm; codecs="opus"',
        audioQuality: 'AUDIO_QUALITY_MEDIUM',
        itag: 251
      },
      {
        mimeType: 'audio/mp4; codecs="mp4a.40.2"',
        audioQuality: 'AUDIO_QUALITY_MEDIUM',
        itag: 140
      }
    ]
  })

  ytdlMock.chooseFormat = jest.fn().mockImplementation((formats: any[], options: any) => {
    // Return the first format that matches the filter
    if (options.filter && typeof options.filter === 'function') {
      return formats.find(options.filter) || formats[0]
    }
    return formats[0]
  })

  return {
    __esModule: true,
    default: ytdlMock
  }
})

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

    if (response.status !== 200) {
      const errorData = await response.json()
      console.error('Error response:', errorData)
    }

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('audio/webm')
    expect(response.headers.get('Content-Disposition')).toContain('Test_Video_Title_-_Amazing_Song')
  })

  it('supports m4a format parameter', async () => {
    const validUrl = 'https://www.youtube.com/watch?v=test'
    const request = createMockRequest(`http://localhost:3000/api/convert?url=${encodeURIComponent(validUrl)}&format=m4a`)

    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('audio/mp4')
  })

  it('returns 400 for invalid format', async () => {
    const validUrl = 'https://www.youtube.com/watch?v=test'
    const request = createMockRequest(`http://localhost:3000/api/convert?url=${encodeURIComponent(validUrl)}&format=invalid`)

    const response = await GET(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain('Invalid format')
  })

  it('handles error when ytdl-core fails', async () => {
    const ytdl = require('@distube/ytdl-core').default
    const originalGetInfo = ytdl.getInfo
    ytdl.getInfo = jest.fn().mockRejectedValueOnce(new Error('Video unavailable'))

    const validUrl = 'https://www.youtube.com/watch?v=test'
    const request = createMockRequest(`http://localhost:3000/api/convert?url=${encodeURIComponent(validUrl)}`)

    const response = await GET(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBeDefined()

    // Restore the original mock
    ytdl.getInfo = originalGetInfo
  })
})
