import { useEffect, useRef } from 'react'
import { productDemoPosterSrc } from '@/config/demo'
import { useReducedMotion } from '@/lib/useReducedMotion'

/**
 * The hero product demo. Renders the poster frame immediately and lets the
 * video stream in behind it; under "reduce motion" the poster is all you get.
 */
export function DashboardPreview({
  demoVideoSrc,
  poster = productDemoPosterSrc,
}: {
  demoVideoSrc: string
  poster?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (reducedMotion) video.pause()
  }, [reducedMotion])

  return (
    <div className="pointer-events-auto overflow-hidden rounded-xl border border-border bg-foreground shadow-sm">
      <div className="aspect-video w-full">
        {reducedMotion ? (
          <img
            src={poster}
            alt="CELLIX reconciling a purchase register against GSTR-2A inside a spreadsheet"
            className="h-full w-full object-cover"
            width={1280}
            height={720}
          />
        ) : (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={demoVideoSrc}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="CELLIX reconciling a purchase register against GSTR-2A inside a spreadsheet"
          />
        )}
      </div>
    </div>
  )
}
