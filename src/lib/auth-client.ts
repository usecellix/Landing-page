import { createAuthClient } from 'better-auth/react'
import { apiBaseUrl } from '@/config/site'

/**
 * Better Auth client for the marketing site's signed-in app surface.
 *
 * `baseURL` must be the **page origin** (Better Auth appends `/api/auth` itself),
 * same pattern as the Excel add-in. In local dev, Vite proxies `/api/auth` and
 * `/api/*` to Nest — do not point this client at Nest's plain HTTP origin or
 * SameSite=Lax session cookies break on follow-up get-session /
 * excel-login/complete calls (MANUAL_AUTH_IMPLEMENTATION.md).
 */
export const authClient = createAuthClient({
  baseURL:
    typeof window !== 'undefined' ? window.location.origin : 'https://localhost:5173',
})

export const { signIn, signUp, signOut, useSession } = authClient

export type SocialProvider = 'google' | 'microsoft'

/**
 * Starts OAuth and returns the user straight to /app.
 *
 * `callbackURL` is the dashboard itself rather than an intermediate
 * "you're signed in" page — Better Auth performs the redirect after the
 * provider round-trip, so the user lands on their dashboard with no
 * client-side hop in between.
 */
export async function signInWithProvider(provider: SocialProvider): Promise<void> {
  await signIn.social({
    provider,
    callbackURL: `${window.location.origin}/app`,
    errorCallbackURL: `${window.location.origin}/login?error=oauth`,
  })
}

export async function signOutAndGoHome(): Promise<void> {
  await signOut()
  window.location.href = '/'
}

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<ReturnType<typeof signIn.email>> {
  return signIn.email({ email, password })
}

export async function signUpWithEmailPassword(
  email: string,
  password: string,
  name: string,
): Promise<ReturnType<typeof signUp.email>> {
  return signUp.email({ email, password, name })
}

/**
 * Tells the Server this browser tab's sign-in belongs to a specific Excel
 * add-in session (paired by `token`, from the `?token=` query param this
 * page was opened with — see client/src/auth/useAuth.ts openEmailLoginPage).
 * The Server pushes the result to that add-in's waiting SSE connection
 * (GET /excel-login/wait) — see excel-login.controller.ts's complete().
 * Authenticated by this tab's own session cookie, so it can only report a
 * login that actually happened. Best-effort: failure here just means the
 * add-in falls back to its own focus/poll check.
 */
export async function notifyExcelLoginComplete(token: string): Promise<void> {
  try {
    // Prefer same-origin `/api` (Vite proxy in dev). Fall back to absolute
    // apiBaseUrl for production deployments that talk to a public API host.
    const completeUrl = apiBaseUrl.startsWith('http')
      ? `${apiBaseUrl.replace(/\/+$/, '')}/excel-login/complete`
      : `${typeof window !== 'undefined' ? window.location.origin : ''}${apiBaseUrl}/excel-login/complete`
    await fetch(completeUrl, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
  } catch {
    // Best-effort — see doc comment above.
  }
}
