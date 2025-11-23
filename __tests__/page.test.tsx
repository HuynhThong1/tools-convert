import { render, screen, fireEvent } from '@testing-library/react'
import Home from '../app/page'

// Mock window.location
delete (window as any).location
window.location = { href: '' } as any

describe('Home Page', () => {
  beforeEach(() => {
    window.location.href = ''
  })

  it('renders the main heading', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', { name: /YouTube to Audio Converter/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders the form with input and button', () => {
    render(<Home />)
    const input = screen.getByLabelText('youtube-url')
    const button = screen.getByRole('button', { name: /Download Audio/i })

    expect(input).toBeInTheDocument()
    expect(button).toBeInTheDocument()
  })

  it('shows error when submitting empty form', () => {
    render(<Home />)
    const form = screen.getByLabelText('convert-form')

    fireEvent.submit(form)

    const error = screen.getByText(/Please enter a YouTube URL/i)
    expect(error).toBeInTheDocument()
  })

  it('calls fetch with correct URL when valid URL is submitted', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob(['test'], { type: 'audio/webm' })),
        headers: new Headers({ 'Content-Disposition': 'attachment; filename="test.webm"' })
      } as Response)
    )

    render(<Home />)
    const input = screen.getByLabelText('youtube-url')
    const form = screen.getByLabelText('convert-form')

    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    fireEvent.change(input, { target: { value: testUrl } })
    fireEvent.submit(form)

    const expectedUrl = `/api/convert?url=${encodeURIComponent(testUrl)}&format=webm`
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(fetch).toHaveBeenCalledWith(expectedUrl)
  })

  it('updates input value when user types', () => {
    render(<Home />)
    const input = screen.getByLabelText('youtube-url') as HTMLInputElement

    fireEvent.change(input, { target: { value: 'test-value' } })

    expect(input.value).toBe('test-value')
  })

  it('renders the "How it works" section', () => {
    render(<Home />)
    const heading = screen.getByText(/How It Works/i)
    expect(heading).toBeInTheDocument()

    expect(screen.getByText(/yt-dlp/i)).toBeInTheDocument()
  })
})