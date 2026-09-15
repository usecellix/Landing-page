/**
 * Details used by /privacy and /terms.
 *
 * No registered business entity yet — Cellix operates as founder Mohammed
 * Azharudheen individually, so his name is used for both the entity name and
 * the DPDP Act 2023 grievance officer contact. Update these (and set the
 * matching env vars) if/when Cellix incorporates.
 */

export const legalEntityName =
  import.meta.env.VITE_LEGAL_ENTITY_NAME ?? 'Mohammed Azharudheen'

export const legalEntityAddress =
  import.meta.env.VITE_LEGAL_ENTITY_ADDRESS ?? 'Kalamassery, Kerala, India'

export const grievanceOfficerName =
  import.meta.env.VITE_GRIEVANCE_OFFICER ?? 'Mohammed Azharudheen'

/** Courts named in the governing-law clause. */
export const governingLawVenue =
  import.meta.env.VITE_GOVERNING_LAW_VENUE ?? 'Ernakulam, Kerala, India'

/** Shown on both documents. Bump whenever the text changes materially. */
export const legalLastUpdated = '6 September 2026'
