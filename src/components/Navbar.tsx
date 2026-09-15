import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { heroColumns, pageContainer, pagePadding } from '@/lib/layout'
import { cn } from '@/lib/utils'
import { useSession } from '@/lib/auth-client'
import cellixLogo from '@/assets/cellix-logo.png'

/** One entry per section the page actually has. */
const navLinks = [
  { label: 'Workflows', href: '/#use-cases' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Trust', href: '/#trust' },
  { label: 'Contact', href: '/#contact' },
]

/** Past this many pixels the bar stops floating over the hero and takes on a surface. */
const LIFT_AT = 24

export function Navbar() {
  const { scrollY } = useScroll()
  const [lifted, setLifted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()
  const signedIn = Boolean(session?.user)

  useMotionValueEvent(scrollY, 'change', (y) => {
    setLifted(y > LIFT_AT)
  })

  // An open panel over a transparent bar reads as floating, so treat it as lifted.
  const surfaced = lifted || menuOpen

  useEffect(() => {
    if (!menuOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <nav
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b font-body transition-[background-color,border-color,box-shadow] duration-300',
        surfaced
          ? 'border-border/60 bg-background/95 shadow-[0_10px_30px_-24px_rgb(0_0_0/0.5)] backdrop-blur-md'
          : // Still a scrim at rest: the hero's splash canvas runs behind the bar
            'border-transparent bg-background/70 shadow-none backdrop-blur-sm',
      )}
    >
      <div className={pagePadding}>
        <div
          className={cn(
            pageContainer,
            'flex items-center justify-between gap-4 transition-[padding] duration-300',
            lifted ? 'py-2 sm:py-2.5' : 'py-4 sm:py-5',
            heroColumns,
          )}
        >
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="-ml-[0.2em] flex min-h-11 shrink-0 items-center lg:justify-self-start"
          >
            <img
              src={cellixLogo}
              alt="cellix"
              className={cn(
                'w-auto brightness-0 transition-[height] duration-300',
                lifted ? 'h-6 sm:h-7' : 'h-7 sm:h-8',
              )}
            />
          </Link>

          <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3 md:gap-6 lg:gap-5 lg:justify-self-end xl:gap-8">
            <div className="hidden items-center gap-5 md:flex lg:gap-5 xl:gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex min-h-11 items-center whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Below sm the bar is just logo + menu; the action moves into the
                panel, where it gets full width instead of fighting for space. */}
            {!signedIn && (
              <Link
                to="/login"
                className="hidden min-h-11 shrink-0 items-center whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                Sign in
              </Link>
            )}

            <Link
              to={signedIn ? '/app' : '/login'}
              className={cn(
                buttonVariants(),
                'hidden min-h-11 shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium sm:inline-flex md:px-5',
              )}
            >
              {signedIn ? 'Open Cellix' : 'Get started'}
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary md:hidden"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden border-t border-border/60 md:hidden"
          >
            <div className={cn(pagePadding, 'flex flex-col py-2')}>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}

              {!signedIn && (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground sm:hidden"
                >
                  Sign in
                </Link>
              )}

              {/* Carries the primary action at the widths where the bar drops it. */}
              <Link
                to={signedIn ? '/app' : '/login'}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  buttonVariants(),
                  'mt-2 mb-1 min-h-11 w-full rounded-lg px-4 py-2.5 text-sm font-medium sm:hidden',
                )}
              >
                {signedIn ? 'Open Cellix' : 'Get started'}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
