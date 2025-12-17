import { useEffect, useState } from 'react'

type ThumbnailState = {
  url: string | null
  loading: boolean
  error: boolean
}

// Captures a thumbnail frame from a video URL using the browser's video decoder
export function useVideoThumbnail(
  videoUrl: string | null,
  seekTime: number = 2
): ThumbnailState {
  const [state, setState] = useState<ThumbnailState>({
    url: null,
    loading: true,
    error: false,
  })

  useEffect(() => {
    if (!videoUrl) {
      setState({ url: null, loading: false, error: false })
      return
    }

    setState({ url: null, loading: true, error: false })

    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    let cancelled = false

    const handleLoadedMetadata = () => {
      if (cancelled) return
      // Seek to requested time, or near the start if video is short
      const targetTime = Math.min(seekTime, video.duration * 0.1, video.duration - 0.1)
      video.currentTime = Math.max(0, targetTime)
    }

    const handleSeeked = () => {
      if (cancelled) return

      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setState({ url: null, loading: false, error: true })
          return
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)

        setState({ url: dataUrl, loading: false, error: false })
      } catch {
        setState({ url: null, loading: false, error: true })
      } finally {
        video.src = ''
        video.load()
      }
    }

    const handleError = () => {
      if (cancelled) return
      setState({ url: null, loading: false, error: true })
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('seeked', handleSeeked)
    video.addEventListener('error', handleError)

    // Ensure absolute URL for video element
    const absoluteUrl = videoUrl.startsWith('http')
      ? videoUrl
      : `${window.location.origin}${videoUrl.startsWith('/') ? '' : '/'}${videoUrl}`
    video.src = absoluteUrl

    return () => {
      cancelled = true
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('seeked', handleSeeked)
      video.removeEventListener('error', handleError)
      video.src = ''
      video.load()
    }
  }, [videoUrl, seekTime])

  return state
}

// Cache for storing generated thumbnails to avoid re-generating
const thumbnailCache = new Map<string, string>()

// Generates a video thumbnail with caching
export function useVideoThumbnailCached(
  videoUrl: string | null,
  seekTime: number = 2
): ThumbnailState {
  const [state, setState] = useState<ThumbnailState>(() => {
    if (videoUrl && thumbnailCache.has(videoUrl)) {
      return { url: thumbnailCache.get(videoUrl)!, loading: false, error: false }
    }
    return { url: null, loading: !!videoUrl, error: false }
  })

  useEffect(() => {
    if (!videoUrl) {
      setState({ url: null, loading: false, error: false })
      return
    }

    // Skip data URLs or suspiciously long URLs (likely encoded data)
    if (videoUrl.startsWith('data:') || videoUrl.length > 2000) {
      setState({ url: null, loading: false, error: true })
      return
    }

    // Check cache first
    if (thumbnailCache.has(videoUrl)) {
      setState({ url: thumbnailCache.get(videoUrl)!, loading: false, error: false })
      return
    }

    setState({ url: null, loading: true, error: false })

    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    let cancelled = false

    const handleLoadedMetadata = () => {
      if (cancelled) return
      const targetTime = Math.min(seekTime, video.duration * 0.1, video.duration - 0.1)
      video.currentTime = Math.max(0, targetTime)
    }

    const handleSeeked = () => {
      if (cancelled) return

      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setState({ url: null, loading: false, error: true })
          return
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)

        // Cache the result
        thumbnailCache.set(videoUrl, dataUrl)

        setState({ url: dataUrl, loading: false, error: false })
      } catch {
        setState({ url: null, loading: false, error: true })
      } finally {
        // Remove listeners before clearing src to avoid spurious error events
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.removeEventListener('seeked', handleSeeked)
        video.removeEventListener('error', handleError)
        video.src = ''
        video.load()
      }
    }

    const handleError = () => {
      if (cancelled) return
      setState({ url: null, loading: false, error: true })
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('seeked', handleSeeked)
    video.addEventListener('error', handleError)

    // Ensure absolute URL for video element
    const absoluteUrl = videoUrl.startsWith('http')
      ? videoUrl
      : `${window.location.origin}${videoUrl.startsWith('/') ? '' : '/'}${videoUrl}`
    video.src = absoluteUrl

    return () => {
      cancelled = true
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('seeked', handleSeeked)
      video.removeEventListener('error', handleError)
      video.src = ''
      video.load()
    }
  }, [videoUrl, seekTime])

  return state
}
