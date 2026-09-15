import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileSpreadsheet, MessageSquare, Wrench } from 'lucide-react'
import { appService } from '@/lib/appService'
import type { ConversationDetail } from '@/lib/appTypes'
import { ChatPage } from './ChatPage'
import { cn } from '@/lib/utils'

/**
 * One Excel session: the original transcript on the left, an ask-mode chat
 * scoped to it on the right.
 *
 * Below `lg` the two stack into tabs rather than columns — a side-by-side
 * transcript and composer at phone width leaves neither usable.
 */
export function SessionPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const [detail, setDetail] = useState<ConversationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'transcript' | 'chat'>('transcript')

  useEffect(() => {
    if (!conversationId) return
    let cancelled = false
    setLoading(true)
    appService
      .getConversation(conversationId)
      .then((data) => {
        if (!cancelled) setDetail(data)
      })
      .catch(() => {
        if (!cancelled) setDetail(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [conversationId])

  return (
    <div className="flex h-full flex-col">
      {/* Mobile tabs */}
      <div className="flex shrink-0 items-center gap-1 border-b border-border px-4 py-2 lg:hidden">
        <Link
          to="/app"
          className="mr-1 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <TabButton active={tab === 'transcript'} onClick={() => setTab('transcript')}>
          Transcript
        </TabButton>
        <TabButton active={tab === 'chat'} onClick={() => setTab('chat')}>
          Ask
        </TabButton>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Transcript */}
        <div
          className={cn(
            'min-h-0 flex-1 overflow-y-auto border-border lg:block lg:max-w-md lg:border-r',
            tab === 'transcript' ? 'block' : 'hidden',
          )}
        >
          <div className="px-4 py-5 sm:px-5">
            <Link
              to="/app"
              className="mb-4 hidden items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All sessions
            </Link>

            {loading && (
              <div className="space-y-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-secondary/60" />
                ))}
              </div>
            )}

            {!loading && !detail && (
              <p className="text-sm text-muted-foreground">
                This session could not be loaded. It may have passed the 90-day
                retention window.
              </p>
            )}

            {detail && (
              <>
                <h2 className="font-display text-base leading-snug text-foreground">
                  {detail.title || 'Untitled session'}
                </h2>

                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {detail.messages.length} message
                    {detail.messages.length === 1 ? '' : 's'}
                  </span>
                  {detail.sheetSnapshot && (
                    <span className="inline-flex items-center gap-1">
                      <FileSpreadsheet className="h-3 w-3" />
                      {detail.sheetSnapshot.rowCount} × {detail.sheetSnapshot.columnCount}
                    </span>
                  )}
                </div>

                {detail.sheetSnapshot && detail.sheetSnapshot.headers.length > 0 && (
                  <div className="mt-3 rounded-lg bg-secondary/60 px-3 py-2">
                    <p className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
                      Columns
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-foreground">
                      {detail.sheetSnapshot.headers.join(', ')}
                    </p>
                  </div>
                )}

                <div className="mt-5 space-y-3">
                  {detail.messages.map((message) => {
                    const actionCount = message.metadata?.actions?.length ?? 0
                    return (
                      <div key={message.id}>
                        <p className="mb-1 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
                          {message.role === 'user' ? 'You' : 'Cellix'}
                        </p>
                        <div
                          className={cn(
                            'rounded-lg border px-3 py-2 text-xs leading-relaxed',
                            message.role === 'user'
                              ? 'border-border bg-background text-foreground'
                              : 'border-border bg-secondary/60 text-muted-foreground',
                          )}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          {actionCount > 0 && (
                            <p className="mt-2 inline-flex items-center gap-1 rounded bg-accent/10 px-1.5 py-0.5 text-[0.65rem] font-medium text-accent">
                              <Wrench className="h-2.5 w-2.5" />
                              {actionCount} change{actionCount === 1 ? '' : 's'} applied
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scoped chat */}
        <div className={cn('min-h-0 flex-1 lg:block', tab === 'chat' ? 'block' : 'hidden')}>
          <ChatPage />
        </div>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
