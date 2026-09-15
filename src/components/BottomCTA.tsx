import { useEffect, useRef, useState } from 'react'
import { WaitlistForm } from '@/components/WaitlistForm'
import { heroBackgroundVideoSrc } from '@/config/demo'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { contactEmail } from '@/config/site'
import cellixLogoWhite from '@/assets/cellix-logo-white.png'

export function BottomCTA() {
  const reducedMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  // Only fetch the ambient loop once this section is close to the viewport.
  useEffect(() => {
    const node = sectionRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="px-4 py-14 sm:px-6 sm:py-16 md:px-10 md:py-20 lg:px-12 lg:py-20 xl:px-20 xl:py-24"
      id="contact"
    >
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl p-6 text-center shadow-2xl sm:rounded-3xl sm:p-8 lg:p-10 xl:p-12">
        <div className="pointer-events-none absolute inset-0 bg-primary">
          {inView && !reducedMotion && (
            <video
              className="h-full w-full object-cover"
              src={heroBackgroundVideoSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
              tabIndex={-1}
            />
          )}
          <div className="absolute inset-0 bg-primary/75 backdrop-blur-[2px]" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(circle at 30% 20%, hsl(var(--accent) / 0.5), transparent 60%)',
            }}
          />
        </div>

        <div className="relative z-10">
          <h2 className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 font-display text-2xl tracking-tight text-primary-foreground sm:gap-x-3 sm:text-3xl lg:text-4xl xl:text-5xl">
            <span>Get early access to</span>
            <img
              src={cellixLogoWhite}
              alt="cellix"
              className="h-7 w-auto sm:h-8 lg:h-9 xl:h-11"
            />
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-primary-foreground/70 sm:mt-5 lg:mt-6 lg:text-[0.9375rem] xl:text-base">
            Join the waitlist for free early access — 50 credits per month, no
            credit card required. Built for CAs, accountants, and commerce
            professionals who need Excel work that is faster, safer, and fully
            accountable.
          </p>
          <div className="mx-auto mt-8 w-full max-w-md sm:mt-9 lg:mt-10">
            <WaitlistForm variant="inverted" />
          </div>
          <p className="mt-5 text-xs text-primary-foreground/60 sm:mt-6 sm:text-sm">
            Questions?{' '}
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex min-h-11 items-center break-all underline underline-offset-2 hover:text-primary-foreground sm:break-normal"
            >
              {contactEmail}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
