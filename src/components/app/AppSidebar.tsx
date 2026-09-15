import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Coins,
  MessageSquarePlus,
  Search,
  Settings,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useAppStore, useToastStore } from '@/lib/appStore'
import { appService } from '@/lib/appService'
import { PLAN_LABELS, type ConversationSummary } from '@/lib/appTypes'
import { cn } from '@/lib/utils'
import cellixLogo from '@/assets/cellix-logo.png'

interface AppSidebarProps {
  conversations: ConversationSummary[]
  loading: boolean
  activeConversationId?: string
  onDeleted: (conversationId: string) => void
  onNavigate?: () => void
}

/**
 * Left rail: balance, plan, new chat, searchable history, settings.
 *
 * The balance is rendered large and first because CREDIT_SYSTEM.md §5 asks for
 * "a petrol gauge, not a countdown timer" — something always in view, not
 * something the user has to go find.
 */
export function AppSidebar({
  conversations,
  loading,
  activeConversationId,
  onDeleted,
  onNavigate,
}: AppSidebarProps) {
  const account = useAppStore((s) => s.account)
  const pushToast = useToastStore((s) => s.pushToast)
  const [query, setQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

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

  async function handleDelete(e: React.MouseEvent, conversationId: string) {
    // The row is a Link; without this the click navigates as it deletes.
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Delete this session? This cannot be undone.')) return

    setDeletingId(conversationId)
    try {
      await appService.deleteConversation(conversationId)
      onDeleted(conversationId)
      pushToast('Session deleted', 'success')
      if (activeConversationId === conversationId) {
        navigate('/app')
      }
    } catch {
      pushToast('Could not delete that session', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const planLabel = account ? PLAN_LABELS[account.planTier] : '—'
  const isFree = account?.planTier === 'free'

  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-secondary/40">
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <Link to="/" className="flex items-center">
          <img src={cellixLogo} alt="cellix" className="h-6 w-auto brightness-0" />
        </Link>
      </div>

      {/* Balance — the largest number on the page, by intent. */}
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
          <Coins className="h-3.5 w-3.5" />
          Credit balance
        </div>
        <div className="mt-1.5 font-display text-3xl leading-none tracking-tight text-foreground">
          {account ? account.availableBalance.toLocaleString('en-IN') : '—'}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-[0.7rem] font-semibold text-accent">
            {planLabel}
          </span>
          {isFree && (
            <Link
              to="/app/billing"
              onClick={onNavigate}
              className="text-[0.7rem] font-medium text-accent underline-offset-2 hover:underline"
            >
              Upgrade
            </Link>
          )}
        </div>

        {account && account.availableBalance <= 20 && (
          <p className="mt-2.5 rounded-lg bg-amber-500/10 px-2.5 py-2 text-[0.7rem] leading-snug text-amber-700">
            Running low. Add credits from ₹149 or see all plans.
          </p>
        )}
      </div>

      <div className="px-3 pt-3">
        <Link
          to="/app/chat"
          onClick={onNavigate}
          className="flex w-full items-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New chat
        </Link>
      </div>

      <div className="px-3 pt-3">
        <div className="relative">
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

      <nav className="mt-2 min-h-0 flex-1 overflow-y-auto px-3 pb-2" aria-label="Session history">
        <p className="px-1 py-2 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
          Excel sessions
        </p>

        {loading && conversations.length === 0 && (
          <div className="space-y-1.5 px-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-border/50" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="px-1 py-3 text-xs leading-relaxed text-muted-foreground">
            {conversations.length === 0
              ? 'No sessions yet. Work in the Cellix Excel add-in and your sessions appear here.'
              : 'No sessions match that search.'}
          </p>
        )}

        <ul className="space-y-0.5">
          {filtered.map((conversation) => {
            const isActive =
              activeConversationId === conversation.conversationId ||
              location.pathname.endsWith(conversation.conversationId)
            return (
              <li key={conversation.conversationId}>
                <Link
                  to={`/app/session/${conversation.conversationId}`}
                  onClick={onNavigate}
                  className={cn(
                    'group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-accent/10 text-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{conversation.title}</span>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, conversation.conversationId)}
                    disabled={deletingId === conversation.conversationId}
                    aria-label={`Delete ${conversation.title}`}
                    className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-red-600 focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </Link>
              </li>
            )
          })}
        </ul>

        {conversations.length > 0 && (
          <p className="px-1 pt-3 text-[0.65rem] leading-relaxed text-muted-foreground/70">
            Sessions are kept for 90 days.
          </p>
        )}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          to="/app/billing"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Sparkles className="h-4 w-4" />
          Plans & credits
        </Link>
        <Link
          to="/app/settings"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
