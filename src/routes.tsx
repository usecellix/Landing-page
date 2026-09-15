import type { ReactElement } from 'react'
import App from './App.tsx'
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage'
import { TermsPage } from '@/pages/TermsPage'
import { SupportPage } from '@/pages/SupportPage'
import { PricingPage } from '@/pages/PricingPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { CheckoutSuccessPage } from '@/pages/CheckoutSuccessPage'
import { LoginPage } from '@/pages/LoginPage'
import { AppLayout } from '@/components/app/AppLayout'
import { DashboardPage } from '@/pages/app/DashboardPage'
import { ChatPage } from '@/pages/app/ChatPage'
import { SessionPage } from '@/pages/app/SessionPage'
import { BillingPage } from '@/pages/app/BillingPage'
import { SettingsPage } from '@/pages/app/SettingsPage'

/** Canonical origin. Apex redirects here with a 308, so every URL we emit uses it. */
export const SITE_ORIGIN = 'https://www.usecellix.com'

export interface RouteMeta {
  title: string
  description: string
  /** Keeps the route out of the sitemap and adds <meta name="robots" content="noindex,nofollow">. */
  noindex?: boolean
  /**
   * Skips build-time prerendering (scripts/prerender.mjs) and emits an SPA
   * shell instead. Required for the signed-in /app routes: they read the Better
   * Auth session, which only exists in a browser — rendering them on the server
   * would either crash the build or bake a signed-out snapshot into the HTML
   * that then flashes before hydration corrects it.
   */
  clientOnly?: boolean
  changefreq?: string
  priority?: string
  /** Extra schema.org nodes merged into this route's @graph. */
  jsonLd?: Record<string, unknown>[]
}

export interface RouteDef {
  path: string
  element: ReactElement
  meta: RouteMeta
}

const organization = {
  '@type': 'Organization',
  '@id': `${SITE_ORIGIN}/#organization`,
  name: 'CELLIX',
  // The bare name is contested (Cellix Ltd / Randox, CellX, Accellix), so the
  // two-word forms are declared explicitly to help disambiguate the entity.
  alternateName: ['Cellix Excel', 'Cellix Excel AI', 'usecellix'],
  url: `${SITE_ORIGIN}/`,
  logo: `${SITE_ORIGIN}/apple-touch-icon.png`,
  description:
    'Excel AI for Indian chartered accountants and finance professionals.',
  areaServed: { '@type': 'Country', name: 'India' },
}

const website = {
  '@type': 'WebSite',
  '@id': `${SITE_ORIGIN}/#website`,
  url: `${SITE_ORIGIN}/`,
  name: 'CELLIX',
  inLanguage: 'en-IN',
  publisher: { '@id': `${SITE_ORIGIN}/#organization` },
}

const softwareApplication = {
  '@type': 'SoftwareApplication',
  '@id': `${SITE_ORIGIN}/#software`,
  name: 'CELLIX',
  alternateName: 'Cellix Excel',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Accounting Software',
  operatingSystem: 'Microsoft Excel, Windows, Web',
  url: `${SITE_ORIGIN}/`,
  publisher: { '@id': `${SITE_ORIGIN}/#organization` },
  featureList: [
    'GST reconciliation',
    'Tally export cleanup',
    'ITC computation',
    'TDS 26AS matching',
    'Bank reconciliation',
    'Audit-ready change log',
    'Approval required on every edit',
  ],
  // Restore with /pricing. Structured data has to match what a visitor can
  // actually see, so prices must not be published while the page is hidden.
  // offers: {
  //   '@type': 'AggregateOffer',
  //   priceCurrency: 'INR',
  //   lowPrice: '0',
  //   highPrice: '5999',
  //   offerCount: '4',
  //   availability: 'https://schema.org/InStock',
  //   url: `${SITE_ORIGIN}/pricing`,
  // },
}

