'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Download, Music2, Zap, FileAudio, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

const formatOptions = [
  {
    value: 'webm',
    label: 'WebM',
    description: 'Fastest download',
    size: '~5MB',
    icon: Zap,
    badge: 'Recommended',
    badgeVariant: 'default' as const,
  },
  {
    value: 'm4a',
    label: 'M4A',
    description: 'Good quality, smaller size',
    size: '~4MB',
    icon: FileAudio,
    badge: 'Fast',
    badgeVariant: 'secondary' as const,
  },
  {
    value: 'mp3',
    label: 'MP3',
    description: 'Universal compatibility',
    size: '~3MB',
    icon: Music2,
    badge: 'Slower',
    badgeVariant: 'outline' as const,
  },
]

export default function Home() {
  const [url, setUrl] = useState<string>('')
  const [format, setFormat] = useState<string>('webm')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!url) {
      setError('Please enter a YouTube URL')
      return
    }
    setIsLoading(true)
    const encoded = encodeURIComponent(url)

    // Use fetch to trigger download with loading state
    fetch(`/api/convert?url=${encoded}&format=${format}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Conversion failed')
        }
        // Get the blob and create download link
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl

        // Get filename from Content-Disposition header or use default
        const contentDisposition = response.headers.get('Content-Disposition')
        const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
        const filename = filenameMatch ? filenameMatch[1] : `audio.${format}`

        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
        setIsLoading(false)
      })
      .catch((err) => {
        setError('Failed to convert video. Please check the URL and try again.')
        setIsLoading(false)
      })
  }

  const selectedFormat = formatOptions.find(opt => opt.value === format)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Music2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            YouTube to Audio Converter
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Convert any YouTube video to high-quality audio files. Fast, free, and easy to use.
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-slate-200/60 dark:border-slate-800/60">
          <CardHeader>
            <CardTitle className="text-2xl">Convert Video</CardTitle>
            <CardDescription>
              Paste a YouTube URL below and select your preferred audio format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} aria-label="convert-form" className="space-y-6">
              {/* URL Input */}
              <div className="space-y-2">
                <Label htmlFor="youtube-url" className="text-base">
                  YouTube URL
                </Label>
                <Input
                  id="youtube-url"
                  aria-label="youtube-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-11 text-base"
                  disabled={isLoading}
                />
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <Label htmlFor="format" className="text-base">
                  Output Format
                </Label>
                <Select value={format} onValueChange={setFormat} disabled={isLoading}>
                  <SelectTrigger id="format" className="h-11 text-base">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                          <div className="flex items-center gap-3 py-1">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{option.label}</span>
                                <Badge variant={option.badgeVariant} className="text-xs">
                                  {option.badge}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {option.description} • {option.size}
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>

                {/* Format Info */}
                {selectedFormat && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                    {selectedFormat.value === 'mp3' ? (
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 shrink-0" />
                    )}
                    <div className="text-sm">
                      {format === 'mp3' && (
                        <p className="text-amber-700 dark:text-amber-400">
                          MP3 conversion takes 30-60 seconds longer due to encoding
                        </p>
                      )}
                      {format === 'webm' && (
                        <p className="text-green-700 dark:text-green-400">
                          Fastest option with excellent quality, works in all modern browsers
                        </p>
                      )}
                      {format === 'm4a' && (
                        <p className="text-green-700 dark:text-green-400">
                          Great balance of quality and file size, widely supported
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" size="lg" className="w-full text-base h-12" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download Audio
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading Card */}
        {isLoading && (
          <Card className="mt-6 border-primary/20 bg-primary/5 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Converting your video...</h3>
                  <p className="text-sm text-muted-foreground">
                    {format === 'mp3'
                      ? 'This may take 30-60 seconds for MP3 encoding. Please wait...'
                      : 'Fetching audio from YouTube. This should only take a few seconds...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How it works */}
        <Card className="mt-8 border-slate-200/60 dark:border-slate-800/60">
          <CardHeader>
            <CardTitle className="text-xl">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-semibold text-primary">1.</span>
                <span>
                  We use <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm">yt-dlp</code> to fetch the audio from YouTube
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary">2.</span>
                <span>Choose WebM/M4A for fast downloads, or MP3 if you need that specific format</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary">3.</span>
                <span>The file will be named after the video title automatically</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Free to use. No registration required. Your privacy matters.</p>
        </div>
      </div>
    </div>
  )
}
