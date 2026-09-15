import { motion } from 'framer-motion'
import { Lock, ShieldCheck, Undo2, UserCheck } from 'lucide-react'
import { pageContainer, pagePadding } from '@/lib/layout'
import { cn } from '@/lib/utils'

const trustPoints = [
  {
    icon: UserCheck,
    number: '01',
    title: 'Nothing without your approval',
    description:
      'No auto-apply or background edits. Every change is reviewed before it lands — you accept, then it applies.',
  },
  {
    icon: ShieldCheck,
    number: '02',
    title: 'Client data stays yours',
    description:
      'Used only for the task you request and not stored beyond the session — built for client confidentiality.',
  },
  {
    icon: Lock,
    number: '03',
    title: 'Audit-ready trail',
    description:
      'Who, what, when, and which cells — exportable for working papers and ready for review and compliance.',
  },
  {
    icon: Undo2,
    number: '04',
    title: 'Undo anytime',
    description:
      'Reverse any approved change, not just the last one — full session-level control stays with you.',
  },
]

export function TrustSection() {
  return (
    <section className="bg-background py-16 sm:py-20 md:py-24" id="trust">
      <div className={cn(pagePadding, pageContainer)}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14 xl:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <p className="mb-3 text-sm font-semibold text-accent sm:mb-4">
              trust &amp; privacy
            </p>
            <h2 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem] xl:text-5xl">
              Built for professional accountability
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              CELLIX is designed for Chartered Accountants and commerce teams
              who handle client data every day — so control, privacy, and a
              clear audit trail come first, not as an afterthought.
            </p>

            <div className="mt-8 hidden items-center gap-3 rounded-xl border border-border bg-secondary/60 px-4 py-3 sm:flex lg:mt-10">
              <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
              <p className="text-xs leading-snug text-muted-foreground">
                Every action is logged, reversible, and gated behind your
                explicit approval.
              </p>
            </div>
          </motion.div>

          <div className="divide-y divide-border border-t border-border lg:border-t-0">
            {trustPoints.map((point, i) => {
              const Icon = point.icon
              return (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="group flex items-start gap-4 py-6 sm:gap-6 sm:py-7"
                >
                  <span className="font-display text-lg text-muted-foreground/40 sm:text-xl">
                    {point.number}
                  </span>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 transition-colors duration-300 group-hover:bg-accent/15 sm:h-11 sm:w-11">
                    <Icon className="h-4.5 w-4.5 text-accent sm:h-5 sm:w-5" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-body text-base font-semibold text-foreground sm:text-lg">
                      {point.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:mt-2">
                      {point.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
