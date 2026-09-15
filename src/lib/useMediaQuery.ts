import { useEffect, useState } from 'react'

/**
 * Tracks a media query so decorative work can be skipped on devices that
 * cannot benefit from it — e.g. a pointer-driven effect on a touch screen.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    setMatches(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** True only where a real cursor can hover — i.e. not a touch screen. */
export const HOVER_CAPABLE = '(hover: hover) and (pointer: fine)'
