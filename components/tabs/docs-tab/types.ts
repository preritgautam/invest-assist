export type DocumentView = "extracted" | "summary" | "analytics" | "insights"
export type DocumentType = "OS" | "RR" | "OM" | "Appraisal" | "Insurance"
export type ProcessingStage = "upload" | "extracting" | "review" | "verified"
export type DocsView = "library" | "upload" | "analysis" | "analytics" | "insights"

export interface PropertyDocument {
  id: string
  name: string
  type: DocumentType
  uploadDate: string
  stage: ProcessingStage
  extractedData?: LineItem[]
  rentRollData?: RentRollUnit[]
  version?: number
  holdPeriod?: number
  storagePath?: string | null
}

export interface LineItem {
  id: string
  name: string
  level: number
  isCategory: boolean
  isExpanded: boolean
  showMonthly: boolean
  t12Actual: number
  t12Monthly?: number[]
  underwriting?: number
  underwritingNote?: string
  proForma: number[]
  children?: LineItem[]
  hasDiscrepancy: boolean
  isEditing?: boolean
}

export interface RentRollUnit {
  id: string
  floorPlan: string
  squareFeet: number
  suiteNumber: string
  buildingId: string
  unitType: string
  bed: string
  bath: string
  renovated: string
  status: string
  startDate: string
  endDate: string
  moveInDate: string
  moveOutDate: string
  tenantName: string
  leaseDescription: string
  monthToMonth: string
  baseRent: number
  marketRent: number
  totalChargesPaid: number
  totalContractualRent: number
  balance: number
  deposit: number
  rent: number
  water: number
  unitUpgrades: number
  washDry: number
  garage: number
  mtom: number
  petFee: number
  corp: number
  employed: number
  conc: number
  vacancy: number
  laundry: number
  parking: number
  concessions: number
  monthlyRent: number
  otherCharges: number
  corporateUnit: number
  employeeDiscount: number
  monthToMonthFees: number
  utilityReimbursement: number
  storage: number
  subsidy: number
  lateFee: number
  insurance: number
  rentPremium: number
  trashIncome: number
  garageIncome: number
  nonRevenueUnit: number
  pestControlIncome: number
  cableInternetIncome: number
}
