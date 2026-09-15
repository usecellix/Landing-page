import {
  Banknote,
  Calculator,
  FileCheck2,
  FileSpreadsheet,
  Mail,
  Receipt,
  ScanSearch,
  Scale,
  type LucideIcon,
} from 'lucide-react'

export interface Workflow {
  icon: LucideIcon
  label: string
  detail: string
  /** What you hand CELLIX */
  input: string
  /** What comes back */
  output: string
}

export const workflows: Workflow[] = [
  {
    icon: Receipt,
    label: 'GST Reconciliation',
    detail: 'GSTR-2B against your purchase register, split invoices included.',
    input: 'GSTR-2B + purchase register',
    output: 'Matched, mismatched and missing invoices — each with a reason',
  },
  {
    icon: FileSpreadsheet,
    label: 'Tally Cleanup',
    detail: 'Tally exports normalised — dates, ledger names, merged headers.',
    input: 'Raw Tally export',
    output: 'Dates, ledger names and headers normalised into one clean sheet',
  },
  {
    icon: Calculator,
    label: 'ITC Computation',
    detail: 'Eligible, ineligible and blocked credit separated with reasons.',
    input: 'Purchase register + GST rules',
    output: 'Eligible, ineligible and blocked credit split line by line',
  },
  {
    icon: Scale,
    label: 'Schedule III',
    detail: 'Trial balance mapped into the Schedule III grouping you use.',
    input: 'Trial balance',
    output: 'Balance sheet and P&L grouped the way your firm presents them',
  },
  {
    icon: Banknote,
    label: 'Bank Reconciliation',
    detail: 'Statement lines matched to book entries, exceptions listed.',
    input: 'Bank statement + book entries',
    output: 'Cleared items tied off, exceptions listed for you to review',
  },
  {
    icon: Mail,
    label: '26AS / TDS',
    detail: 'Form 26AS tied back to booked income and TDS credits.',
    input: 'Form 26AS + books of account',
    output: 'Income and TDS credits reconciled, gaps flagged party-wise',
  },
  {
    icon: ScanSearch,
    label: 'Error Scan',
    detail: 'Broken references, stale formulas and stray totals flagged.',
    input: 'Any working file',
    output: 'Broken references, stale formulas and stray totals flagged',
  },
  {
    icon: FileCheck2,
    label: 'Audit Trail',
    detail: 'Every change logged, so the file explains itself in review.',
    input: 'Your session in the workbook',
    output: 'A log of every change — what, where, and why it was made',
  },
]
