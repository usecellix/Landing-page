import { Link } from 'react-router-dom'
import { LegalPage, LegalSection, LegalList } from '@/pages/LegalPage'
import { contactEmail } from '@/config/site'
import {
  governingLawVenue,
  legalEntityAddress,
  legalEntityName,
} from '@/config/legal'

const MailLink = ({ address }: { address: string }) => (
  <a
    href={`mailto:${address}`}
    className="text-foreground underline underline-offset-2 hover:text-accent"
  >
    {address}
  </a>
)

export function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={`These terms govern your use of Cellix, provided by ${legalEntityName}. By installing the add-in or using this website, you agree to them. If you are agreeing on behalf of a firm, you confirm you are authorised to bind that firm.`}
    >
      <LegalSection heading="1. What Cellix is">
        <p>
          Cellix is an assistant that works inside your spreadsheet. You describe
          a task in plain language — reconciling GSTR-2B against a purchase
          register, cleaning a Tally export, matching 26AS entries — and Cellix
          proposes the changes. It shows you what it intends to do and waits.
        </p>
        <p>
          Cellix is currently offered as an early access product. Features may
          change, and availability is not guaranteed while it remains in this
          stage.
        </p>
      </LegalSection>

      <LegalSection heading="2. Cellix does not give professional advice">
        <p>
          <strong className="text-foreground">
            Cellix is a tool, not an adviser. Its output is not tax, legal,
            accounting, audit or financial advice, and it is not a substitute
            for your professional judgment.
          </strong>
        </p>
        <p>
          You remain responsible for every return, statement, working paper and
          filing you produce, whether or not Cellix was involved in preparing
          it. Automated matching and classification can be wrong, particularly
          on unusual data, and you must review the results before relying on
          them.
        </p>
      </LegalSection>

      <LegalSection heading="3. Your approval, your responsibility">
        <p>
          Cellix does not apply changes on its own. Every proposed edit is
          presented for your review and applied only when you accept it. Because
          the decision to accept is yours, you are responsible for the contents
          of your workbook after you have approved a change.
        </p>
        <p>
          You are also responsible for keeping your own backups. Cellix provides
          an undo facility, but it is not a backup system.
        </p>
      </LegalSection>

      <LegalSection heading="4. Your account">
        <LegalList
          items={[
            'Give accurate registration details and keep them current.',
            'Keep your credentials confidential — activity under your account is treated as yours.',
            'Tell us promptly if you believe your account has been compromised.',
            'You must be at least 18 and legally able to enter into a contract.',
          ]}
        />
      </LegalSection>

      <LegalSection heading="5. Acceptable use">
        <p>You agree not to:</p>
        <LegalList
          items={[
            'Use Cellix in breach of any law, or to process data you have no right to process.',
            'Attempt to reverse engineer, decompile, or extract the underlying models or source code.',
            'Resell, sublicense or provide the service to third parties except as your engagement with your own clients requires.',
            'Interfere with the service, probe it for vulnerabilities without written permission, or circumvent usage limits.',
            'Upload malicious code, or content that infringes someone else’s rights.',
          ]}
        />
      </LegalSection>

      <LegalSection heading="6. Plans, credits and payment">
        <p>
          Where paid plans are offered, the fees, credit allowances and billing
          period applicable to your plan are those shown at the time you
          subscribe. Fees are payable in advance and are stated in Indian
          rupees, exclusive of taxes unless we say otherwise. Subscriptions
          continue until cancelled, and cancelling stops the next renewal rather
          than refunding the current period. Credits are for use within the
          service and have no cash value.
        </p>
        <p>
          We may change pricing with reasonable notice. A change never applies
          to a period you have already paid for.
        </p>
      </LegalSection>

      <LegalSection heading="7. Your data">
        <p>
          You keep all rights in the data you bring to Cellix. You grant us only
          the limited permission needed to perform the task you request. How we
          handle that data — including that spreadsheet content is not retained
          after a session ends — is set out in our{' '}
          <Link
            to="/privacy"
            className="text-foreground underline underline-offset-2 hover:text-accent"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <p>
          You confirm you have the authority to process any client data you put
          through the service, and that doing so is consistent with your
          professional and confidentiality obligations.
        </p>
      </LegalSection>

      <LegalSection heading="8. Our intellectual property">
        <p>
          Cellix, its software, interface, documentation and branding remain
          ours. These terms grant you a limited, non-exclusive,
          non-transferable, revocable right to use the service — not ownership
          of any part of it.
        </p>
      </LegalSection>

      <LegalSection heading="9. Third-party services">
        <p>
          Cellix runs inside Microsoft Excel and works with files exported from
          software such as Tally, and with data originating from systems such as
          the GST portal. Those products are not ours, are governed by their own
          terms, and we are not responsible for their availability, accuracy or
          changes to them.
        </p>
      </LegalSection>

      <LegalSection heading="10. Availability">
        <p>
          We aim to keep Cellix available and working, but we do not promise
          uninterrupted service. We may suspend access for maintenance, for
          security reasons, or where use breaches these terms. During early
          access, features may be added, changed or withdrawn.
        </p>
      </LegalSection>

      <LegalSection heading="11. Disclaimers">
        <p>
          To the extent the law permits, Cellix is provided "as is" and "as
          available", without warranties of any kind, whether express or
          implied, including any warranty of merchantability, fitness for a
          particular purpose, or non-infringement. We do not warrant that the
          output will be accurate, complete, or suitable for a given filing.
        </p>
      </LegalSection>

      <LegalSection heading="12. Limitation of liability">
        <p>
          To the extent the law permits, we are not liable for indirect,
          incidental, special or consequential loss, nor for loss of profits,
          revenue, data, goodwill, or for penalties, interest or additions to
          tax arising from a filing you made.
        </p>
        <p>
          Our total liability arising out of or relating to the service is
          limited to the amount you paid us for it in the twelve months before
          the event giving rise to the claim.
        </p>
        <p>
          Nothing here excludes liability that cannot lawfully be excluded,
          including for fraud.
        </p>
      </LegalSection>

      <LegalSection heading="13. Indemnity">
        <p>
          You agree to indemnify us against claims, losses and reasonable costs
          arising from your use of the service in breach of these terms, or from
          your processing of data you were not entitled to process.
        </p>
      </LegalSection>

      <LegalSection heading="14. Termination">
        <p>
          You may stop using Cellix and close your account at any time. We may
          suspend or terminate access if you materially breach these terms, or
          if we are required to by law. Sections that by their nature should
          survive termination — including intellectual property, disclaimers,
          limitation of liability and indemnity — continue to apply.
        </p>
      </LegalSection>

      <LegalSection heading="15. Governing law">
        <p>
          These terms are governed by the laws of India. The courts at{' '}
          {governingLawVenue} have exclusive jurisdiction, except that either
          party may seek urgent injunctive relief in any competent court.
        </p>
      </LegalSection>

      <LegalSection heading="16. Changes to these terms">
        <p>
          We may update these terms. When we do, we will change the date at the
          top of this page and, where the change is material, notify account
          holders. Continuing to use Cellix after a change means you accept it.
        </p>
      </LegalSection>

      <LegalSection heading="17. Contact">
        <p>
          {legalEntityName}
          <br />
          {legalEntityAddress}
          <br />
          Email: <MailLink address={contactEmail} />
        </p>
      </LegalSection>
    </LegalPage>
  )
}
