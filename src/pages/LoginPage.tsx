import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  useSession,
  signIn,
  signInWithEmailPassword,
  notifyExcelLoginComplete,
  type SocialProvider,
} from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import cellixLogo from '@/assets/cellix-logo.png'

/** Keep the submit spinner visible briefly so success doesn't flash instantly. */
const SUBMIT_MIN_MS = 900

function waitAtLeast(startedAt: number, minMs: number): Promise<void> {
  const remaining = minMs - (Date.now() - startedAt)
  if (remaining <= 0) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, remaining))
}

/** Inline brand marks — avoids pulling a whole icon pack for two logos. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.63Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.17l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.73a5.41 5.41 0 0 1 0-3.46V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  )
}

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden="true">
      <path fill="#F25022" d="M0 0h8.5v8.5H0z" />
      <path fill="#7FBA00" d="M9.5 0H18v8.5H9.5z" />
      <path fill="#00A4EF" d="M0 9.5h8.5V18H0z" />
      <path fill="#FFB900" d="M9.5 9.5H18V18H9.5z" />
    </svg>
  )
}

function FormBusyOverlay({ label }: { label: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-accent" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export function LoginPage() {
  const { data: session, isPending, refetch: refetchSession } = useSession()
  const [searchParams] = useSearchParams()
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailPending, setEmailPending] = useState(false)
  // Opened from the Excel add-in's "Log in with email and password" link
  // (openEmailLoginPage in client/src/auth/useAuth.ts) — success here
  // notifies the add-in's waiting SSE connection (notifyExcelLoginComplete)
  // instead of redirecting to /app, with a plain "go back to Excel" message
  // as the fallback if that push doesn't land (tab closed, connection drop).
  const fromExcel = searchParams.get('from') === 'excel'
  const excelToken = searchParams.get('token')

  useEffect(() => {
    if (searchParams.get('error')) {
      setError('That sign-in did not complete. Please try again.')
    }
    if (searchParams.get('registered')) {
      setNotice('Account created. Sign in below.')
    }
  }, [searchParams])

  // Fires once a session exists on this tab (either provider) when opened
  // from Excel — pushes completion to the add-in's waiting SSE connection.
  // Skip while emailPending so notify runs once from handleEmailSignIn with loading held.
  useEffect(() => {
    if (fromExcel && excelToken && session?.user && !emailPending) {
      void notifyExcelLoginComplete(excelToken)
    }
  }, [fromExcel, excelToken, session, emailPending])

  if (isPending && !emailPending) {
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

  if (session?.user && !emailPending) {
    if (fromExcel) {
      return <SignedInFromExcel />
    }
    return <Navigate to="/app" replace />
  }

  async function handleSignIn(provider: SocialProvider) {
    setError(null)
    setPendingProvider(provider)
    try {
      const callbackURL = fromExcel
        ? `${window.location.origin}/login?from=excel&token=${encodeURIComponent(excelToken ?? '')}`
        : `${window.location.origin}/app`
      await signIn.social({
        provider,
        callbackURL,
        errorCallbackURL: `${window.location.origin}/login?error=oauth`,
      })
    } catch {
      setError('Could not start sign-in. Please try again.')
      setPendingProvider(null)
    }
  }

  async function handleEmailSignIn(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setNotice(null)
    setEmailPending(true)
    const startedAt = Date.now()
    try {
      const { error: signInError } = await signInWithEmailPassword(email, password)
      if (signInError) {
        setError(signInError.message ?? 'Invalid email or password.')
        await waitAtLeast(startedAt, SUBMIT_MIN_MS)
        return
      }
      await refetchSession()
      if (fromExcel && excelToken) {
        await notifyExcelLoginComplete(excelToken)
      }
      await waitAtLeast(startedAt, SUBMIT_MIN_MS)
      if (!fromExcel) {
        window.location.href = '/app'
      }
    } catch {
      setError('Could not sign in. Please try again.')
      await waitAtLeast(startedAt, SUBMIT_MIN_MS)
    } finally {
      setEmailPending(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      {emailPending ? (
        <FormBusyOverlay
          label={fromExcel ? 'Signing you in — connecting to Excel…' : 'Signing you in…'}
        />
      ) : null}
      <Link to="/" className="mb-10">
        <img src={cellixLogo} alt="cellix" className="h-8 w-auto brightness-0" />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <h1 className="text-center font-display text-2xl tracking-tight text-foreground">
          Sign in to Cellix
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
          {fromExcel
            ? 'Sign in here, then switch back to Excel — it will pick up automatically.'
            : 'Use the same account you use in the Excel add-in — your sessions and credits follow you here.'}
        </p>

        {notice && !error && (
          <p className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700">
            {notice}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-7 space-y-2.5">
          <ProviderButton
            provider="google"
            label="Continue with Google"
            icon={<GoogleMark />}
            pending={pendingProvider === 'google'}
            disabled={pendingProvider !== null || emailPending}
            onClick={() => void handleSignIn('google')}
          />
          <ProviderButton
            provider="microsoft"
            label="Continue with Microsoft"
            icon={<MicrosoftMark />}
            pending={pendingProvider === 'microsoft'}
            disabled={pendingProvider !== null || emailPending}
            onClick={() => void handleSignIn('microsoft')}
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form className="mt-6 space-y-3" onSubmit={(e) => void handleEmailSignIn(e)}>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={emailPending || pendingProvider !== null}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={emailPending || pendingProvider !== null}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={emailPending || pendingProvider !== null}
            className={cn(
              'flex w-full items-center justify-center gap-2.5 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition-colors',
              'hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            {emailPending ? 'Signing in…' : 'Log in with email'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            to={
              fromExcel
                ? `/register?from=excel&token=${encodeURIComponent(excelToken ?? '')}`
                : '/register'
            }
            className="font-medium text-foreground underline underline-offset-2 hover:text-accent"
          >
            Register
          </Link>
        </p>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          By continuing you agree to our{' '}
          <Link to="/terms" className="underline underline-offset-2 hover:text-foreground">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </motion.div>
    </div>
  )
}

function SignedInFromExcel() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <Link to="/" className="mb-10">
        <img src={cellixLogo} alt="cellix" className="h-8 w-auto brightness-0" />
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <h1 className="font-display text-2xl tracking-tight text-foreground">You're signed in</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          You can close this tab now and go back to Excel — the add-in will switch over
          automatically.
        </p>
      </motion.div>
    </div>
  )
}

function ProviderButton({
  label,
  icon,
  pending,
  disabled,
  onClick,
}: {
  provider: SocialProvider
  label: string
  icon: React.ReactNode
  pending: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors',
        'hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60',
      )}
    >
      {pending ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent"
          aria-hidden="true"
        />
      ) : (
        icon
      )}
      {pending ? 'Redirecting…' : label}
    </button>
  )
}
