import { createContext, useContext } from 'react'
import type { ConversationSummary, SessionUser } from '@/lib/appTypes'

export interface AppOutletContext {
  user: SessionUser
  conversations: ConversationSummary[]
  conversationsLoading: boolean
  reloadConversations: () => Promise<void>
}

/*
 * A plain context rather than react-router's Outlet context: the routes here
 * are declared as elements (routes.tsx), not as a nested <Outlet> tree, so
 * useOutletContext would have nothing to read from.
 *
 * Lives in its own module so AppLayout.tsx exports only components — a file
 * that mixes the two breaks React Fast Refresh.
 */
export const AppContext = createContext<AppOutletContext | null>(null)

export function useAppContext(): AppOutletContext {
  const value = useContext(AppContext)
  if (!value) throw new Error('useAppContext must be used inside AppLayout')
  return value
}
