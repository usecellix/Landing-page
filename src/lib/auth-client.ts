import { createAuthClient } from 'better-auth/react'
import { apiBaseUrl } from '@/config/site'

/**
 * Better Auth client for the marketing site's signed-in app surface.
 *
 * Unlike the Excel add-in's client (frontend/src/auth/auth-client.ts), which
 * points at its own origin and relies on a Vite proxy plus an Office dialog,
 * this one points directly at cellix_backend. A browser tab can complete a
 * normal OAuth redirect, which is the simplest correct flow. The backend must
 * list this site's origin in its trustedOrigins (CLIENT_ORIGIN) for the
 * session cookie to be accepted — see RUN.md.
 */
export const authClient = createAuthClient({
  baseURL: apiBaseUrl,
})

export const { signIn, signOut, useSession } = authClient

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
