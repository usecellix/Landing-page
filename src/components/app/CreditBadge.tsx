import { Coins } from 'lucide-react'
import { useAppStore } from '@/lib/appStore'
import { cn } from '@/lib/utils'

/**
 * Compact balance chip for the app navbar. The large, primary rendering of
 * the balance lives in the sidebar (AppSidebar) — this is the "always visible,
 * even on a page without the sidebar" copy, both reading the same store so
 * they can never disagree.
 */
export function CreditBadge({ className }: { className?: string }) {
  const account = useAppStore((s) => s.account)
  const loading = useAppStore((s) => s.accountLoading)

  const balance = account?.availableBalance

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-foreground',
        className,
      )}
      title="Credit balance"
    >
      <Coins className="h-3.5 w-3.5 text-accent" />
      {loading && balance === undefined ? (
        <span className="text-muted-foreground">…</span>
      ) : (
        <span>{(balance ?? 0).toLocaleString('en-IN')}</span>
      )}
    </span>
  )
}
