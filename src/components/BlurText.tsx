import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type ElementType } from 'react'

type AnimationStep = Record<string, string | number>

function buildKeyframes(from: AnimationStep, steps: AnimationStep[]) {
  const keys = new Set([
    ...Object.keys(from),
    ...steps.flatMap((s) => Object.keys(s)),
  ])

  const keyframes: Record<string, Array<string | number>> = {}
  keys.forEach((k) => {
    keyframes[k] = [from[k], ...steps.map((s) => s[k])]
  })
  return keyframes
}

interface BlurTextProps {
  text?: string
  delay?: number
  className?: string
  animateBy?: 'words' | 'letters'
  direction?: 'top' | 'bottom'
  threshold?: number
  rootMargin?: string
  animationFrom?: AnimationStep
  animationTo?: AnimationStep[]
  easing?: (t: number) => number
  onAnimationComplete?: () => void
  stepDuration?: number
  /** Words that should render in italic (e.g. ["Intelligent"]) */
  emphasisWords?: string[]
  as?: 'p' | 'h1' | 'h2' | 'span'
  /** Keep all words on one line (no mid-line wrapping) */
  nowrap?: boolean
  /** Apply nowrap only from this breakpoint up (e.g. lg for tablet stack below) */
  nowrapFrom?: 'lg' | 'xl'
}

export default function BlurText({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = (t) => t,
  onAnimationComplete,
  stepDuration = 0.35,
  emphasisWords = [],
  as: Component = 'p',
  nowrap = false,
  nowrapFrom,
}: BlurTextProps) {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('')
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(node)
        }
      },
      { threshold, rootMargin },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  const defaultFrom = useMemo(
    () =>
      direction === 'top'
        ? { filter: 'blur(10px)', opacity: 0, y: -50 }
        : { filter: 'blur(10px)', opacity: 0, y: 50 },
    [direction],
  )

  const defaultTo = useMemo(
    () => [
      {
        filter: 'blur(5px)',
        opacity: 0.5,
        y: direction === 'top' ? 5 : -5,
      },
      { filter: 'blur(0px)', opacity: 1, y: 0 },
    ],
    [direction],
  )

  const fromSnapshot = animationFrom ?? defaultFrom
  const toSnapshots = animationTo ?? defaultTo

  const stepCount = toSnapshots.length + 1
  const totalDuration = stepDuration * (stepCount - 1)
  const times = Array.from({ length: stepCount }, (_, i) =>
    stepCount === 1 ? 0 : i / (stepCount - 1),
  )

  const Tag = Component as ElementType

  const wrapClass = nowrapFrom
    ? `flex-wrap ${nowrapFrom}:flex-nowrap`
    : nowrap
      ? 'flex-nowrap'
      : 'flex-wrap'

  return (
    <Tag
      ref={ref}
      className={`flex ${wrapClass} ${className}`}
    >
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots)
        const isEmphasis = emphasisWords.includes(segment)

        return (
          <motion.span
            className={`inline-block will-change-[transform,filter,opacity]${
              isEmphasis ? ' italic' : ''
            }`}
            key={index}
            initial={fromSnapshot}
            animate={inView ? animateKeyframes : fromSnapshot}
            transition={{
              duration: totalDuration,
              times,
              delay: (index * delay) / 1000,
              ease: easing,
            }}
            onAnimationComplete={
              index === elements.length - 1 ? onAnimationComplete : undefined
            }
          >
            {segment === ' ' ? '\u00A0' : segment}
            {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
          </motion.span>
        )
      })}
    </Tag>
  )
}
