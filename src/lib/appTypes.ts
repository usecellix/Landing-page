/** Wire types for the signed-in app surface. Mirror cellix_backend's shapes. */

export type PlanTier = 'free' | 'beta' | 'solo' | 'firm' | 'enterprise'

/** Mirrors CreditAccountQueryService.AccountSummary. */
export interface AccountSummary {
  billingEntityType: 'user' | 'org'
  planTier: PlanTier
  planCredits: number
  purchasedCredits: number
  oneTimeCredits: number
  availableBalance: number
  currentPeriodEnd: string | null
}

export interface LedgerEntry {
  entryType: 'grant' | 'purchase' | 'debit' | 'one_time_grant'
  amount: number
  bucket: 'planCredits' | 'purchasedCredits' | 'oneTimeCredits'
  actionType?: string
  seatUserId?: string
  createdAt: string
}

export interface LedgerPage {
  entries: LedgerEntry[]
  nextCursor: string | null
}

/**
 * Mirrors ConversationSummary (conversation.service.ts). Dates arrive as ISO
 * strings over the wire though the server types them as `Date`.
 */
export interface ConversationSummary {
  conversationId: string
  workbookId?: string
  title: string
  firstMessage: string
  lastMessage: string
  messageCount: number
  status: string
  updatedAt: string | null
}

export interface ConversationListPage {
  conversations: ConversationSummary[]
  nextCursor: string | null
}

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  type?: 'question' | 'answer' | 'command' | 'clarification'
  timestamp?: string
  metadata?: {
    actions?: unknown[]
    changeSetId?: string
  }
}

export interface ConversationDetail {
  conversationId: string
  title?: string
  workbookId?: string
  messages: ConversationMessage[]
  sheetSnapshot?: {
    rowCount: number
    columnCount: number
    headers: string[]
  }
  updatedAt?: string
  createdAt?: string
}

/** Mirrors cellix_backend's WebChatAnswer. */
export interface WebChatAnswer {
  answer: string
  citations: Array<{ conversationId: string; title: string }>
  complexity: 'simple' | 'complex'
  creditsDeducted: number
  newBalance: number
}

export interface WebChatEstimate {
  complexity: 'simple' | 'complex'
  credits: number
}

export interface SessionUser {
  id: string
  name: string
  email: string
  image?: string | null
}

export const PLAN_LABELS: Record<PlanTier, string> = {
  free: 'Free',
  beta: 'Founding Beta',
  solo: 'CA Professional',
  firm: 'Firm',
  enterprise: 'Enterprise',
}

/**
 * Monthly plan credit allotment, for the usage bar's denominator. Mirrors
 * cellix_backend's PLAN_MONTHLY_CREDITS (razorpay-webhook.service.ts) and
 * FREE_TIER_ONE_TIME_CREDITS (credit-gate.service.ts) — kept here rather
 * than fetched, since it's a pricing constant, not per-account data (same
 * reasoning CREDIT_SYSTEM.md CD-1 gives for the cost catalog being code, not
 * a database row). Enterprise has no fixed number (custom plans, CD-8) —
 * null means "don't render a usage bar for this tier."
 */
export const PLAN_MONTHLY_CREDITS: Record<PlanTier, number | null> = {
  free: 120,
  beta: 500,
  solo: 3000,
  firm: 3000,
  enterprise: null,
}
