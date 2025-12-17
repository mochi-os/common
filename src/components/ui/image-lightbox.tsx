'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ChevronLeft, ChevronRight, Download, FileWarning, ImageOff, Loader2, X } from 'lucide-react'
import { cn } from '../../lib/utils'

export type LightboxMedia = {
  id: string
  name: string
  url: string
  type: 'image' | 'video'
}

// Legacy type alias for backwards compatibility
export type LightboxImage = LightboxMedia

type ImageLightboxProps = {
  images: LightboxMedia[]
  currentIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onIndexChange: (index: number) => void
}

// Displays images and videos in a full-screen lightbox with navigation controls
export function ImageLightbox({
  images,
  currentIndex,
  open,
  onOpenChange,
  onIndexChange,
}: ImageLightboxProps) {
  const hasMultiple = images.length > 1
  const currentMedia = images[currentIndex]
  const isVideo = currentMedia?.type === 'video'

  // Track media loading and error state
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Reset loading/error state and pause video when media changes
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    // Pause any playing video when navigating away
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }, [currentIndex])

  // Preload adjacent images for smoother navigation (skip videos)
  useEffect(() => {
    if (!open || images.length <= 1) return

    const preload = (index: number) => {
      const media = images[index]
      if (media.type === 'image') {
        const img = new Image()
        img.src = media.url
      }
    }

    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0

    preload(prevIndex)
    preload(nextIndex)
  }, [open, currentIndex, images])

  const goToPrevious = useCallback(() => {
    onIndexChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1)
  }, [currentIndex, images.length, onIndexChange])

  const goToNext = useCallback(() => {
    onIndexChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0)
  }, [currentIndex, images.length, onIndexChange])

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, goToPrevious, goToNext])

  // Handle controls visibility with auto-hide
  const [controlsVisible, setControlsVisible] = useState(true)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const HIDE_DELAY = 3000

  const showControls = useCallback(() => {
    setControlsVisible(true)
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    hideTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false)
    }, HIDE_DELAY)
  }, [])

  // Set up activity listeners for showing controls
  useEffect(() => {
    if (!open) return

    showControls()

    const handleActivity = () => showControls()

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('touchstart', handleActivity)

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('touchstart', handleActivity)
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [open, showControls])

  // Handle swipe gestures for mobile
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const SWIPE_THRESHOLD = 50

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return

      const deltaX = e.changedTouches[0].clientX - touchStartX.current
      const deltaY = e.changedTouches[0].clientY - touchStartY.current

      // Only trigger if horizontal swipe is dominant and exceeds threshold
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX > 0) {
          goToPrevious()
        } else {
          goToNext()
        }
      }

      touchStartX.current = null
      touchStartY.current = null
    },
    [goToPrevious, goToNext]
  )

  if (!currentMedia) return null

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className='fixed inset-0 z-50 bg-black/90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0' />
        <DialogPrimitive.Content
          className='fixed inset-0 z-50 outline-none'
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className='sr-only'>
            {isVideo ? 'Video' : 'Image'} viewer: {currentMedia.name}
          </DialogPrimitive.Title>

          {/* Full-screen media area */}
          <div
            className='flex h-full w-full items-center justify-center'
            onTouchStart={hasMultiple ? handleTouchStart : undefined}
            onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
          >
            {isLoading && !hasError && (
              <Loader2 className='absolute size-8 animate-spin text-white/70' />
            )}
            {hasError ? (
              <div className='flex flex-col items-center gap-3 text-white/70'>
                {isVideo ? <FileWarning className='size-12' /> : <ImageOff className='size-12' />}
                <span className='text-sm'>Failed to load {isVideo ? 'video' : 'image'}</span>
              </div>
            ) : isVideo ? (
              <video
                ref={videoRef}
                src={currentMedia.url}
                controls
                autoPlay
                className={cn(
                  'max-h-full max-w-full transition-opacity duration-200',
                  isLoading ? 'opacity-0' : 'opacity-100'
                )}
                onLoadedData={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false)
                  setHasError(true)
                }}
              />
            ) : (
              <img
                src={currentMedia.url}
                alt={currentMedia.name}
                className={cn(
                  'max-h-full max-w-full object-contain transition-opacity duration-200',
                  isLoading ? 'opacity-0' : 'opacity-100'
                )}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false)
                  setHasError(true)
                }}
              />
            )}
          </div>

          {/* Top bar overlay with filename, counter, and controls */}
          <div
            className={cn(
              'absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-4 rounded-full bg-black/50 px-4 py-2 text-white transition-opacity duration-300',
              controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
          >
            {hasMultiple && (
              <span className='shrink-0 text-sm text-white/70'>
                {currentIndex + 1}/{images.length}
              </span>
            )}
            <span className='min-w-0 truncate text-sm text-white/70'>
              {currentMedia.name}
            </span>
            <div className='flex shrink-0 items-center gap-1 text-white/70'>
              <a
                href={currentMedia.url}
                download={currentMedia.name}
                className='rounded-full p-2 transition-colors hover:bg-white/20 hover:text-white'
                title='Download'
              >
                <Download className='size-5' />
              </a>
              <DialogPrimitive.Close className='rounded-full p-2 transition-colors hover:bg-white/20 hover:text-white'>
                <X className='size-5' />
                <span className='sr-only'>Close</span>
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Navigation buttons */}
          {hasMultiple && (
            <>
              <button
                onClick={goToPrevious}
                className={cn(
                  'absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/70 transition-all duration-300 hover:bg-black/70 hover:text-white sm:left-4 sm:p-3',
                  controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                aria-label='Previous image'
              >
                <ChevronLeft className='size-6 sm:size-8' />
              </button>
              <button
                onClick={goToNext}
                className={cn(
                  'absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/70 transition-all duration-300 hover:bg-black/70 hover:text-white sm:right-4 sm:p-3',
                  controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                aria-label='Next image'
              >
                <ChevronRight className='size-6 sm:size-8' />
              </button>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
