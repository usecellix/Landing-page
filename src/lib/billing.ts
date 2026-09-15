import { apiBaseUrl } from '@/config/site'

export type PlanTier = 'solo' | 'firm' | 'beta'

export class CheckoutError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'CheckoutError'
    this.status = status
  }
}

/**
 * Calls cellix_backend's unauthenticated POST /billing/public/checkout/subscribe
 * (billing.controller.ts's PublicBillingController) to create a Razorpay
 * Subscription, then returns its hosted short_url. This marketing site has no
 * login of its own — the visitor's email becomes their credit_accounts
 * billingEntityId; see razorpay-checkout.service.ts's
 * createGuestSubscriptionSession docblock for why.
 */
export async function createGuestCheckoutSession(
  email: string,
  planTier: PlanTier,
): Promise<{ url: string }> {
  const response = await fetch(`${apiBaseUrl}/billing/public/checkout/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, planTier }),
  })

  if (!response.ok) {
    throw new CheckoutError('Could not start checkout — please try again.', response.status)
  }

  return response.json() as Promise<{ url: string }>
}
