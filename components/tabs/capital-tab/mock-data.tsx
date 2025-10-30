import type { LoanCard, AmortizationData } from "./types"
import { Building, RefreshCw, CreditCard } from "lucide-react"

/**
 * Initial loan cards configuration
 */
export const INITIAL_LOAN_CARDS: LoanCard[] = [
  {
    id: "senior",
    title: "Senior Debt",
    icon: <Building className="w-4 h-4" />,
    nickname: "Primary Loan",
    includeInModel: true,
  },
  {
    id: "refinance",
    title: "Refinance Debt",
    icon: <RefreshCw className="w-4 h-4" />,
    nickname: "Refi Loan",
    includeInModel: false,
  },
  {
    id: "other",
    title: "Other Debt",
    icon: <CreditCard className="w-4 h-4" />,
    nickname: "Mezzanine",
    includeInModel: false,
  },
]

/**
 * Initial amortization schedule data
 * Tracks loan balance, payments, and cash flows over 10-year period
 */
export const INITIAL_AMORTIZATION_DATA: AmortizationData = {
  "At Close": {
    beginningBalance: 11900000,
    drawdowns: 11900000,
    interestExpense: 0,
    amortization: 0,
    repayments: 0,
    endingBalance: 11900000,
  },
  "Year 1": {
    beginningBalance: 11900000,
    drawdowns: 0,
    interestExpense: 505750,
    amortization: 119000,
    repayments: 624750,
    endingBalance: 11781000,
  },
  "Year 2": {
    beginningBalance: 11781000,
    drawdowns: 0,
    interestExpense: 500693,
    amortization: 124057,
    repayments: 624750,
    endingBalance: 11656943,
  },
  "Year 3": {
    beginningBalance: 11656943,
    drawdowns: 0,
    interestExpense: 495420,
    amortization: 129330,
    repayments: 624750,
    endingBalance: 11527613,
  },
  "Year 4": {
    beginningBalance: 11527613,
    drawdowns: 0,
    interestExpense: 489924,
    amortization: 134826,
    repayments: 624750,
    endingBalance: 11392787,
  },
  "Year 5": {
    beginningBalance: 11392787,
    drawdowns: 0,
    interestExpense: 484193,
    amortization: 140557,
    repayments: 624750,
    endingBalance: 11252230,
  },
  "Year 6": {
    beginningBalance: 11252230,
    drawdowns: 0,
    interestExpense: 478220,
    amortization: 146530,
    repayments: 624750,
    endingBalance: 11105700,
  },
  "Year 7": {
    beginningBalance: 11105700,
    drawdowns: 0,
    interestExpense: 471992,
    amortization: 152758,
    repayments: 624750,
    endingBalance: 10952942,
  },
  "Year 8": {
    beginningBalance: 10952942,
    drawdowns: 0,
    interestExpense: 465500,
    amortization: 159250,
    repayments: 624750,
    endingBalance: 10793692,
  },
  "Year 9": {
    beginningBalance: 10793692,
    drawdowns: 0,
    interestExpense: 458732,
    amortization: 166018,
    repayments: 624750,
    endingBalance: 10627674,
  },
  "Year 10": {
    beginningBalance: 10627674,
    drawdowns: 0,
    interestExpense: 451676,
    amortization: 173074,
    repayments: 624750,
    endingBalance: 10454600,
  },
}
