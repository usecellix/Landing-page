import { api } from '@/lib/api'
import type {
  AccountSummary,
  ConversationDetail,
  ConversationListPage,
  LedgerPage,
  WebChatAnswer,
  WebChatEstimate,
} from '@/lib/appTypes'

/**
 * Calls against cellix_backend for the signed-in surface.
 *
 * Conversation reads go to the SAME `/excel-ai/*` routes the Excel add-in
 * uses — not a web-specific mirror. That is deliberate: those routes already
 * enforce ownership server-side, and a parallel set of web-only CRUD routes
 * would be a second place for that check to drift.
 */

export const appService = {
  getAccount: () => api.get<AccountSummary>('/billing/account'),

  getLedger: (cursor?: string) =>
    api.get<LedgerPage>(`/billing/ledger${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`),

  listConversations: (cursor?: string) =>
    api.get<ConversationListPage>(
      `/excel-ai/conversations${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`,
    ),

  getConversation: (conversationId: string) =>
    api.get<ConversationDetail>(`/excel-ai/conversation/${encodeURIComponent(conversationId)}`),

  renameConversation: (conversationId: string, title: string) =>
    api.patch<{ conversationId: string; title: string }>(
      `/excel-ai/conversation/${encodeURIComponent(conversationId)}`,
      { title },
    ),

  deleteConversation: (conversationId: string) =>
    api.delete(`/excel-ai/conversation/${encodeURIComponent(conversationId)}`),

  estimateChat: (question: string, conversationId?: string) =>
    api.post<WebChatEstimate>('/web-chat/estimate', { question, conversationId }),

  askChat: (question: string, conversationId?: string) =>
    api.post<WebChatAnswer>('/web-chat/ask', { question, conversationId }),

  /** Authenticated subscribe — distinct from the guest flow in billing.ts. */
  subscribe: (planTier: 'beta' | 'solo' | 'firm') =>
    api.post<{ url: string }>('/billing/checkout/subscribe', { planTier }),

  topup: (packId: 'small' | 'medium' | 'large') =>
    api.post<{ url: string }>('/billing/checkout/topup', { packId }),
}
