export const contactEmail =
  import.meta.env.VITE_CONTACT_EMAIL ?? 'founder@usecellix.com'

export const waitlistEmail =
  import.meta.env.VITE_WAITLIST_EMAIL ?? contactEmail

/**
 * FormSubmit's hashed endpoint token. Optional, but preferred: without it the
 * waitlist posts to /ajax/<address>, which puts the address in the JS bundle in
 * plain text for scrapers. Copy the hash FormSubmit shows after activating the
 * address and set VITE_FORMSUBMIT_TOKEN to it.
 */
export const formSubmitToken = import.meta.env.VITE_FORMSUBMIT_TOKEN ?? ''

export const linkedInUrl =
  import.meta.env.VITE_LINKEDIN_URL ?? 'https://linkedin.com'

/**
 * Social profiles. Only entries with a real URL are rendered — set the
 * matching env var once a profile exists rather than shipping a dead link.
 */
export const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL ?? ''
export const facebookUrl = import.meta.env.VITE_FACEBOOK_URL ?? ''
export const xUrl = import.meta.env.VITE_X_URL ?? ''

/** cellix_backend — same env var name the Excel add-in (frontend/) uses. */
export const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4001'
