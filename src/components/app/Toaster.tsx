import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useToastStore } from '@/lib/appStore'
import { cn } from '@/lib/utils'

const toneStyles = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  error: 'border-red-500/30 bg-red-500/10 text-red-700',
  info: 'border-border bg-background text-foreground',
} as const

const toneIcons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const

/**
 * Global toast host. Mounted once in AppLayout so a toast raised during a
 * route change (notably the post-payment "Payment successful!" on /app)
 * survives the navigation that triggered it.
 */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismissToast)

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = toneIcons[toast.tone]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'pointer-events-auto flex items-start gap-2.5 rounded-xl border p-3 shadow-lg backdrop-blur',
                toneStyles[toast.tone],
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="flex-1 text-sm leading-snug">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
                className="rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
