import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSession, signUpWithEmailPassword, signOut } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import cellixLogo from '@/assets/cellix-logo.png'

const SUBMIT_MIN_MS = 900

function waitAtLeast(startedAt: number, minMs: number): Promise<void> {
  const remaining = minMs - (Date.now() - startedAt)
  if (remaining <= 0) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, remaining))
}

export function RegisterPage() {
  const { data: session, isPending } = useSession()
  const [searchParams] = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [justRegistered, setJustRegistered] = useState(false)
  // Preserved through to /login so the Excel-opened flow keeps knowing it's
  // opened from the add-in and which SSE connection to notify
  // (client/src/auth/useAuth.ts openEmailLoginPage / waitForEmailLogin).
  const fromExcel = searchParams.get('from') === 'excel'
  const excelToken = searchParams.get('token')
  const loginUrl = `/login?registered=1${
    fromExcel ? `&from=excel&token=${encodeURIComponent(excelToken ?? '')}` : ''
  }`

  if (isPending && !submitting) {
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

  // Already signed in and not just from this page's own submit — send them on.
  // Excel-opened tabs must keep the token and notify the add-in, not bounce to /app.
  if (session?.user && !justRegistered && !submitting) {
    if (fromExcel) {
      return (
        <Navigate
          to={`/login?from=excel&token=${encodeURIComponent(excelToken ?? '')}`}
          replace
        />
      )
    }
    return <Navigate to="/app" replace />
  }

  if (justRegistered && !submitting) {
    return <Navigate to={loginUrl} replace />
  }

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)
    const startedAt = Date.now()
    try {
      const { error: signUpError } = await signUpWithEmailPassword(email, password, name)
      if (signUpError) {
        setError(signUpError.message ?? 'Could not create your account.')
        await waitAtLeast(startedAt, SUBMIT_MIN_MS)
        return
      }
      // Better Auth's signUp.email also signs the new account in
      // immediately. Sign back out so /login shows the login form instead
      // of bouncing straight to /app — registering and logging in are kept
      // as two separate steps here, matching the site's requested flow.
      await signOut()
      await waitAtLeast(startedAt, SUBMIT_MIN_MS)
      setJustRegistered(true)
    } catch {
      setError('Could not create your account. Please try again.')
      await waitAtLeast(startedAt, SUBMIT_MIN_MS)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      {submitting ? (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-[2px]"
          role="status"
          aria-live="polite"
          aria-label="Creating your account"
        >
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-accent" />
          <p className="text-sm text-muted-foreground">Creating your account…</p>
        </div>
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
          Create your account
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
          Sign up with email and password to start using Cellix in Excel.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <form className="mt-7 space-y-3" onSubmit={(e) => void handleRegister(e)}>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-foreground">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
            />
          </div>
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
              disabled={submitting}
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
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-xs font-medium text-foreground"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              'flex w-full items-center justify-center gap-2.5 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition-colors',
              'hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to={
              fromExcel
                ? `/login?from=excel&token=${encodeURIComponent(excelToken ?? '')}`
                : '/login'
            }
            className="font-medium text-foreground underline underline-offset-2 hover:text-accent"
          >
            Log in
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
