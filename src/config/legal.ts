/**
 * Details used by /privacy and /terms.
 *
 * TODO before certification: the three placeholder values below are published
 * verbatim on public legal pages. Set the matching env vars (or edit the
 * fallbacks) with the registered entity name, its registered address, and the
 * grievance officer's name — India's DPDP Act 2023 requires a named contact for
 * data-principal complaints.
 */

export const legalEntityName =
  import.meta.env.VITE_LEGAL_ENTITY_NAME ?? '[Registered entity name]'

export const legalEntityAddress =
  import.meta.env.VITE_LEGAL_ENTITY_ADDRESS ?? 'Kalamassery, Kerala, India'

export const grievanceOfficerName =
  import.meta.env.VITE_GRIEVANCE_OFFICER ?? '[Grievance Officer name]'

/** Courts named in the governing-law clause. */
export const governingLawVenue =
  import.meta.env.VITE_GOVERNING_LAW_VENUE ?? 'Ernakulam, Kerala, India'

/** Shown on both documents. Bump whenever the text changes materially. */
export const legalLastUpdated = '6 September 2026'
