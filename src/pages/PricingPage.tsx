import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { pageContainer, pagePadding } from '@/lib/layout'
import { cn } from '@/lib/utils'

interface Plan {
  id: 'free' | 'beta' | 'solo' | 'firm' | 'enterprise'
  badge: string
  name: string
  price: string
  priceSuffix?: string
  period: string
  credits: string
  features: string[]
  cta: { label: string; to: string } | { label: string; href: string }
  featured?: boolean
}

// Launch-phase plan set: only 'free' and 'beta' are shown on the pricing
// page (see the `.filter` in PricingPage below). Solo/Firm/Enterprise stay
// defined here — same pricing-doc numbers, cellix-pricing-v3.html — so
// re-enabling tiered pricing later is a one-line filter change, not a
// re-write. Beta intentionally carries every feature Solo/Firm list: at this
// stage there is no plan-based feature gate in the backend
// (CreditGateService checks balance only, never planTier) — every account
// can call every wired action, so the beta feature list should say what's
// actually true rather than a narrower marketing claim.
const plans: Plan[] = [
  {
    id: 'free',
    badge: 'Starter · Free',
    name: 'Try Cellix',
    price: '₹0',
    period: 'No card required · No expiry',
    credits: '120 credits · one-time',
    features: [
      'All Cellix features, credit-gated',
      'Excel add-in',
      'GST Reconciliation (GSTR-2B)',
      'ITC Computation & TDS checks',
      'Formula Q&A, generate, fix, explain',
      'GSTIN format validation',
      'ICAI Audit Trail PDF Export',
      'Community support only',
    ],
    cta: { label: 'Start free', href: '/#waitlist' },
  },
  {
    id: 'beta',
    badge: 'Founding Beta · Limited',
    name: 'Founding Beta',
    price: '₹899',
    priceSuffix: '/mo',
    period: 'Locked for life · 25 members only',
    credits: '500 credits/month',
    features: [
      'Every Cellix feature — nothing held back',
      'GST Reconciliation (GSTR-2B)',
      'ITC Computation Engine',
      'TDS Compliance Checks',
      'ICAI Audit Trail PDF Export',
      'Tally export parsing & cleanup',
      'Formula generate, fix, explain',
      'GSTIN batch validation',
      'Credit top-up packs available',
      '30% below the eventual launch price',
      'Price locked forever once you join',
      'Direct line to the founding team',
    ],
    cta: { label: 'Join the Beta', to: '/checkout?plan=beta' },
    featured: true,
  },
  {
    id: 'solo',
    badge: 'CA Professional · Solo',
    name: 'CA Professional',
    price: '₹1,299',
    priceSuffix: '/mo',
    period: 'Month-to-month · cancel anytime',
    credits: '3,000 credits/month',
    features: [
      'GST Reconciliation (GSTR-2B)',
      'ITC Computation Engine',
      'TDS Compliance Checks',
      'ICAI Audit Trail PDF Export',
      'Tally export parsing & cleanup',
      'Formula generate, fix, explain',
      'GSTIN batch validation',
      'Credit top-up packs available',
      'Email support · 48hr SLA',
    ],
    cta: { label: 'Get subscription', to: '/checkout?plan=solo' },
  },
  {
    id: 'firm',
    badge: 'CA Firm · Team',
    name: 'Firm Plan',
    price: '₹5,999',
    priceSuffix: '/mo',
    period: 'Up to 5 seats · pooled credits',
    credits: '3,000 pooled credits/month',
    features: [
      'All CA Professional features',
      'Pooled credits · 5 seats',
      'Per-member usage analytics',
      'Client-segregated audit trails',
      'Admin dashboard & controls',
      'Priority email · 24hr SLA',
      'Additional seats: ₹999/seat/mo',
    ],
    cta: { label: 'Get subscription', to: '/checkout?plan=firm' },
  },
  {
    id: 'enterprise',
    badge: 'Enterprise · Pull-only',
    name: 'Custom Firm',
    price: 'From ₹25K',
    priceSuffix: '/mo',
    period: 'Annual billing only',
    credits: 'Custom credit allocation',
    features: [
      'Everything in Firm Plan',
      'Unlimited seats',
      'Dedicated onboarding',
      'Written SLA (99.5% uptime)',
      'WhatsApp support line',
      'Custom Tally/ERP connectors',
    ],
    cta: { label: 'Talk to us', href: '/#contact' },
  },
]

// Launch-phase visibility: only Free and Beta are offered while Cellix is in
// beta. Change this line (not the `plans` array above) to bring back Solo/
// Firm/Enterprise.
const VISIBLE_PLAN_IDS: Plan['id'][] = ['free', 'beta']
const visiblePlans = plans.filter((plan) => VISIBLE_PLAN_IDS.includes(plan.id))

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
})

export function PricingPage() {
  return (
    <div className="overflow-x-hidden bg-background font-sans antialiased">
      <Navbar />

      <section className={cn(pagePadding, 'pt-32 pb-14 sm:pt-40 sm:pb-16 md:pt-44 md:pb-20')}>
        <div className={cn(pageContainer, 'max-w-3xl text-center mx-auto')}>
          <motion.p {...fadeUp(0)} className="mb-3 text-sm font-semibold text-accent">
            pricing
          </motion.p>
          <motion.h1
            {...fadeUp(0.05)}
            className="font-display text-3xl tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Simple pricing, built for CA practice
          </motion.h1>
          <motion.p
            {...fadeUp(0.1)}
            className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            A predictable credit balance, not a metered surprise bill. Know
            what every action costs before you run it.
          </motion.p>
        </div>
      </section>

      <section className={cn(pagePadding, 'pb-20 sm:pb-24 md:pb-28')}>
        <div className={cn(pageContainer, 'mx-auto grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2')}>
          {visiblePlans.map((plan, i) => (
            <motion.div
              key={plan.id}
              {...fadeUp(0.05 * i)}
              className={cn(
                'flex flex-col rounded-2xl border p-6 transition-transform',
                plan.featured
                  ? 'border-accent bg-accent/4 shadow-lg lg:-translate-y-2'
                  : 'border-border bg-background',
              )}
            >
              <span
                className={cn(
                  'mb-4 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide',
                  plan.featured ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground',
                )}
              >
                {plan.badge}
              </span>

              <h2 className="font-display text-xl text-foreground">{plan.name}</h2>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-3xl text-foreground">{plan.price}</span>
                {plan.priceSuffix && (
                  <span className="text-sm text-muted-foreground">{plan.priceSuffix}</span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{plan.period}</p>

              <div className="mt-4 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-foreground">
                {plan.credits}
              </div>

              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {'to' in plan.cta ? (
                <Link
                  to={plan.cta.to}
                  className={cn(
                    'mt-6 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                    plan.featured
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-border bg-background text-foreground hover:bg-secondary',
                  )}
                >
                  {plan.cta.label}
                </Link>
              ) : (
                <a
                  href={plan.cta.href}
                  className={cn(
                    'mt-6 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                    'border border-border bg-background text-foreground hover:bg-secondary',
                  )}
                >
                  {plan.cta.label}
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <section className={cn(pagePadding, 'pb-20 sm:pb-24 md:pb-28')}>
        <div className={cn(pageContainer, 'max-w-3xl mx-auto rounded-2xl bg-secondary/60 p-6 sm:p-8')}>
          <p className="font-display text-lg text-foreground">A petrol gauge, not a countdown timer</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Every action has a fixed credit price, shown up front — never a
            live token-metered surprise. A task already running is always
            allowed to finish. When your balance gets low, top-up packs are
            one click away, priced from ₹149.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
