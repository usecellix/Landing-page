import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, LogOut, Settings, User as UserIcon } from 'lucide-react'
import { signOutAndGoHome } from '@/lib/auth-client'
import { useAppStore } from '@/lib/appStore'
import { PLAN_LABELS, type SessionUser } from '@/lib/appTypes'
import { cn } from '@/lib/utils'

/** Avatar + dropdown: profile, settings, billing, logout. */
export function UserMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false)
  const account = useAppStore((s) => s.account)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase()

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-sm font-semibold text-foreground transition-colors hover:border-accent"
      >
        {user.image ? (
          <img src={user.image} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-background shadow-lg"
        >
          <div className="border-b border-border px-3.5 py-3">
            <p className="truncate text-sm font-medium text-foreground">{user.name || 'Cellix user'}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            {account && (
              <p className="mt-1.5 inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-[0.7rem] font-semibold text-accent">
                {PLAN_LABELS[account.planTier]}
              </p>
            )}
          </div>

          <div className="p-1">
            <MenuLink to="/app/settings" icon={UserIcon} onSelect={() => setOpen(false)}>
              Profile
            </MenuLink>
            <MenuLink to="/app/settings" icon={Settings} onSelect={() => setOpen(false)}>
              Settings
            </MenuLink>
            <MenuLink to="/app/billing" icon={CreditCard} onSelect={() => setOpen(false)}>
              Billing
            </MenuLink>
            <button
              type="button"
              role="menuitem"
              onClick={() => void signOutAndGoHome()}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuLink({
  to,
  icon: Icon,
  children,
  onSelect,
}: {
  to: string
  icon: typeof UserIcon
  children: React.ReactNode
  onSelect: () => void
}) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onSelect}
      className={cn(
        'flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors',
        'hover:bg-secondary hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  )
}
