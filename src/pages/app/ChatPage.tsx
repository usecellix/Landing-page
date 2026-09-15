import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowUp, Coins, FileSpreadsheet, Info, Lock } from 'lucide-react'
import { useAppContext } from '@/components/app/appContext'
import { useAppStore, useToastStore } from '@/lib/appStore'
import { appService } from '@/lib/appService'
import { ApiError } from '@/lib/api'
import type { ConversationDetail, WebChatAnswer } from '@/lib/appTypes'
import { cn } from '@/lib/utils'

interface ChatTurn {
  id: string
  role: 'user' | 'assistant'
  content: string
  creditsCost?: number
  citations?: WebChatAnswer['citations']
  pending?: boolean
  failed?: boolean
}

/** Debounce for the pre-send estimate — one call per pause, not per keystroke. */
const ESTIMATE_DEBOUNCE_MS = 400

/**
 * Ask-mode chat over the user's Excel sessions.
 *
 * Two shapes, one component: `/app/chat` asks across all recent sessions,
 * `/app/session/:conversationId` scopes to one. The only difference is which
 * id is sent and what the header shows, so splitting them into two pages
 * would duplicate the whole composer and transcript for no gain.
 *
 * The transcript here is LOCAL to the visit — this surface reads Excel
 * history rather than writing its own. Nothing typed here is saved back as a
 * new Cellix conversation, which is why a reload starts clean.
 */
export function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { conversations } = useAppContext()
  const account = useAppStore((s) => s.account)
  const applyBalance = useAppStore((s) => s.applyBalance)
  const refreshAccount = useAppStore((s) => s.refreshAccount)
  const pushToast = useToastStore((s) => s.pushToast)

  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [estimate, setEstimate] = useState<number | null>(null)
  const [detail, setDetail] = useState<ConversationDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const summary = useMemo(
    () => conversations.find((c) => c.conversationId === conversationId),
    [conversations, conversationId],
  )

  // Reset the transcript when switching between sessions, or the previous
  // session's answers appear under the new session's header.
  useEffect(() => {
    setTurns([])
    setInput('')
    setEstimate(null)
  }, [conversationId])

  useEffect(() => {
    if (!conversationId) {
      setDetail(null)
      return
    }
    let cancelled = false
    setDetailLoading(true)
    appService
      .getConversation(conversationId)
      .then((data) => {
        if (!cancelled) setDetail(data)
      })
      .catch(() => {
        if (!cancelled) setDetail(null)
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [conversationId])

  // Pre-send price. Debounced so typing doesn't fire a request per character.
  useEffect(() => {
    const question = input.trim()
    if (!question) {
      setEstimate(null)
      return
    }
    let cancelled = false
    const timer = setTimeout(() => {
      appService
        .estimateChat(question, conversationId)
        .then((result) => {
          if (!cancelled) setEstimate(result.credits)
        })
        .catch(() => {
          if (!cancelled) setEstimate(null)
        })
    }, ESTIMATE_DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [input, conversationId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns])

  const balance = account?.availableBalance ?? 0
  // Fall back to the cheapest catalog price (FORMULA_QA_SIMPLE = 2) before an
  // estimate lands, so the button isn't wrongly enabled at zero balance.
  const projectedCost = estimate ?? 2
  const insufficient = account !== null && balance < projectedCost
  const canSend = input.trim().length > 0 && !sending && !insufficient

  const send = useCallback(async () => {
    const question = input.trim()
    if (!question || sending) return

    const userTurn: ChatTurn = { id: `u-${Date.now()}`, role: 'user', content: question }
    const pendingId = `a-${Date.now()}`
    setTurns((prev) => [
      ...prev,
      userTurn,
      { id: pendingId, role: 'assistant', content: '', pending: true },
    ])
    setInput('')
    setEstimate(null)
    setSending(true)

    try {
      const result = await appService.askChat(question, conversationId)
      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === pendingId
            ? {
                ...turn,
                content: result.answer,
                creditsCost: result.creditsDeducted,
                citations: result.citations,
                pending: false,
              }
            : turn,
        ),
      )
      // The response carries the post-debit balance, so the sidebar updates
      // without a refetch round trip.
      applyBalance(result.newBalance)
    } catch (error) {
      const isCredit = error instanceof ApiError && error.isInsufficientCredit
      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === pendingId
            ? {
                ...turn,
                pending: false,
                failed: true,
                content: isCredit
                  ? 'Insufficient credits. Upgrade your plan or buy a top-up pack to continue.'
                  : 'Something went wrong answering that. Please try again.',
              }
            : turn,
        ),
      )
      if (isCredit) {
        void refreshAccount()
      } else {
        pushToast('Could not get an answer. Please try again.', 'error')
      }
    } finally {
      setSending(false)
      textareaRef.current?.focus()
    }
  }, [input, sending, conversationId, applyBalance, refreshAccount, pushToast])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter newlines — the convention users expect here.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  const headerTitle = conversationId
    ? (summary?.title ?? detail?.title ?? 'Session')
    : 'Ask about your Excel work'

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate font-display text-base text-foreground">{headerTitle}</h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              Read-only — this chat never changes your workbook
            </p>
          </div>
          <span className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-foreground sm:inline-flex">
            <Coins className="h-3.5 w-3.5 text-accent" />
            {balance.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Scoped-session context strip */}
      {conversationId && (
        <div className="shrink-0 border-b border-border bg-secondary/40 px-4 py-2.5 sm:px-6">
          <div className="mx-auto flex w-full max-w-3xl items-start gap-2 text-xs text-muted-foreground">
            <FileSpreadsheet className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {detailLoading ? (
              <span>Loading session…</span>
            ) : detail ? (
              <span className="min-w-0">
                {detail.messages.length} message
                {detail.messages.length === 1 ? '' : 's'}
                {detail.sheetSnapshot &&
                  ` · ${detail.sheetSnapshot.rowCount} rows × ${detail.sheetSnapshot.columnCount} cols`}
                {detail.sheetSnapshot && detail.sheetSnapshot.headers.length > 0 && (
                  <span className="block truncate">
                    Columns: {detail.sheetSnapshot.headers.join(', ')}
                  </span>
                )}
              </span>
            ) : (
              <span>Session details unavailable.</span>
            )}
          </div>
        </div>
      )}

      {/* Transcript */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          {turns.length === 0 && <EmptyState scoped={Boolean(conversationId)} />}

          <div className="space-y-5">
            {turns.map((turn) => (
              <TurnBubble key={turn.id} turn={turn} />
            ))}
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-border bg-background px-4 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto w-full max-w-3xl">
          {insufficient && (
            <div className="mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-700">
              <span>Insufficient credits. Upgrade or buy more to keep chatting.</span>
              <Link to="/app/billing" className="font-medium underline underline-offset-2">
                See plans
              </Link>
            </div>
          )}

          <div
            className={cn(
              'flex items-end gap-2 rounded-xl border bg-background p-2 transition-colors',
              insufficient ? 'border-red-500/40' : 'border-border focus-within:border-accent',
            )}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={sending}
              placeholder={
                conversationId
                  ? 'Ask about this session…'
                  : 'Ask about your Excel work…'
              }
              aria-label="Message"
              className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={!canSend}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-2 px-1">
            <p className="text-[0.7rem] text-muted-foreground">
              {input.trim()
                ? estimate !== null
                  ? `Using ${estimate} credit${estimate === 1 ? '' : 's'}`
                  : 'Estimating…'
                : 'Enter to send · Shift+Enter for a new line'}
            </p>
            <p className="text-[0.7rem] text-muted-foreground/70">
              {balance.toLocaleString('en-IN')} credits left
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ scoped }: { scoped: boolean }) {
  const prompts = scoped
    ? ['What did Cellix change in this session?', 'Summarise what happened here.', 'What columns did this sheet have?']
    : ['What did I work on most recently?', 'Summarise my last few sessions.', 'Which sessions touched GST data?']

  return (
    <div className="py-10 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-accent/10">
        <Info className="h-5 w-5 text-accent" />
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">
        {scoped ? 'Ask about this session' : 'Ask about your Excel work'}
      </p>
      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
        Cellix reads your saved sessions to answer. It can explain what
        happened, but can't change a workbook from here.
      </p>
      <ul className="mx-auto mt-5 flex max-w-sm flex-col gap-1.5">
        {prompts.map((prompt) => (
          <li
            key={prompt}
            className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground"
          >
            {prompt}
          </li>
        ))}
      </ul>
    </div>
  )
}

