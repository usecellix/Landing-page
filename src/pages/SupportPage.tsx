import { LegalPage, LegalSection, LegalList } from '@/pages/LegalPage'
import { contactEmail } from '@/config/site'

const MailLink = ({ address }: { address: string }) => (
  <a
    href={`mailto:${address}`}
    className="text-foreground underline underline-offset-2 hover:text-accent"
  >
    {address}
  </a>
)

/**
 * Support/contact page. Also the SupportUrl target in the Excel add-in's
 * manifest.prod.xml — Excel renders this link to users, and it's a required,
 * reviewed field for an AppSource submission.
 */
export function SupportPage() {
  return (
    <LegalPage
      title="Support"
      intro="Something not working, or not sure how to do something in Cellix? Write to us and a real person will get back to you."
    >
      <LegalSection heading="Contact">
        <p>
          Email <MailLink address={contactEmail} /> for help with the Excel
          add-in, your account, or billing. Include what you were trying to
          do and, if relevant, a screenshot — it helps us answer faster.
        </p>
      </LegalSection>

      <LegalSection heading="Common questions">
        <LegalList
          items={[
            <>
              <strong className="text-foreground">
                Cellix isn't showing up in Excel.
              </strong>{' '}
              Confirm the add-in is enabled under Home → Add-ins, and that
              you're signed in to the same Microsoft/Google account you used
              to set up Cellix.
            </>,
            <>
              <strong className="text-foreground">
                A change looks wrong before I accept it.
              </strong>{' '}
              Nothing is written to your workbook until you approve it — reject
              the suggestion and tell us what was wrong so we can improve it.
            </>,
            <>
              <strong className="text-foreground">
                I want to cancel or change my plan.
              </strong>{' '}
              Email us or manage it from your account's Billing page.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection heading="Other pages">
        <p>
          See our <a href="/privacy" className="text-foreground underline underline-offset-2 hover:text-accent">Privacy Policy</a>{' '}
          and <a href="/terms" className="text-foreground underline underline-offset-2 hover:text-accent">Terms of Service</a> for
          how Cellix handles data and the terms of using it.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
