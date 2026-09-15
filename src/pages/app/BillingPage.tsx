import { useEffect, useState } from 'react'
import { Check, Coins, Loader2 } from 'lucide-react'
import { useAppStore, useToastStore } from '@/lib/appStore'
import { appService } from '@/lib/appService'
import type { LedgerEntry, PlanTier } from '@/lib/appTypes'
import { cn } from '@/lib/utils'

/**
 * Plan ranking, used to tell an upgrade from a downgrade. Mirrors the tier
 * ordering in cellix-pricing-v3.html; `enterprise` is inbound-only (no
 * self-serve checkout) so it has no button here.
 */
const PLAN_RANK: Record<PlanTier, number> = {
  free: 0,
  beta: 1,
  solo: 2,
  firm: 3,
  enterprise: 4,
}

type PurchasablePlan = 'beta'

interface PlanCard {
  id: PurchasablePlan | 'free'
  name: string
  price: string
  period: string
  credits: string
  features: string[]
  featured?: boolean
  purchasable?: boolean
}

/** Prices/allotments for web chat surface — only Beta and Free. */
const PLAN_CARDS: PlanCard[] = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: '/mo',
    credits: '100 credits/month',
    features: [
      'Web chat over your Excel sessions',
      'Perfect for testing',
      'Credit top-up packs available',
    ],
    purchasable: false,
  },
  {
    id: 'beta',
    name: 'Founding Beta',
    price: '₹899',
    period: '/mo · locked for life',
    credits: '500 credits/month',
    features: [
      'Web chat + Excel add-in features',
      'Price locked forever once you join',
      'Credit top-up packs available',
      'Direct line to the founding team',
    ],
    featured: true,
    purchasable: true,
  },
]

const TOPUP_PACKS = [
  { id: 'small' as const, credits: 300, price: '₹149' },
  { id: 'medium' as const, credits: 1000, price: '₹399' },
  { id: 'large' as const, credits: 2200, price: '₹799' },
]

