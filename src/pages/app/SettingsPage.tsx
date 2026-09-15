import { Link } from 'react-router-dom'
import { ArrowUpRight, LogOut } from 'lucide-react'
import { useAppContext } from '@/components/app/appContext'
import { useAppStore } from '@/lib/appStore'
import { signOutAndGoHome } from '@/lib/auth-client'
import { PLAN_LABELS, PLAN_MONTHLY_CREDITS, type AccountSummary } from '@/lib/appTypes'
import { contactEmail } from '@/config/site'
import { cn } from '@/lib/utils'

export function SettingsPage() {
  const { user } = useAppContext()
  const account = useAppStore((s) => s.account)

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
          Settings
        </h1>

        <Section title="Profile">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-base font-semibold text-foreground">
              {user.image ? (
                <img
                  src={user.image}
                  alt=""
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                (user.name || user.email || '?').trim().charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user.name || 'Cellix user'}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Your name, email and avatar come from the account you signed in
            with. To change them, update them with that provider.
          </p>
        </Section>

        <Section title="Plan & usage">
          <Row label="Current plan" value={account ? PLAN_LABELS[account.planTier] : '—'} />
          <Row
            label="Next billing date"
            value={
              account?.currentPeriodEnd
                ? new Date(account.currentPeriodEnd).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Not scheduled'
            }
          />

          {account && <UsageBar account={account} />}

          {/* oneTimeCredits is the usage bar's own denominator on the free
              tier (see UsageBar), so it's only worth a separate line for a
              PAID subscriber who still has leftover free-trial credits. */}
          {account &&
            (account.purchasedCredits > 0 || (account.planTier !== 'free' && account.oneTimeCredits > 0)) && (
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-border pt-3">
                {account.purchasedCredits > 0 && (
                  <span className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {account.purchasedCredits.toLocaleString('en-IN')}
                    </span>{' '}
                    top-up credits (never expire)
                  </span>
                )}
                {account.planTier !== 'free' && account.oneTimeCredits > 0 && (
                  <span className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {account.oneTimeCredits.toLocaleString('en-IN')}
                    </span>{' '}
                    free-tier credits
                  </span>
                )}
              </div>
            )}

          <Link
            to="/app/billing"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Manage plans & credits
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Section>

        <Section title="Data & retention">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Excel sessions are kept for 90 days of inactivity, then removed
            automatically. Deleting a session here removes it permanently and
            cannot be undone.
          </p>
        </Section>

        <Section title="Support">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Questions about billing or your account?{' '}
            <a
              href={`mailto:${contactEmail}`}
              className="underline underline-offset-2 hover:text-foreground"
            >
              {contactEmail}
            </a>
          </p>
        </Section>

        <button
          type="button"
          onClick={() => void signOutAndGoHome()}
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="mb-2.5 font-display text-base text-foreground">{title}</h2>
      <div className="rounded-2xl border border-border bg-background p-4">{children}</div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

/**
 * Monthly plan-credit usage, Cursor/Claude-style: a filled bar plus "used /
 * total". Deliberately scoped to `planCredits` only — purchasedCredits and
 * oneTimeCredits don't reset on a cycle and would make "% used this month"
 * meaningless if folded in (a large top-up would make the bar look nearly
 * empty forever). Those are surfaced as separate figures instead, in
 * SettingsPage's caller.
 */
function UsageBar({ account }: { account: AccountSummary }) {
  const total = PLAN_MONTHLY_CREDITS[account.planTier]
  if (total === null || total === 0) return null

  // Free tier's allotment lives in oneTimeCredits (a one-time grant, not a
  // monthly plan credit — CreditGateService.ensureAccount never sets
  // planCredits for a free account), while every paid tier's allotment
  // lives in planCredits (Razorpay webhook grants). Reading the wrong
  // bucket for free would show "120 / 120 used" for a brand-new user who
  // hasn't spent anything.
  const remaining = Math.max(0, account.planTier === 'free' ? account.oneTimeCredits : account.planCredits)
  // Remaining only ever decreases from the grant amount within a cycle
  // (debits draw planCredits/oneTimeCredits before purchasedCredits, per
  // CD-8's fixed bucket order), so "used" is simply what's missing from the
  // full allotment — never negative in practice, but clamped defensively
  // since this renders directly from a fetched value.
  const used = Math.max(0, total - remaining)
  const percentUsed = Math.min(100, Math.round((used / total) * 100))

  const isCritical = percentUsed >= 95
  const isWarning = percentUsed >= 80

  return (
    <div className="mt-4 border-t border-border pt-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-foreground">Monthly credits</span>
        <span className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{used.toLocaleString('en-IN')}</span>
          {' / '}
          {total.toLocaleString('en-IN')} used
        </span>
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuenow={percentUsed}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Monthly credit usage"
      >
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-accent',
          )}
          style={{ width: `${percentUsed}%` }}
        />
      </div>
      <p className="mt-1.5 text-[0.7rem] text-muted-foreground">
        {remaining.toLocaleString('en-IN')} credits left
        {isCritical && ' — running low, consider a top-up'}
      </p>
    </div>
  )
}
