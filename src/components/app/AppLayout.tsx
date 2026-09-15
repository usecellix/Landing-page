import { useCallback, useEffect, useState } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { useAppStore } from '@/lib/appStore'
import { appService } from '@/lib/appService'
import type { ConversationSummary, SessionUser } from '@/lib/appTypes'
import { AppContext, type AppOutletContext } from './appContext'
import { AppSidebar } from './AppSidebar'
import { CreditBadge } from './CreditBadge'
import { UserMenu } from './UserMenu'
import { Toaster } from './Toaster'
import cellixLogo from '@/assets/cellix-logo.png'


/**
 * Shell for every /app route: auth gate, sidebar, top bar, toasts.
 *
 * The conversation list is loaded HERE rather than per-page because the
 * sidebar shows it on every route — fetching it inside each page would mean
 * the sidebar's contents changed depending on which page was open, and would
 * refetch on each navigation.
 */
export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()
  const refreshAccount = useAppStore((s) => s.refreshAccount)
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()
  const params = useParams()

  const user = session?.user as SessionUser | undefined

  const reloadConversations = useCallback(async () => {
    setConversationsLoading(true)
    try {
      const page = await appService.listConversations()
      setConversations(page.conversations)
    } catch {
      setConversations([])
    } finally {
      setConversationsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    void refreshAccount()
    void reloadConversations()
  }, [user, refreshAccount, reloadConversations])

  // Close the mobile drawer on navigation, or it stays over the new page.
  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent"
          role="status"
          aria-label="Loading"
        />
      </div>
    )
  }

  if (!user) {
    // `state` lets /login send the user back where they were headed.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const handleDeleted = (conversationId: string) => {
    setConversations((prev) => prev.filter((c) => c.conversationId !== conversationId))
  }

  const context: AppOutletContext = {
    user,
    conversations,
    conversationsLoading,
    reloadConversations,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans antialiased">
      {/* Desktop rail */}
      <div className="hidden w-67.5 shrink-0 lg:block">
        <AppSidebar
          conversations={conversations}
          loading={conversationsLoading}
          activeConversationId={params.conversationId}
          onDeleted={handleDeleted}
        />
      </div>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 w-70 max-w-[85vw] bg-background shadow-xl">
            <AppSidebar
              conversations={conversations}
              loading={conversationsLoading}
              activeConversationId={params.conversationId}
              onDeleted={handleDeleted}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary lg:hidden"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <img src={cellixLogo} alt="cellix" className="h-5 w-auto brightness-0 lg:hidden" />
          </div>

          <div className="flex items-center gap-2.5">
            <CreditBadge />
            <UserMenu user={user} />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-hidden">
          <AppContext.Provider value={context}>{children}</AppContext.Provider>
        </main>
      </div>

      <Toaster />
    </div>
  )
}
