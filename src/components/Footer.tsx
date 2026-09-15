import { Link } from 'react-router-dom'
import cellixLogoWhite from '@/assets/cellix-logo-white.png'
import {
  contactEmail,
  facebookUrl,
  instagramUrl,
  linkedInUrl,
  xUrl,
} from '@/config/site'
import { pagePadding } from '@/lib/layout'
import { cn } from '@/lib/utils'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M14 8.5V6.75c0-.69.56-1.25 1.25-1.25H17V3h-2.5C12.46 3 11 4.46 11 6.25V8.5H9v3h2V21h3v-9.5H16l.5-3H14z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6.5 8.5h3v11h-3v-11zm1.5-4.5a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5zM10 8.5h2.9v1.5h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.59V19.5h-3v-5.34c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.81v5.43H10V8.5z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Workflows', href: '/#use-cases' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Trust', href: '/#trust' },
  // Hidden while early access — restore with the /pricing route.
  // { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/#contact' },
  { label: 'Support', href: '/support' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
]

const socialLinks = [
  { label: 'Instagram', href: instagramUrl, icon: InstagramIcon },
  { label: 'Facebook', href: facebookUrl, icon: FacebookIcon },
  { label: 'LinkedIn', href: linkedInUrl, icon: LinkedInIcon },
  { label: 'X', href: xUrl, icon: XIcon },
].filter((social) => Boolean(social.href))

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-primary text-white">
      {/* Same accent wash as the closing CTA card, so the two dark blocks
          read as one closing move rather than two unrelated slabs. */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(circle at 30% 20%, hsl(var(--accent) / 0.5), transparent 60%)',
        }}
      />

      {/* The wordmark is texture, not a billboard — hence the low opacity. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex justify-center"
        aria-hidden
      >
        <img
          src={cellixLogoWhite}
          alt=""
          className="w-[min(100vw,72rem)] max-w-none translate-y-[42%] opacity-[0.07] sm:translate-y-[40%] md:translate-y-[38%]"
        />
      </div>

      <div
        className={cn(
          pagePadding,
          'relative z-10 mx-auto max-w-7xl pt-14 pb-20 sm:pt-16 sm:pb-24 md:pt-20 md:pb-28',
        )}
      >
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12 xl:gap-16">
          <div className="w-full max-w-md flex-1 lg:max-w-sm xl:max-w-lg">
            <Link to="/" className="inline-flex min-h-11 w-fit items-center">
              <img
                src={cellixLogoWhite}
                alt="cellix"
                className="h-8 w-auto sm:h-9"
              />
            </Link>

            <p className="mt-5 text-sm leading-relaxed text-white/55 font-body sm:mt-6 sm:text-[0.9375rem]">
            Intelligent Excel AI built for Indian CAs and finance professionals —
              faster books, cleaner exports, your approval on every change.
            </p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/75 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            <a
              href={`mailto:${contactEmail}`}
              className="mt-4 inline-flex min-h-11 items-center text-sm text-white/70 transition-colors hover:text-white font-body"
            >
              {contactEmail}
            </a>
          </div>

          <nav className="w-full shrink-0 lg:w-auto lg:pt-1 lg:text-right">
            <ul className="grid grid-cols-2 gap-x-6 sm:gap-x-8 lg:flex lg:flex-col lg:items-end">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-sm text-white/80 transition-colors hover:text-white font-body lg:justify-end"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-12 text-xs text-white/60 font-body sm:mt-14 lg:mt-16 xl:mt-24">
          © {new Date().getFullYear()} cellix. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
