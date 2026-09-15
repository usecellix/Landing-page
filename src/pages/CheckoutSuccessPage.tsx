import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { contactEmail } from '@/config/site'
import cellixLogo from '@/assets/cellix-logo.png'

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <Link to="/" className="mb-10">
        <img src={cellixLogo} alt="cellix" className="h-8 w-auto" />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex max-w-md flex-col items-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <CheckCircle2 className="h-7 w-7 text-accent" />
        </div>

        <h1 className="mt-6 font-display text-2xl text-foreground sm:text-3xl">
          You're subscribed
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Payment confirmed and your credits are being added to your account.
          Sign in to the Cellix add-in with the same email you checked out
          with to see your balance.
        </p>

        {sessionId && (
          <p className="mt-4 text-xs text-muted-foreground/70">
            Reference: {sessionId}
          </p>
        )}

        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back to home
        </Link>

        <p className="mt-6 text-xs text-muted-foreground">
          Questions?{' '}
          <a href={`mailto:${contactEmail}`} className="underline underline-offset-2 hover:text-foreground">
            {contactEmail}
          </a>
        </p>
      </motion.div>
    </div>
  )
}
