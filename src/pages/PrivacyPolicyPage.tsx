import { LegalPage, LegalSection, LegalList } from '@/pages/LegalPage'
import { contactEmail } from '@/config/site'
import {
  grievanceOfficerName,
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

export function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`This policy explains what ${legalEntityName} ("Cellix", "we") does with information when you use the Cellix Excel add-in and this website. It is written to be read, not to be survived — if anything here is unclear, write to us and we will explain it.`}
    >
      <LegalSection heading="1. The short version">
        <p>
          Your client spreadsheet data is used only to complete the task you
          request, in that session, and is not stored afterwards. We do hold a
          small amount of ordinary account information — your email address and
          billing records — because we cannot run an account without it.
        </p>
      </LegalSection>

      <LegalSection heading="2. Your spreadsheet and client data">
        <p>
          <strong className="text-foreground">
            The content of your spreadsheet is used only to complete the task
            you have requested in that session. Nothing from it is retained or
            stored on our external servers once the session is complete.
          </strong>{' '}
          It is not used to train models, it is not sold, and it is not shared
          with anyone for advertising or profiling.
        </p>
        <p>
          Cellix proposes changes and shows them to you. Nothing is written to
          your workbook until you approve it, and the file itself stays where it
          already is — on your machine or in your organisation's storage.
        </p>
        <p>
          One exception, and it is opt-in: enterprise customers who need audit
          log retention can choose that separately. If your organisation enables
          it, the retained records are described in that agreement and take
          precedence over this section. It is off unless you turn it on.
        </p>
      </LegalSection>

      <LegalSection heading="3. What we do collect">
        <LegalList
          items={[
            <>
              <strong className="text-foreground">Contact details.</strong> The
              email address you give us for the waitlist, for an account, or
              when you write to us.
            </>,
            <>
              <strong className="text-foreground">Billing information.</strong>{' '}
              If you subscribe, our payment processor collects and holds your
              payment details. We receive a record that a payment occurred and
              the email it relates to — we never see or store your full card
              number.
            </>,
            <>
              <strong className="text-foreground">Service records.</strong>{' '}
              Operational logs such as when a request ran, whether it succeeded,
              and how many credits it consumed. These describe the operation,
              not the contents of your workbook.
            </>,
            <>
              <strong className="text-foreground">Website data.</strong> Basic
              request information such as IP address and browser type, kept by
              our hosting provider for security and reliability.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection heading="4. Why we use it">
        <LegalList
          items={[
            'To provide the service you asked for and to write back the changes you approve.',
            'To operate accounts, subscriptions, credits and invoicing.',
            'To keep the service secure and to investigate faults and abuse.',
            'To reply to you, and — only if you have asked for it — to tell you about the product.',
          ]}
        />
        <p>
          We do not sell personal data, and we do not use your data for
          automated decision-making that produces legal effects for you.
        </p>
      </LegalSection>

      <LegalSection heading="5. Who else is involved">
        <p>
          We use a small number of service providers, each bound to handle data
          only on our instructions:
        </p>
        <LegalList
          items={[
            'Cloud hosting and content delivery, to serve this website and run the service.',
            'A payment processor, to take subscription payments securely.',
            'An email delivery service, to receive waitlist sign-ups and enquiries.',
            <>
              <strong className="text-foreground">OpenRouter</strong>, an AI
              model routing service, which processes the specific cells needed
              for the task you requested. OpenRouter may route a given request
              to OpenAI or another underlying model provider it partners with;
              in all cases, processing is subject to terms that prohibit
              training on that content and require its deletion after
              processing.
            </>,
          ]}
        />
        <p>
          We may also disclose information where the law requires it, or to
          establish or defend a legal claim.
        </p>
      </LegalSection>

      <LegalSection heading="6. Where data is processed">
        <p>
          Our providers may process data outside India. Where that happens we
          rely on contractual protections requiring a standard of care
          equivalent to this policy. If your engagement requires processing
          within a particular jurisdiction, contact us before you begin — we
          would rather tell you no than surprise you later.
        </p>
      </LegalSection>

      <LegalSection heading="7. How long we keep things">
        <LegalList
          items={[
            'Spreadsheet content: not retained after the session completes.',
            'Account and contact details: for as long as you have an account, and for a reasonable period afterwards.',
            'Billing and tax records: for the period Indian law requires us to keep them.',
            'Operational logs: a limited period for security and troubleshooting.',
          ]}
        />
      </LegalSection>

      <LegalSection heading="8. Security">
        <p>
          Data in transit is encrypted. Access to systems holding personal data
          is restricted to people who need it. No system is perfectly secure,
          and we will not claim otherwise — but if a breach affects you, we will
          tell you and the relevant authority as the law requires.
        </p>
      </LegalSection>

      <LegalSection heading="9. Your rights">
        <p>
          Under India's Digital Personal Data Protection Act, 2023, and other
          laws that may apply to you, you can ask us to give you access to your
          personal data, correct or complete it, erase it, or explain how it has
          been used. You can withdraw consent at any time, and you can nominate
          someone to exercise these rights on your behalf.
        </p>
        <p>
          Write to <MailLink address={contactEmail} /> and we will respond
          within the period the law allows. If you are dissatisfied, you may
          complain to the Data Protection Board of India.
        </p>
      </LegalSection>

      <LegalSection heading="10. A note for chartered accountants">
        <p>
          When you process a client's data through Cellix, you are typically the
          data fiduciary for that data and we act on your instructions. Your
          own professional and confidentiality obligations to your client
          continue to apply. Nothing in this policy reduces them, and you should
          satisfy yourself that using Cellix is consistent with your engagement
          terms.
        </p>
      </LegalSection>

      <LegalSection heading="11. Children">
        <p>
          Cellix is a professional tool and is not directed at children. We do
          not knowingly collect data from anyone under 18.
        </p>
      </LegalSection>

      <LegalSection heading="12. Changes">
        <p>
          If we change this policy we will update the date at the top of this
          page, and we will tell account holders directly when a change is
          material.
        </p>
      </LegalSection>

      <LegalSection heading="13. Contact us">
        <p>
          {legalEntityName}
          <br />
          {legalEntityAddress}
          <br />
          Grievance Officer: {grievanceOfficerName}
          <br />
          Email: <MailLink address={contactEmail} />
        </p>
      </LegalSection>
    </LegalPage>
  )
}