function TurnBubble({ turn }: { turn: ChatTurn }) {
  if (turn.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground">
          {turn.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[92%]">
        <div
          className={cn(
            'rounded-2xl rounded-bl-sm border px-3.5 py-2.5 text-sm leading-relaxed',
            turn.failed
              ? 'border-red-500/30 bg-red-500/10 text-red-700'
              : 'border-border bg-secondary/60 text-foreground',
          )}
        >
          {turn.pending ? (
            <span className="flex items-center gap-1.5 py-0.5" role="status" aria-label="Thinking">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
          ) : (
            <p className="whitespace-pre-wrap">{turn.content}</p>
          )}
        </div>

        {!turn.pending && !turn.failed && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 px-1">
            {turn.creditsCost !== undefined && turn.creditsCost > 0 && (
              <span className="text-[0.7rem] text-muted-foreground">
                {turn.creditsCost} credit{turn.creditsCost === 1 ? '' : 's'}
              </span>
            )}
            {turn.citations && turn.citations.length > 0 && (
              <span className="flex flex-wrap items-center gap-1.5 text-[0.7rem] text-muted-foreground">
                From:
                {turn.citations.slice(0, 3).map((citation) => (
                  <Link
                    key={citation.conversationId}
                    to={`/app/session/${citation.conversationId}`}
                    className="max-w-48 truncate rounded bg-secondary px-1.5 py-0.5 underline-offset-2 hover:underline"
                  >
                    {citation.title}
                  </Link>
                ))}
                {turn.citations.length > 3 && <span>+{turn.citations.length - 3} more</span>}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
