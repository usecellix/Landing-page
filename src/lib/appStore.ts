import { create } from 'zustand'
import { api, ApiError } from '@/lib/api'
import type { AccountSummary } from '@/lib/appTypes'

/**
 * Shared state for the signed-in surface: the credit account, plus a toast
 * queue.
 *
 * The balance lives in one store rather than being fetched per-page because
 * it has to appear in the sidebar, the chat header, the navbar and settings
 * at once, and update the instant a message is sent. Four independent fetches
 * would drift the moment one re-rendered without the others; a single store
 * means one `applyBalance` updates every surface in the same commit.
 */
interface AppState {
  account: AccountSummary | null
  accountLoading: boolean
  accountLoaded: boolean

  refreshAccount: () => Promise<void>
  /**
   * Applies an already-known balance without a round trip — used after a chat
   * reply, whose response carries the post-debit balance. Avoids showing a
   * stale number until a refetch lands.
   */
  applyBalance: (availableBalance: number) => void
  clearAccount: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  account: null,
  accountLoading: false,
  accountLoaded: false,

  refreshAccount: async () => {
    set({ accountLoading: true })
    try {
      const account = await api.get<AccountSummary>('/billing/account')
      set({ account, accountLoading: false, accountLoaded: true })
    } catch (error) {
      // The backend provisions a Free account on read, so a 404 here is not
      // expected — but a 401 (session lapsed) is, and must not leave a stale
      // balance on screen.
      if (error instanceof ApiError && error.isUnauthorized) {
        set({ account: null })
      }
      set({ accountLoading: false, accountLoaded: true })
    }
  },

  applyBalance: (availableBalance) => {
    const account = get().account
    if (!account) return
    set({ account: { ...account, availableBalance } })
  },

  clearAccount: () => set({ account: null, accountLoaded: false }),
}))

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */

export interface Toast {
  id: number
  message: string
  tone: 'success' | 'error' | 'info'
}

interface ToastState {
  toasts: Toast[]
  pushToast: (message: string, tone?: Toast['tone']) => void
  dismissToast: (id: number) => void
}

let toastId = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  pushToast: (message, tone = 'info') => {
    const id = ++toastId
    set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 5000)
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
