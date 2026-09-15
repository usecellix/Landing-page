import { useState, type FormEvent } from 'react'
import { formSubmitToken, waitlistEmail } from '@/config/site'
import { cn } from '@/lib/utils'

// Prefer the hashed endpoint so the destination address is not sitting in the
// bundle for scrapers; fall back to the address form until the token is set.
const endpoint = `https://formsubmit.co/ajax/${
  formSubmitToken || encodeURIComponent(waitlistEmail)
}`

type Status = 'idle' | 'loading' | 'success' | 'error'

interface WaitlistFormProps {
  className?: string
  inputClassName?: string
  buttonClassName?: string
  compact?: boolean
  variant?: 'default' | 'inverted'
  shape?: 'pill' | 'card'
  buttonLabel?: string
}

export function WaitlistForm({
  className,
  inputClassName,
  buttonClassName,
  compact = false,
  variant = 'default',
  shape = 'pill',
  buttonLabel = 'Join waitlist',
}: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  // Honeypot: hidden from people, irresistible to form-filling bots.
  const [honeypot, setHoneypot] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // A filled honeypot suggests a bot, but we deliberately do NOT drop the
    // submission here: a browser extension or password manager filling the
    // field would silently lose a real signup, which is worse than letting a
    // little spam through. FormSubmit filters on _honey server-side instead.
    if (honeypot) {
      console.warn('Waitlist honeypot was filled; deferring to server-side filtering.')
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch(
        endpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            _subject: 'CELLIX early access waitlist',
            _template: 'table',
            // Makes Reply in the notification go to the person who signed up,
            // rather than to submissions@formsubmit.co.
            _replyto: email.trim(),
            // Second line of defence: FormSubmit drops anything with _honey set.
            _honey: honeypot,
          }),
        },
      )

      // FormSubmit answers 200 even when it refuses the submission — an
      // unactivated destination address returns {"success":"false"}. Checking
      // response.ok alone would show the visitor a confirmation for a signup
      // that was never delivered, so the body is the real result.
      const result = await response.json().catch(() => null)

      if (!response.ok || String(result?.success) !== 'true') {
        throw new Error(result?.message ?? `Submission failed (${response.status})`)
      }

      setStatus('success')
      setEmail('')
    } catch (error) {
      // The visitor gets a generic message; the operator needs the real reason,
      // which for a dropped waitlist is usually "this form needs Activation".
      console.error('Waitlist submission failed:', error)
      setStatus('error')
      setErrorMessage(
        'Something went wrong. Please try again or email us directly.',
      )
    }
  }

  if (status === 'success') {
    return (
      <p
        className={cn(
          'text-center text-sm font-medium font-body',
          variant === 'inverted'
            ? 'text-primary-foreground'
            : 'text-foreground',
          className,
        )}
      >
        You&apos;re on the list. We&apos;ll reach out when early access opens.
      </p>
    )
  }

  return (
    <div className={className}>
      <form
        onSubmit={handleSubmit}
        className={cn(
          'flex w-full border shadow-sm',
          'flex-col gap-2 p-2 sm:flex-row sm:items-center sm:gap-0 sm:p-1 sm:pl-5',
          shape === 'card'
            ? 'rounded-xl'
            : 'rounded-2xl sm:rounded-full',
          variant === 'inverted'
            ? 'border-primary-foreground/20 bg-primary-foreground/10'
            : 'border-border bg-background',
          compact && 'max-w-md',
        )}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status === 'error') setStatus('idle')
          }}
          placeholder="Your email address"
          disabled={status === 'loading'}
          className={cn(
            'min-h-11 w-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none font-body disabled:opacity-60 sm:w-auto sm:px-0',
            variant === 'inverted'
              ? 'text-primary-foreground placeholder:text-primary-foreground/50'
              : 'text-foreground placeholder:text-muted-foreground',
            inputClassName,
          )}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className={cn(
            'flex min-h-11 w-full shrink-0 items-center justify-center px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 font-body sm:w-auto',
            shape === 'card' ? 'rounded-lg' : 'rounded-full',
            variant === 'inverted'
              ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
              : 'bg-primary text-primary-foreground hover:bg-primary/90',
            buttonClassName,
          )}
        >
          {status === 'loading' ? 'Joining…' : buttonLabel}
        </button>

        {/* Honeypot, deliberately LAST. Password managers and browser autofill
            tend to fill the first text input in a form, so placing it before
            the email field made them fill this one — which is exactly how a
            real signup got dropped. Off-screen rather than display:none,
            because some bots skip hidden fields but will fill this. */}
        <input
          type="text"
          name="_honey"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          data-lpignore="true"
          data-1p-ignore
          data-form-type="other"
          className="absolute h-0 w-0 overflow-hidden border-0 p-0 opacity-0"
          style={{ left: '-9999px' }}
        />
      </form>
      {status === 'error' && errorMessage && (
        <p
          className={cn(
            'mt-2 text-center text-xs font-body',
            variant === 'inverted' ? 'text-red-200' : 'text-red-600',
          )}
        >
          {errorMessage}
        </p>
      )}
    </div>
  )
}