export function BillingPage() {
  const account = useAppStore((s) => s.account)
  const pushToast = useToastStore((s) => s.pushToast)
  const [busyPlan, setBusyPlan] = useState<string | null>(null)
  const [ledger, setLedger] = useState<LedgerEntry[]>([])
  const [ledgerLoading, setLedgerLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    appService
      .getLedger()
      .then((page) => {
        if (!cancelled) setLedger(page.entries)
      })
      .catch(() => {
        if (!cancelled) setLedger([])
      })
      .finally(() => {
        if (!cancelled) setLedgerLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const currentTier = account?.planTier ?? 'free'

  async function handleSubscribe(planTier: PurchasablePlan) {
    setBusyPlan(planTier)
    try {
      const { url } = await appService.subscribe(planTier)
      // Razorpay's hosted checkout is a full-page handoff, not a modal —
      // the customer returns to /app?subscribed=<tier> afterwards.
      if (!url) {
        throw new Error('No checkout URL returned from server')
      }
      window.location.href = url
    } catch (error) {
      console.error('[BillingPage] Subscribe error:', error)
      const message =
        error instanceof Error && error.message.includes('401')
          ? 'Not signed in. Please sign in and try again.'
          : 'Could not start checkout. Please try again.'
      pushToast(message, 'error')
      setBusyPlan(null)
    }
  }

  async function handleTopup(packId: 'small' | 'medium' | 'large') {
    setBusyPlan(packId)
    try {
      const { url } = await appService.topup(packId)
      if (!url) {
        throw new Error('No checkout URL returned from server')
      }
      window.location.href = url
    } catch (error) {
      console.error('[BillingPage] Topup error:', error)
      const message =
        error instanceof Error && error.message.includes('401')
          ? 'Not signed in. Please sign in and try again.'
          : 'Could not start checkout. Please try again.'
      pushToast(message, 'error')
      setBusyPlan(null)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
          Plans & credits
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Every action has a fixed credit price, known before you run it — a
          petrol gauge, not a countdown timer.
        </p>

        {/* Balance summary */}
        <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-border bg-secondary/40 p-4 sm:grid-cols-4">
          <Figure label="Available" value={account?.availableBalance ?? 0} emphasis />
          <Figure label="Plan credits" value={account?.planCredits ?? 0} />
          <Figure label="Purchased" value={account?.purchasedCredits ?? 0} />
          <Figure label="Free grant" value={account?.oneTimeCredits ?? 0} />
        </div>

        {/* Plans */}
        <h2 className="mt-9 font-display text-lg text-foreground">Subscription</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          {PLAN_CARDS.map((plan) => {
            const isCurrent = currentTier === plan.id
            const isDowngrade = PLAN_RANK[plan.id] < PLAN_RANK[currentTier]
            const busy = busyPlan === plan.id

            return (
              <div
                key={plan.id}
                className={cn(
                  'flex flex-col rounded-2xl border p-5',
                  plan.featured && !isCurrent
                    ? 'border-accent bg-accent/4'
                    : 'border-border bg-background',
                  isCurrent && 'border-accent',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-base text-foreground">{plan.name}</h3>
                  {isCurrent && (
                    <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-accent-foreground">
                      Current
                    </span>
                  )}
                </div>

                <div className="mt-2.5 flex items-baseline gap-1">
                  <span className="font-display text-2xl text-foreground">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">{plan.period}</span>
                </div>

                <div className="mt-3 rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-medium text-foreground">
                  {plan.credits}
                </div>

                <ul className="mt-4 flex-1 space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.purchasable && (
                  <button
                    type="button"
                    onClick={() => void handleSubscribe(plan.id as PurchasablePlan)}
                    disabled={isCurrent || isDowngrade || busy}
                    className={cn(
                      'mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                      isCurrent
                        ? 'cursor-not-allowed bg-secondary text-muted-foreground'
                        : isDowngrade
                          ? 'cursor-not-allowed border border-border bg-background text-muted-foreground'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90',
                      busy && 'opacity-70',
                    )}
                  >
                    {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {isCurrent
                      ? 'Subscribed'
                      : isDowngrade
                        ? 'Contact us to change'
                        : PLAN_RANK[currentTier] > 0
                          ? 'Upgrade'
                          : 'Subscribe'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {currentTier !== 'free' && account?.currentPeriodEnd && (
          <p className="mt-3 text-xs text-muted-foreground">
            Next billing date:{' '}
            {new Date(account.currentPeriodEnd).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}

        {/* Top-ups */}
        <h2 className="mt-9 font-display text-lg text-foreground">Credit top-up packs</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          One-time purchases. These never expire and are unaffected by plan renewal.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TOPUP_PACKS.map((pack) => (
            <div
              key={pack.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4"
            >
              <div>
                <p className="font-display text-lg text-foreground">
                  {pack.credits.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-muted-foreground">credits · {pack.price}</p>
              </div>
              <button
                type="button"
                onClick={() => void handleTopup(pack.id)}
                disabled={busyPlan === pack.id}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
              >
                {busyPlan === pack.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Buy
              </button>
            </div>
          ))}
        </div>

        {/* Transactions */}
        <h2 className="mt-9 font-display text-lg text-foreground">Transaction history</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-border">
          {ledgerLoading && (
            <div className="divide-y divide-border">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse bg-secondary/50" />
              ))}
            </div>
          )}

          {!ledgerLoading && ledger.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              No transactions yet.
            </p>
          )}

          {ledger.length > 0 && (
            <ul className="divide-y divide-border">
              {ledger.map((entry, index) => (
                <li
                  key={`${entry.createdAt}-${index}`}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      entry.amount >= 0 ? 'bg-emerald-500/10' : 'bg-secondary',
                    )}
                  >
                    <Coins
                      className={cn(
                        'h-3.5 w-3.5',
                        entry.amount >= 0 ? 'text-emerald-600' : 'text-muted-foreground',
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      {describeEntry(entry)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 text-sm font-medium tabular-nums',
                      entry.amount >= 0 ? 'text-emerald-600' : 'text-foreground',
                    )}
                  >
                    {entry.amount >= 0 ? '+' : ''}
                    {entry.amount.toLocaleString('en-IN')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function Figure({
  label,
  value,
  emphasis,
}: {
  label: string
  value: number
  emphasis?: boolean
}) {
  return (
    <div>
      <p className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 font-display leading-none tracking-tight text-foreground',
          emphasis ? 'text-2xl' : 'text-lg',
        )}
      >
        {value.toLocaleString('en-IN')}
      </p>
    </div>
  )
}

/** Human-readable label for a ledger row. */
function describeEntry(entry: LedgerEntry): string {
  switch (entry.entryType) {
    case 'grant':
      return 'Plan credits granted'
    case 'purchase':
      return 'Credit top-up purchased'
    case 'one_time_grant':
      return 'Free tier credits'
    case 'debit':
      return entry.actionType ? formatActionType(entry.actionType) : 'Credits used'
    default:
      return 'Transaction'
  }
}

/** FORMULA_QA_SIMPLE -> "Formula qa simple" */
function formatActionType(actionType: string): string {
  const words = actionType.toLowerCase().replace(/_/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}
