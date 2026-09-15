import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import BlurText from '@/components/BlurText'
import { DashboardPreview } from '@/components/DashboardPreview'
import SplashCursor from '@/components/SplashCursor'
import { WaitlistForm } from '@/components/WaitlistForm'
import { productDemoVideoSrc, heroBackgroundVideoSrc } from '@/config/demo'
import { heroColumns, pageContainer, pagePadding } from '@/lib/layout'
import { HOVER_CAPABLE, useMediaQuery } from '@/lib/useMediaQuery'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { cn } from '@/lib/utils'

/** Product primary purple — #4338CA */
const HERO_SPLASH_COLOR = '#4338CA'

const fadeUp = (delay: number, y = 16) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: delay === 0 ? 0.5 : 0.6, delay },
})

const headlineClass =
  'text-[clamp(1.375rem,3.8vw+0.5rem,3.75rem)] font-medium leading-[1.08] tracking-[-0.02em] lg:text-[clamp(1.5rem,1.6vw+0.75rem,2.35rem)] xl:text-[clamp(1.75rem,2.8vw+0.5rem,3.75rem)]'

export function Hero() {
  const reducedMotion = useReducedMotion()
  // The splash follows a cursor, so it does nothing on a touch screen but
  // burn GPU.
  const canHover = useMediaQuery(HOVER_CAPABLE)

  // The dashboard grows into place as the band rises through the viewport, so
  // the reveal follows the scroll rather than firing once on a trigger.
  const bandRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: bandRef,
    offset: ['start end', 'start 0.35'],
  })
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1])
  // Kept under the band's smallest vertical padding (py-10) so the offset
  // card is never clipped by the band's overflow-hidden.
  const y = useTransform(scrollYProgress, [0, 1], [32, 0])

  return (
    <section className="overflow-x-hidden bg-background">
      <div className="relative overflow-hidden">
        {!reducedMotion && !canHover && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          >
            <div
              className="absolute -left-1/3 -top-16 h-[26rem] w-[26rem] rounded-full"
              style={{
                background:
                  'radial-gradient(circle, hsl(var(--accent) / 0.20), transparent 70%)',
                animation: 'hero-drift-a 22s ease-in-out infinite',
              }}
            />
            <div
              className="absolute -right-1/3 top-1/4 h-[22rem] w-[22rem] rounded-full"
              style={{
                background:
                  'radial-gradient(circle, hsl(var(--accent) / 0.14), transparent 70%)',
                animation: 'hero-drift-b 28s ease-in-out infinite',
              }}
            />
          </div>
        )}

        {!reducedMotion && canHover && (
        <SplashCursor
          contained
          RAINBOW_MODE={false}
          COLOR={HERO_SPLASH_COLOR}
          DENSITY_DISSIPATION={4.5}
          VELOCITY_DISSIPATION={2.5}
          SPLAT_FORCE={3800}
          SPLAT_RADIUS={0.18}
          CURL={2.5}
          SHADING
        />
        )}
        <div
          className={cn(
            pagePadding,
            'relative z-10 pt-32 pb-10 sm:pt-40 sm:pb-16 md:pt-44 md:pb-16 lg:pt-48 lg:pb-16 xl:pt-52 xl:pb-20',
          )}
        >
        <div
          className={cn(
            pageContainer,
            'grid grid-cols-1 gap-10 sm:gap-12',
            heroColumns,
          )}
        >
          <div className="min-w-0">
            <h1 className={`font-body text-foreground ${headlineClass}`}>
              <BlurText
                as="span"
                text="Intelligent Excel AI"
                delay={100}
                animateBy="words"
                direction="top"
                stepDuration={0.35}
                nowrap
                nowrapFrom="xl"
                className="block justify-start text-left"
              />
              <BlurText
                as="span"
                text="built for Indian CAs and"
                delay={100}
                animateBy="words"
                direction="top"
                stepDuration={0.35}
                nowrap
                nowrapFrom="xl"
                className="block justify-start text-left"
              />
              <BlurText
                as="span"
                text="finance professionals"
                delay={100}
                animateBy="words"
                direction="top"
                stepDuration={0.35}
                nowrap
                nowrapFrom="xl"
                className="block justify-start text-left"
              />
            </h1>
          </div>

          <motion.div
            {...fadeUp(0.2)}
            className="w-full min-w-0 lg:max-w-sm xl:max-w-md lg:justify-self-end"
          >
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base md:text-[1.0625rem] md:leading-7 font-body">
              Built for Chartered Accountants and commerce professionals who
              work in Excel every day — reconcile GST, clean Tally exports, and
              move through books and client work faster, with your approval on
              every change.
            </p>
            <div id="waitlist" className="mt-6 scroll-mt-36 sm:mt-8 sm:scroll-mt-40 md:scroll-mt-48">
              <WaitlistForm
                shape="card"
                buttonLabel="Join the waitlist"
                buttonClassName="px-5 py-2.5 sm:px-6 sm:py-3"
              />
            </div>
          </motion.div>
        </div>
      </div>
      </div>

      <motion.div
        ref={bandRef}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className={cn(pagePadding, 'relative overflow-hidden py-10 sm:py-12 md:py-14 lg:py-16 xl:py-20')}
      >
        <div className="pointer-events-none absolute inset-0 bg-secondary">
          {!reducedMotion && (
            <video
              className="h-full w-full object-cover"
              src={heroBackgroundVideoSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              tabIndex={-1}
            />
          )}
        </div>

        <motion.div
          style={reducedMotion ? undefined : { scale, y }}
          className="relative z-10 mx-auto w-full max-w-5xl overflow-hidden rounded-xl border border-white/40 bg-white/10 p-2 shadow-[var(--shadow-dashboard)] backdrop-blur-sm sm:rounded-2xl sm:p-3 md:p-4"
        >
          <DashboardPreview demoVideoSrc={productDemoVideoSrc} />
        </motion.div>
      </motion.div>
    </section>
  )
}
