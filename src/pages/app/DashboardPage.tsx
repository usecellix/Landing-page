import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowUpRight,
  Coins,
  MessageSquare,
  MessageSquarePlus,
  Search,
  Sparkles,
} from 'lucide-react'
import { useAppContext } from '@/components/app/appContext'
import { useAppStore, useToastStore } from '@/lib/appStore'
import { PLAN_LABELS } from '@/lib/appTypes'
import { cn } from '@/lib/utils'

/**
 * The landing surface after sign-in: welcome, balance, plan, and the session
 * list.
 *
 * Also the post-payment destination. Razorpay's hosted checkout returns the
 * customer here with ?subscribed=<tier>, which raises the success toast and
 * refetches the balance — the spec's "after payment, ALWAYS redirect to
 * dashboard, never a payment confirmation page." The credits themselves are
 * granted by the webhook, not by this page; the refetch just picks them up.
 */
export function DashboardPage() {
  const { user, conversations, conversationsLoading } = useAppContext()
  const account = useAppStore((s) => s.account)
  const refreshAccount = useAppStore((s) => s.refreshAccount)
  const pushToast = useToastStore((s) => s.pushToast)
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')

  const subscribedTier = searchParams.get('subscribed')

  useEffect(() => {
    if (!subscribedTier) return

    const label = PLAN_LABELS[subscribedTier as keyof typeof PLAN_LABELS] ?? subscribedTier
    pushToast(`Payment successful! You're now on ${label}.`, 'success')

    // The webhook may land a beat after the redirect, so refetch once shortly
    // after as well — otherwise a user who returns very fast sees their old
    // balance and assumes the purchase failed.
    void refreshAccount()
    const timer = setTimeout(() => void refreshAccount(), 2500)

    // Drop the query param so a refresh doesn't re-toast.
    const next = new URLSearchParams(searchParams)
    next.delete('subscribed')
    setSearchParams(next, { replace: true })

    return () => clearTimeout(timer)
  }, [subscribedTier, pushToast, refreshAccount, searchParams, setSearchParams])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q) ||
        c.firstMessage.toLowerCase().includes(q),
    )
  }, [conversations, query])

  const firstName = (user.name || '').trim().split(/\s+/)[0] || 'there'

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Ask about anything you've done in Excel with Cellix. This chat is
          read-only — it can explain your work, but never changes a workbook.
        </p>

        {/* Stat row */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            icon={Coins}
            label="Credit balance"
            value={account ? account.availableBalance.toLocaleString('en-IN') : '—'}
            hint={
              account
                ? `${account.planCredits.toLocaleString('en-IN')} plan · ${account.purchasedCredits.toLocaleString('en-IN')} purchased · ${account.oneTimeCredits.toLocaleString('en-IN')} free`
                : undefined
            }
          />
          <StatCard
            icon={Sparkles}
            label="Current plan"
            value={account ? PLAN_LABELS[account.planTier] : '—'}
            hint={
              account?.currentPeriodEnd
                ? `Renews ${new Date(account.currentPeriodEnd).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}`
                : 'No renewal scheduled'
            }
          />
          <StatCard
            icon={MessageSquare}
            label="Excel sessions"
            value={conversationsLoading ? '—' : String(conversations.length)}
            hint="Kept for 90 days"
          />
        </div>

        {/* Profile + actions */}
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-border bg-secondary/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background text-sm font-semibold text-foreground">
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

          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/app/billing"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Plans & credits
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/app/chat"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <MessageSquarePlus className="h-4 w-4" />
              New chat
            </Link>
          </div>
        </div>

        {/* History */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg text-foreground">Your Excel sessions</h2>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sessions"
              aria-label="Search sessions"
              className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl border border-border">
          {conversationsLoading && conversations.length === 0 && (
            <div className="divide-y divide-border">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse bg-secondary/50" />
              ))}
            </div>
          )}

          {!conversationsLoading && filtered.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                {conversations.length === 0
                  ? 'No sessions yet. Open the Cellix add-in in Excel and your work will show up here.'
                  : 'No sessions match that search.'}
              </p>
            </div>
          )}

          <ul className="divide-y divide-border">
            {filtered.map((conversation) => (
              <li key={conversation.conversationId}>
                <Link
                  to={`/app/session/${conversation.conversationId}`}
                  className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-secondary/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {conversation.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {conversation.lastMessage || 'No messages'}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-xs text-muted-foreground">
                      {conversation.messageCount} message
                      {conversation.messageCount === 1 ? '' : 's'}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground/70">
                      {formatDate(conversation.updatedAt)}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Coins
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className={cn('rounded-2xl border border-border bg-background p-4')}>
      <div className="flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1.5 font-display text-2xl leading-none tracking-tight text-foreground">
        {value}
      </p>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
