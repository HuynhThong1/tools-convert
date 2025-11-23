'use client'

import { useState, FormEvent, ChangeEvent } from 'react'

export default function Home() {
  const [url, setUrl] = useState<string>('')
  const [format, setFormat] = useState<string>('webm')
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!url) {
      setError('Please enter a YouTube URL')
      return
    }
    // Open the download with format parameter
    const encoded = encodeURIComponent(url)
    window.location.href = `/api/convert?url=${encoded}&format=${format}`
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setUrl(e.target.value)
  }

  function handleFormatChange(e: ChangeEvent<HTMLSelectElement>) {
    setFormat(e.target.value)
  }

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>YouTube → Audio Converter</h1>
      <p>Paste a YouTube video URL below and choose your preferred audio format.</p>

      <form onSubmit={onSubmit} aria-label="convert-form">
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="youtube-url" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            YouTube URL
          </label>
          <input
            id="youtube-url"
            aria-label="youtube-url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="format" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Output Format
          </label>
          <select
            id="format"
            value={format}
            onChange={handleFormatChange}
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          >
            <option value="webm">WebM (Fastest, ~5MB)</option>
            <option value="m4a">M4A (Fast, ~4MB)</option>
            <option value="mp3">MP3 (Slower, ~3MB)</option>
          </select>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {format === 'mp3' && '⚠️ MP3 conversion takes 30-60 seconds longer'}
            {format === 'webm' && '✓ Fastest download, works in all browsers'}
            {format === 'm4a' && '✓ Good quality, smaller file size'}
          </p>
        </div>

        <div style={{ marginTop: '12px' }}>
          <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
            Download Audio
          </button>
        </div>
      </form>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <section style={{ marginTop: 24 }}>
        <h2>How it works</h2>
        <ol>
          <li>We use <code>yt-dlp</code> to fetch the audio from YouTube.</li>
          <li>Choose WebM/M4A for fast downloads, or MP3 if you need that specific format.</li>
          <li>The file will be named after the video title automatically.</li>
        </ol>
      </section>
    </div>
  )
}