export const routes: RouteDef[] = [
  {
    path: '/',
    element: <App />,
    meta: {
      title:
        'CELLIX — Intelligent Excel AI built for Indian CAs and finance professionals',
      description:
        'CELLIX helps Chartered Accountants and commerce professionals work smarter in Excel — GST reconciliation, Tally cleanup, and audit-ready work with your approval on every change.',
      changefreq: 'weekly',
      priority: '1.0',
      jsonLd: [organization, website, softwareApplication],
    },
  },
  {
    path: '/privacy',
    element: <PrivacyPolicyPage />,
    meta: {
      title: 'Privacy Policy — Cellix Excel',
      description:
        'How Cellix handles your data. Client spreadsheet content is used only to complete the task you request in that session and is not retained afterwards.',
      changefreq: 'yearly',
      priority: '0.3',
    },
  },
  {
    path: '/terms',
    element: <TermsPage />,
    meta: {
      title: 'Terms of Service — Cellix Excel',
      description:
        'The terms governing use of Cellix, the Excel AI assistant for Indian chartered accountants and finance professionals.',
      changefreq: 'yearly',
      priority: '0.3',
    },
  },
  {
    path: '/support',
    element: <SupportPage />,
    meta: {
      title: 'Support — Cellix Excel',
      description:
        'Get help with the Cellix Excel add-in — contact us, or check common questions about setup, accepting changes, and billing.',
      changefreq: 'yearly',
      priority: '0.3',
    },
  },
  {
    path: '/pricing',
    element: <PricingPage />,
    meta: {
      title: 'Pricing — Cellix Excel AI for Indian CAs',
      description:
        'Cellix pricing in rupees: a free tier, Solo at ₹1,299/month for 500 credits, and Firm at ₹5,999/month for 3,000 pooled credits. Every action is priced up front.',
      changefreq: 'monthly',
      priority: '0.8',
      jsonLd: [
        {
          '@type': 'WebPage',
          '@id': `${SITE_ORIGIN}/pricing#webpage`,
          url: `${SITE_ORIGIN}/pricing`,
          name: 'Cellix pricing',
          inLanguage: 'en-IN',
          isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
          about: { '@id': `${SITE_ORIGIN}/#software` },
        },
      ],
    },
  },
  {
    path: '/checkout',
    element: <CheckoutPage />,
    meta: {
      title: 'Checkout — Cellix Excel',
      description: 'Start your Cellix subscription.',
      // Transactional, and ?plan= would multiply into near-duplicate URLs.
      noindex: true,
    },
  },
  {
    path: '/checkout/success',
    element: <CheckoutSuccessPage />,
    meta: {
      title: 'Subscription confirmed — Cellix Excel',
      description: 'Your Cellix subscription is active.',
      noindex: true,
    },
  },
  {
    path: '/login',
    element: <LoginPage />,
    meta: {
      title: 'Sign in — Cellix Excel',
      description: 'Sign in to Cellix with Google or Microsoft.',
      noindex: true,
      clientOnly: true,
    },
  },
  // The signed-in product surface. Every one of these is behind AppLayout's
  // auth gate and is client-only (see RouteMeta.clientOnly).
  {
    path: '/app',
    element: (
      <AppLayout>
        <DashboardPage />
      </AppLayout>
    ),
    meta: {
      title: 'Dashboard — Cellix',
      description: 'Your Cellix dashboard.',
      noindex: true,
      clientOnly: true,
    },
  },
  {
    path: '/app/chat',
    element: (
      <AppLayout>
        <ChatPage />
      </AppLayout>
    ),
    meta: {
      title: 'Chat — Cellix',
      description: 'Ask about your Excel work.',
      noindex: true,
      clientOnly: true,
    },
  },
  {
    path: '/app/session/:conversationId',
    element: (
      <AppLayout>
        <SessionPage />
      </AppLayout>
    ),
    meta: {
      title: 'Session — Cellix',
      description: 'Review an Excel session.',
      noindex: true,
      clientOnly: true,
    },
  },
  {
    path: '/app/billing',
    element: (
      <AppLayout>
        <BillingPage />
      </AppLayout>
    ),
    meta: {
      title: 'Plans & credits — Cellix',
      description: 'Manage your Cellix plan and credits.',
      noindex: true,
      clientOnly: true,
    },
  },
  {
    path: '/app/settings',
    element: (
      <AppLayout>
        <SettingsPage />
      </AppLayout>
    ),
    meta: {
      title: 'Settings — Cellix',
      description: 'Your Cellix account settings.',
      noindex: true,
      clientOnly: true,
    },
  },
]

/** Serialisable view of the routes, for the build-time prerender and sitemap. */
export const routeManifest = routes.map(({ path, meta }) => ({ path, meta }))
