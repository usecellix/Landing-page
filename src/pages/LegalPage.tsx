import type { ReactNode } from 'react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { pageContainer, pagePadding } from '@/lib/layout'
import { legalLastUpdated } from '@/config/legal'
import { cn } from '@/lib/utils'

/**
 * Shell for /privacy and /terms. Deliberately static — no entrance animation,
 * so the text is present and readable the moment the HTML lands, including for
 * crawlers and compliance reviewers that do not run JavaScript.
 */
export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string
  intro: string
  children: ReactNode
}) {
  return (
    <div className="overflow-x-hidden bg-background font-sans antialiased">
      <Navbar />

      <section className={cn(pagePadding, 'pt-32 pb-16 sm:pt-40 sm:pb-20 md:pt-44')}>
        <div className={cn(pageContainer, 'max-w-3xl')}>
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated {legalLastUpdated}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {intro}
          </p>

          <div className="mt-10 space-y-8">{children}</div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

/** One numbered section of a legal document. */
export function LegalSection({
  heading,
  children,
}: {
  heading: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-body text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        {heading}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  )
}

/** Bulleted list with the spacing the surrounding prose uses. */
export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}
