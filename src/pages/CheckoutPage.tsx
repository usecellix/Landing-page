import { useMemo, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { heroBackgroundVideoSrc } from '@/config/demo'
import { createGuestCheckoutSession, type PlanTier } from '@/lib/billing'
import cellixLogoWhite from '@/assets/cellix-logo-white.png'
import cellixLogo from '@/assets/cellix-logo.png'

const PLAN_DETAILS: Record<PlanTier, { name: string; price: string; credits: string }> = {
  beta: { name: 'Founding Beta', price: '₹899/mo', credits: '500 credits every month · locked for life' },
  solo: { name: 'CA Professional', price: '₹1,299/mo', credits: '3,000 credits every month' },
  firm: { name: 'Firm Plan', price: '₹5,999/mo', credits: '3,000 pooled credits · up to 5 seats' },
}

// Launch-phase: checkout only ever offers the Beta plan (Free needs no
// payment). `solo`/`firm` stay valid PlanTier values in lib/billing.ts and
// the backend (CheckoutPlanTier) for when tiered pricing comes back — this
// page just doesn't expose a way to reach them.
function isPlanTier(value: string | null): value is PlanTier {
  return value === 'beta'
}

export function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const planParam = searchParams.get('plan')
  const [planTier] = useState<PlanTier>(isPlanTier(planParam) ? planParam : 'beta')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const plan = useMemo(() => PLAN_DETAILS[planTier], [planTier])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const { url } = await createGuestCheckoutSession(email.trim(), planTier)
      window.location.href = url
    } catch {
      setStatus('error')
      setErrorMessage('Something went wrong starting checkout. Please try again.')
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 overflow-x-hidden lg:grid-cols-[1fr_2fr]">
      {/* Left — animated background, same asset as the marketing hero */}
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={heroBackgroundVideoSrc}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-primary/70 backdrop-blur-[1px]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(circle at 25% 20%, hsl(var(--accent) / 0.55), transparent 60%)',
          }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <Link to="/">
            <img src={cellixLogoWhite} alt="cellix" className="h-8 w-auto" />
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-md"
          >
            <p className="font-display text-2xl leading-snug text-primary-foreground xl:text-3xl">
              Faster books, cleaner exports, your approval on every change.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">
              Excel AI built for Indian CAs — GST reconciliation, Tally
              cleanup, and MIS, without giving up control of your workbook.
            </p>
          </motion.div>

          <p className="text-xs text-primary-foreground/50">
            Secure checkout powered by Razorpay.
          </p>
        </div>
      </div>

      {/* Right — plan summary + email, redirects to Razorpay's hosted checkout */}
      <div className="flex min-w-0 items-center justify-center bg-background px-6 py-16 sm:px-10">
        <div className="w-full min-w-0 max-w-sm">
          <Link to="/" className="mb-8 inline-flex lg:hidden">
            <img src={cellixLogo} alt="cellix" className="h-7 w-auto" />
          </Link>

          <p className="text-sm font-semibold text-accent">checkout</p>
          <h1 className="mt-2 font-display text-2xl text-foreground sm:text-3xl">
            Subscribe to {plan.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You'll enter payment details on Razorpay's secure page next.
          </p>

          <div className="mt-6 rounded-xl border border-border bg-secondary/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <span className="text-sm font-medium text-foreground">{plan.name}</span>
              <span className="shrink-0 text-sm font-semibold text-foreground">{plan.price}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{plan.credits}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6">
            <label htmlFor="checkout-email" className="text-xs font-medium text-foreground">
              Email address
            </label>
            <input
              id="checkout-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (status === 'error') setStatus('idle')
              }}
              placeholder="you@firm.com"
              disabled={status === 'loading'}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent disabled:opacity-60"
            />
            {status === 'error' && errorMessage && (
              <p className="mt-2 text-xs text-red-600">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {status === 'loading' ? 'Redirecting to payment…' : 'Continue to payment'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            You'll be redirected to Razorpay to complete payment securely.
          </p>
        </div>
      </div>
    </div>
  )
}
