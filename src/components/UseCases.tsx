import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, Check, ShieldCheck } from 'lucide-react'
import { workflows } from '@/config/workflows'
import { pageContainer, pagePadding } from '@/lib/layout'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { cn } from '@/lib/utils'

/** How long each workflow holds before the carousel advances. */
const AUTOPLAY_MS = 5000

/** Outgoing card leaves upward, incoming rises into its place. */
const slide = {
  enter: (direction: number) => ({
    y: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: { y: '0%', opacity: 1 },
  exit: (direction: number) => ({
    y: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
}

export function UseCases() {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)
  // Autoplay is a one-way door: once the reader picks a workflow, it stays put.
  const [autoplay, setAutoplay] = useState(true)
  const [paused, setPaused] = useState(false)
  const tabsRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const current = workflows[active]

  function select(next: number) {
    setDirection(next > active ? 1 : -1)
    setActive(next)
    setAutoplay(false)
  }

  useEffect(() => {
    if (!autoplay || paused || reducedMotion) return
    const id = window.setTimeout(() => {
      setDirection(1)
      setActive((i) => (i + 1) % workflows.length)
    }, AUTOPLAY_MS)
    return () => window.clearTimeout(id)
  }, [active, autoplay, paused, reducedMotion])

  // On mobile the selector is a horizontal rail, so keep the advancing tab in
  // view. Scrolls the rail only — never the page.
  useEffect(() => {
    const rail = tabsRef.current
    const button = rail?.querySelectorAll('button')[active]
    if (!rail || !button) return
    if (rail.scrollWidth <= rail.clientWidth) return

    const railBox = rail.getBoundingClientRect()
    const buttonBox = button.getBoundingClientRect()
    const delta =
      buttonBox.left - railBox.left - (railBox.width - buttonBox.width) / 2
    rail.scrollTo({ left: rail.scrollLeft + delta })
  }, [active])

  // Arrow keys move between workflows, as a tablist should.
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End']
    if (!keys.includes(e.key)) return
    e.preventDefault()

    const last = workflows.length - 1
    const next =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? last
          : e.key === 'ArrowDown' || e.key === 'ArrowRight'
            ? (active + 1) % workflows.length
            : (active - 1 + workflows.length) % workflows.length

    select(next)
    const buttons = tabsRef.current?.querySelectorAll('button')
    buttons?.[next]?.focus()
  }

  return (
    <section className="bg-background py-16 sm:py-20 md:py-24" id="use-cases">
      <div className={cn(pagePadding, pageContainer)}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12 xl:gap-16">
          {/* Editorial column — stays in view while the workflows scroll past */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5 }}
              className="mb-3 text-sm font-semibold text-accent sm:mb-4"
            >
              built for indian practice
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="font-display text-3xl tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem] xl:text-5xl"
            >
              Not adapted for India.
              <br />
              <span className="text-accent">Built for it.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base"
            >
              Split invoices, Tally date formats, blocked credit — the edge
              cases Chartered Accountants, accountants, and commerce teams meet
              in real client files.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 flex max-w-xl items-start gap-3 rounded-2xl border border-border bg-secondary/50 p-4 text-sm leading-relaxed text-muted-foreground sm:mt-8 sm:p-5"
            >
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                Every one of them ends the same way — a preview you approve
                before anything changes.
              </span>
            </motion.p>
          </div>

          <div className="min-w-0">
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,13.5rem)_minmax(0,1fr)] sm:gap-5"
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            {/* Selector */}
            <div
              ref={tabsRef}
              role="tablist"
              aria-label="Workflows"
              aria-orientation="vertical"
              onKeyDown={handleKeyDown}
              className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-col sm:gap-1 sm:overflow-visible sm:px-0 sm:pb-0"
            >
              {workflows.map((item, i) => {
                const selected = i === active
                return (
                  <button
                    key={item.label}
                    type="button"
                    role="tab"
                    id={`workflow-tab-${i}`}
                    aria-selected={selected}
                    aria-controls="workflow-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => select(i)}
                    className={cn(
                      'group relative flex shrink-0 snap-start items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium outline-none transition-colors duration-200',
                      'focus-visible:ring-2 focus-visible:ring-accent/50 sm:w-full sm:shrink',
                      selected
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
                    )}
                  >
                    {selected && (
                      <motion.span
                        layoutId="workflow-tab-active"
                        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                        aria-hidden
                        className="absolute inset-0 rounded-xl border border-accent/25 bg-accent/[0.08]"
                      />
                    )}
                    <item.icon
                      className={cn(
                        'relative h-4 w-4 shrink-0 transition-colors duration-200',
                        selected
                          ? 'text-accent'
                          : 'text-muted-foreground/60 group-hover:text-accent/70',
                      )}
                    />
                    <span className="relative whitespace-nowrap sm:whitespace-normal">
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Detail panel — cards are stacked in one grid cell so the outgoing
                and incoming slide past each other without the box resizing */}
            <div
              role="tabpanel"
              id="workflow-panel"
              aria-labelledby={`workflow-tab-${active}`}
              className="relative grid min-h-[24rem] overflow-hidden rounded-2xl border border-border bg-secondary/40 p-5 sm:min-h-[26rem] sm:p-6"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(110% 80% at 100% 0%, hsl(var(--accent) / 0.10), transparent 60%)',
                }}
              />

              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={current.label}
                  custom={direction}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    y: { type: 'spring', stiffness: 260, damping: 32 },
                    opacity: { duration: 0.2 },
                  }}
                  className="relative flex flex-col [grid-area:1/1]"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                      <current.icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-body text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                      {current.label}
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {current.detail}
                  </p>

                  <dl className="mt-6">
                    <div className="rounded-xl border border-border bg-background p-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                        You hand it
                      </dt>
                      <dd className="mt-1.5 text-sm text-foreground">
                        {current.input}
                      </dd>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-2" aria-hidden>
                      <span className="h-4 w-px bg-border" />
                      <ArrowDown className="h-3.5 w-3.5 text-accent" />
                      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">
                        CELLIX runs it in your sheet
                      </span>
                    </div>

                    <div className="rounded-xl border border-accent/30 bg-accent/[0.07] p-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-accent/80">
                        You get back
                      </dt>
                      <dd className="mt-1.5 text-sm text-foreground">
                        {current.output}
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-auto flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
                    Previewed first — nothing lands until you accept it
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  )
}
