import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSession, signInWithProvider, type SocialProvider } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import cellixLogo from '@/assets/cellix-logo.png'

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

export function LoginPage() {
  const { data: session, isPending } = useSession()
  const [searchParams] = useSearchParams()
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('error')) {
      setError('That sign-in did not complete. Please try again.')
    }
  }, [searchParams])

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

  if (session?.user) {
    return <Navigate to="/app" replace />
  }

  async function handleSignIn(provider: SocialProvider) {
    setError(null)
    setPendingProvider(provider)
    try {
      await signInWithProvider(provider)
      // On success the browser leaves for the provider; nothing after this runs.
    } catch {
      setError('Could not start sign-in. Please try again.')
      setPendingProvider(null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
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
          Use the same account you use in the Excel add-in — your sessions and
          credits follow you here.
        </p>

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
            disabled={pendingProvider !== null}
            onClick={() => void handleSignIn('google')}
          />
          <ProviderButton
            provider="microsoft"
            label="Continue with Microsoft"
            icon={<MicrosoftMark />}
            pending={pendingProvider === 'microsoft'}
            disabled={pendingProvider !== null}
            onClick={() => void handleSignIn('microsoft')}
          />
        </div>

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
