'use client'

import { useState, FormEvent, ChangeEvent } from 'react'

export default function Home() {
  const [url, setUrl] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!url) {
      setError('Please enter a YouTube URL')
      return
    }
    // Open the download in a new tab so streaming download starts
    const encoded = encodeURIComponent(url)
    window.location.href = `/api/convert?url=${encoded}`
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setUrl(e.target.value)
  }

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>YouTube → MP3</h1>
      <p>Paste a YouTube video URL below and we&apos;ll convert the audio to an MP3 stream.</p>

      <form onSubmit={onSubmit} aria-label="convert-form">
        <input
          aria-label="youtube-url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={handleChange}
          style={{ width: '100%', padding: '8px', fontSize: '16px' }}
        />
        <div style={{ marginTop: '12px' }}>
          <button type="submit">Download MP3</button>
        </div>
      </form>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <section style={{ marginTop: 24 }}>
        <h2>How it works</h2>
        <ol>
          <li>We use <code>ytdl-core</code> to fetch the audio from YouTube.</li>
          <li>We transcode the audio to MP3 using <code>ffmpeg</code> (bundled via <code>ffmpeg-static</code>).</li>
          <li>The browser begins downloading the resulting MP3 file.</li>
        </ol>
      </section>
    </div>
  )
}
