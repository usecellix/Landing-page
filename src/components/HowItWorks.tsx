import { motion } from 'framer-motion'
import { CheckCircle2, MessageSquareText, Sparkles } from 'lucide-react'
import { demoStepImages } from '@/config/demo'
import { pageContainer, pagePadding } from '@/lib/layout'
import { cn } from '@/lib/utils'

const steps = [
  {
    step: '01',
    icon: MessageSquareText,
    tag: 'ask',
    title: 'Type it in plain English',
    description:
      'No formulas, no macros, no add-in menus. Describe the task and reference your sheets with @ — CELLIX figures out the rest.',
    image: demoStepImages.prompt,
    alt: 'CELLIX prompt field with a plain-English GST reconciliation request typed in',
  },
  {
    step: '02',
    icon: Sparkles,
    tag: 'watch',
    title: 'Watch every step it takes',
    description:
      'CELLIX reads both sheets, normalises invoice numbers and amounts, and shows its working — 847 rows in, 623 exact matches out.',
    image: demoStepImages.thinking,
    alt: 'CELLIX thinking panel listing each reconciliation step as it runs',
  },
  {
    step: '03',
    icon: CheckCircle2,
    tag: 'approve',
    title: 'Nothing lands until you accept',
    description:
      'You get a plain summary of exactly what will change. Accept, Accept All, or Reject — your workbook stays untouched until you decide.',
    image: demoStepImages.approve,
    alt: 'CELLIX change summary with Accept, Accept All and Reject buttons',
  },
]

export function HowItWorks() {
  return (
    <section className="bg-secondary/40 py-16 sm:py-20 md:py-24" id="how-it-works">
      <div className={cn(pagePadding, pageContainer)}>
        <div className="mb-10 flex flex-col gap-5 sm:gap-6 md:mb-12 lg:mb-12 xl:mb-16 xl:flex-row xl:items-end xl:justify-between xl:gap-12">
          <div className="w-full max-w-xl shrink-0 xl:max-w-md">
            <p className="mb-3 text-sm font-semibold text-accent sm:mb-4">
              how it works
            </p>
            <h2 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem] xl:text-5xl">
              Ask, review, approve
            </h2>
          </div>
          <p className="w-full max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base xl:max-w-lg xl:pb-1 xl:text-right">
            One line in, a reconciled workbook out — no formulas, no macros,
            and nothing applied until you approve it.
          </p>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-[7.5rem] hidden border-t border-dashed border-border lg:block"
          />

          <ol className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
            {steps.map((item, i) => (
              <motion.li
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group flex flex-col rounded-2xl border border-border bg-background p-4 shadow-[0_18px_40px_-32px_rgb(0_0_0/0.4)] transition-transform duration-300 hover:-translate-y-1 sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold uppercase tracking-tight text-muted-foreground">
                    <item.icon className="h-3.5 w-3.5 text-accent" />
                    {item.tag}
                  </span>
                  <span className="font-display text-sm text-muted-foreground/70">
                    {item.step}
                  </span>
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-secondary">
                  <img
                    src={item.image}
                    alt={item.alt}
                    width={900}
                    height={900}
                    loading="lazy"
                    decoding="async"
                    className="block aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>

                <h3 className="mt-4 font-body text-lg font-semibold text-foreground sm:mt-5 sm:text-xl">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
