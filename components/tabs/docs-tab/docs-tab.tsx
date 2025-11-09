"use client"

import React, { useState } from "react"

import type { ReactNode } from "react"
import {
  FileText,
  ChevronRight,
  ChevronDown,
  Plus,
  MessageSquare,
  FileSpreadsheet,
  Users,
  Home,
  Shield,
  BookOpen,
  TrendingUp,
  BarChart3,
  Lock,
  FileDown,
  CheckCircle2,
  Edit3,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PropertyData } from "@/lib/property-data"
import { T12ActualsTab } from "@/components/tabs/docs-tab/t12-actuals-tab"
import { RightToolbar } from "./right-toolbar"
import { RRDocument } from "./rr-document"
import { OMDocument } from "./om-document"
import { AnalyzeTab } from "@/components/tabs/docs-tab/analyze-tab"

// Placeholder for generateRentRollUnits function
const generateRentRollUnits = (count: number, propertyName: string): RentRollUnit[] => {
  // This is a mock implementation. In a real application, this would likely
  // generate more realistic and varied rent roll data.
  const units: RentRollUnit[] = []
  for (let i = 0; i < count; i++) {
    units.push({
      id: `unit-${i + 1}`,
      // Unit Information
      floorPlan: `Plan ${String.fromCharCode(65 + (i % 5))}`,
      squareFeet: 800 + (i % 10) * 50,
      suiteNumber: ` ${i + 1}`,
      buildingId: `B${Math.floor(i / 10) + 1}`,
      unitType: ["Studio", "1 Bed", "2 Bed", "3 Bed"][i % 4],
      bed: ["0", "1", "2", "3"][i % 4],
      bath: ["1", "1.5", "2"][i % 3],
      renovated: i % 2 === 0 ? "2020" : "N/A",

      // Lease Terms
      status: ["Occupied", "Vacant", "Occupied-NTVL"][i % 3],
      startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      endDate:
        i % 3 !== 1
          ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          : "Month-to-Month",
      moveInDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      moveOutDate:
        i % 3 !== 1
          ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          : "N/A",
      tenantName: `Tenant ${i + 1}`,
      leaseDescription: i % 4 === 0 ? "Standard Lease" : "Renewal",
      monthToMonth: i % 3 === 1 ? "Yes" : "No",

      // Rent & Charges
      baseRent: 1200 + (i % 10) * 100,
      marketRent: 1400 + (i % 10) * 120,
      totalChargesPaid: 1350 + (i % 10) * 100,
      totalContractualRent: 1400 + (i % 10) * 120,
      balance: Math.random() > 0.8 ? Math.floor(Math.random() * 500) : 0,
      deposit: 500 + (i % 5) * 100,

      // Monthly Charges
      rent: 1200 + (i % 10) * 100,
      water: 50 + (i % 5) * 10,
      unitUpgrades: i % 5 === 0 ? 25 : 0,
      washDry: i % 3 === 0 ? 15 : 0,
      garage: i % 6 === 0 ? 100 : 0,
      mtom: i % 3 === 1 ? 50 : 0,
      petFee: i % 7 === 0 ? 30 : 0,
      corp: i % 8 === 0 ? 20 : 0,
      employed: i % 9 === 0 ? 10 : 0,
      conc: i % 10 === 0 ? 10 : 0,
      vacancy: 0, // This is usually calculated at a higher level
      laundry: i % 11 === 0 ? 20 : 0,
      parking: i % 12 === 0 ? 75 : 0,

      // Additional Charges
      concessions: i % 4 === 0 ? 50 : 0,
      monthlyRent: 1250 + (i % 10) * 100,
      otherCharges: i % 13 === 0 ? 10 : 0,
      corporateUnit: i % 8 === 0 ? 100 : 0,
      employeeDiscount: i % 9 === 0 ? 50 : 0,
      monthToMonthFees: i % 3 === 1 ? 25 : 0,
      utilityReimbursement: i % 14 === 0 ? 75 : 0,

      // Income Items
      storage: i % 15 === 0 ? 30 : 0,
      subsidy: i % 16 === 0 ? 150 : 0,
      lateFee: i % 17 === 0 ? 25 : 0,
      insurance: i % 18 === 0 ? 20 : 0,
      rentPremium: i % 19 === 0 ? 10 : 0,
      trashIncome: i % 20 === 0 ? 5 : 0,
      garageIncome: i % 6 === 0 ? 100 : 0,
      nonRevenueUnit: i % 21 === 0 ? 0 : 0,
      pestControlIncome: i % 22 === 0 ? 5 : 0,
      cableInternetIncome: i % 23 === 0 ? 30 : 0,
    })
  }
  return units
}

interface DocumentsTabProps {
  property: PropertyData | null
}

// Declare DocumentView here to fix the undeclared variable error
type DocumentView = "extracted" | "summary" | "analytics" | "insights"

type DocumentType = "OS" | "RR" | "OM" | "Appraisal" | "Insurance"
type ProcessingStage = "upload" | "extracting" | "review" | "verified"

// Define the PropertyDocument interface
interface PropertyDocument {
  id: string
  name: string
  type: DocumentType
  uploadDate: string
  stage: ProcessingStage
  extractedData?: LineItem[]
  rentRollData?: RentRollUnit[]
  version?: number
  holdPeriod?: number
}

interface LineItem {
  id: string
  name: string
  level: number // 0 = major category, 1 = subcategory, 2 = line item
  isCategory: boolean
  isExpanded: boolean
  showMonthly: boolean // Toggle for monthly breakdown
  t12Actual: number // T-12 from document
  t12Monthly?: number[] // Monthly breakdown
  underwriting?: number // Broker's adjusted value
  underwritingNote?: string
  proForma: number[] // Year 1, Year 2, ... Year N projections
  children?: LineItem[]
  hasDiscrepancy: boolean
  isEditing?: boolean
}

interface RentRollUnit {
  id: string
  // Unit Information
  floorPlan: string
  squareFeet: number
  suiteNumber: string
  buildingId: string
  unitType: string
  bed: string
  bath: string
  renovated: string

  // Lease Terms
  status: string
  startDate: string
  endDate: string
  moveInDate: string
  moveOutDate: string
  tenantName: string
  leaseDescription: string
  monthToMonth: string

  // Rent & Charges
  baseRent: number
  marketRent: number
  totalChargesPaid: number
  totalContractualRent: number
  balance: number
  deposit: number

  // Monthly Charges
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

  // Additional Charges
  concessions: number
  monthlyRent: number
  otherCharges: number
  corporateUnit: number
  employeeDiscount: number
  monthToMonthFees: number
  utilityReimbursement: number

  // Income Items
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

const mockBrokerData: LineItem[] = [
  {
    id: "gpr",
    name: "GROSS POTENTIAL RENT",
    level: 0,
    isCategory: true,
    isExpanded: true,
    showMonthly: false,
    t12Actual: 1143686,
    t12Monthly: [93998, 92861, 92588, 95434, 97944, 96688, 93443, 96718, 95198, 98981, 96363, 94286],
    underwriting: 1200000,
    proForma: [1200000, 1236000, 1273080, 1311052, 1349984, 1389883, 1430758],
    hasDiscrepancy: false,
    children: [
      {
        id: "market-rent",
        name: "Market Rent",
        level: 1,
        isCategory: false,
        isExpanded: false,
        showMonthly: false,
        t12Actual: 1143686,
        t12Monthly: [93998, 92861, 92588, 95434, 97944, 96688, 93443, 96718, 95198, 98981, 96363, 94286],
        underwriting: 1200000,
        underwritingNote: "Adjusted to market rents based on comps",
        proForma: [1200000, 1236000, 1273080, 1311052, 1349984, 1389883, 1430758],
        hasDiscrepancy: false,
      },
      {
        id: "loss-to-lease",
        name: "Loss to Lease",
        level: 1,
        isCategory: false,
        isExpanded: false,
        showMonthly: false,
        t12Actual: -107802,
        t12Monthly: [-8391, -8830, -9531, -9291, -8531, -8551, -8301, -8891, -7698, -9381, -7698, -7200],
        underwriting: -60000,
        underwritingNote: "Reduced as units turn to market",
        proForma: [-60000, -36000, -18000, 0, 0, 0, 0],
        hasDiscrepancy: false,
      },
    ],
  },
  {
    id: "vacancy",
    name: "Vacancy Loss",
    level: 0,
    isCategory: false,
    isExpanded: false,
    showMonthly: false,
    t12Actual: -34331,
    t12Monthly: [-4359, -4305, -1874, -2645, -3772, -1888, -2826, -2586, -1685, -1621, -2652, -4926],
    underwriting: -60000,
    underwritingNote: "5% vacancy assumption",
    proForma: [-60000, -61800, -63654, -65553, -67499, -69494, -71538],
    hasDiscrepancy: false,
  },
  {
    id: "egi",
    name: "EFFECTIVE GROSS INCOME",
    level: 0,
    isCategory: true,
    isExpanded: false,
    showMonthly: false,
    t12Actual: 1001553,
    underwriting: 1080000,
    proForma: [1080000, 1138200, 1191426, 1245499, 1282485, 1320389, 1359220],
    hasDiscrepancy: false,
  },
  {
    id: "other-income",
    name: "OTHER INCOME",
    level: 0,
    isCategory: true,
    isExpanded: true,
    showMonthly: false,
    t12Actual: 116462,
    underwriting: 120000,
    proForma: [120000, 123600, 127272, 131088, 134952, 138864, 142830],
    hasDiscrepancy: false,
    children: [
      {
        id: "laundry",
        name: "Laundry Income",
        level: 1,
        isCategory: false,
        isExpanded: false,
        showMonthly: false,
        t12Actual: 3600,
        t12Monthly: [300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300],
        underwriting: 3600,
        proForma: [3600, 3708, 3819, 3933, 4050, 4172, 4297],
        hasDiscrepancy: false,
      },
      {
        id: "parking",
        name: "Parking Income",
        level: 1,
        isCategory: false,
        isExpanded: false,
        showMonthly: false,
        t12Actual: 24000,
        t12Monthly: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000],
        underwriting: 30000,
        underwritingNote: "Increased parking rates to market",
        proForma: [30000, 30900, 31827, 32781, 33765, 34777, 35820],
        hasDiscrepancy: false,
      },
      {
        id: "pet-fees",
        name: "Pet Fees",
        level: 1,
        isCategory: false,
        isExpanded: false,
        showMonthly: false,
        t12Actual: 18000,
        t12Monthly: [1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500],
        underwriting: 24000,
        underwritingNote: "Implemented pet policy",
        proForma: [24000, 24720, 25462, 26226, 27013, 27823, 28658],
        hasDiscrepancy: false,
      },
      {
        id: "application-fees",
        name: "Application Fees",
        level: 1,
        isCategory: false,
        isExpanded: false,
        showMonthly: false,
        t12Actual: 4200,
        t12Monthly: [350, 350, 350, 350, 350, 350, 350, 350, 350, 350, 350, 350],
        underwriting: 4800,
        proForma: [4800, 4944, 5093, 5246, 5403, 5565, 5732],
        hasDiscrepancy: false,
      },
      {
        id: "late-fees",
        name: "Late Fees",
        level: 1,
        isCategory: false,
        isExpanded: false,
        showMonthly: false,
        t12Actual: 3400,
        t12Monthly: [283, 283, 283, 283, 283, 283, 283, 283, 283, 283, 283, 283],
        underwriting: 3600,
        proForma: [3600, 3708, 3819, 3933, 4050, 4172, 4297],
        hasDiscrepancy: false,
      },
      {
        id: "other-fees",
        name: "Other Fees",
        level: 1,
        isCategory: false,
        isExpanded: false,
        showMonthly: false,
        t12Actual: 63262,
        t12Monthly: [5272, 5272, 5272, 5272, 5272, 5272, 5272, 5272, 5272, 5272, 5272, 5272],
        underwriting: 54000,
        proForma: [54000, 55620, 57289, 59007, 60777, 62600, 64478],
        hasDiscrepancy: false,
      },
    ],
  },
  {
    id: "total-income",
    name: "TOTAL OPERATING INCOME",
    level: 0,
    isCategory: true,
    isExpanded: false,
    showMonthly: false,
    t12Actual: 1118015,
    underwriting: 1200000,
    proForma: [1200000, 1261800, 1318698, 1376587, 1417437, 1459253, 1502050],
    hasDiscrepancy: false,
  },
  {
    id: "opex",
    name: "OPERATING EXPENSES",
    level: 0,
    isCategory: true,
    isExpanded: true,
    showMonthly: false,
    t12Actual: -456789,
    underwriting: -480000,
    proForma: [-480000, -492000, -504300, -516908, -529831, -543077, -556654],
    hasDiscrepancy: false,
    children: [
      {
        id: "admin",
        name: "ADMINISTRATIVE",
        level: 1,
        isCategory: true,
        isExpanded: true,
        showMonthly: false,
        t12Actual: -78456,
        underwriting: -84000,
        proForma: [-84000, -86100, -88253, -90459, -92721, -95039, -97415],
        hasDiscrepancy: false,
        children: [
          {
            id: "mgmt-fee",
            name: "Management Fee",
            level: 2,
            isCategory: false,
            isExpanded: false,
            showMonthly: false,
            t12Actual: -54728,
            t12Monthly: [-4418, -4618, -4498, -4598, -4798, -4898, -4698, -4798, -4798, -4698, -4798, -4898],
            underwriting: -60000,
            underwritingNote: "5% of EGI",
            proForma: [-60000, -63090, -65954, -68829, -70874, -73020, -75269],
            hasDiscrepancy: false,
          },
          {
            id: "marketing",
            name: "Marketing & Advertising",
            level: 2,
            isCategory: false,
            isExpanded: false,
            showMonthly: false,
            t12Actual: -12000,
            t12Monthly: [-1000, -1000, -1000, -1000, -1000, -1000, -1000, -1000, -1000, -1000, -1000, -1000],
            underwriting: -12000,
            proForma: [-12000, -12300, -12608, -12923, -13245, -13574, -13911],
            hasDiscrepancy: false,
          },
          {
            id: "legal",
            name: "Legal & Professional",
            level: 2,
            isCategory: false,
            isExpanded: false,
            showMonthly: false,
            t12Actual: -8400,
            t12Monthly: [-700, -700, -700, -700, -700, -700, -700, -700, -700, -700, -700, -700],
            underwriting: -9000,
            proForma: [-9000, -9225, -9456, -9692, -9935, -10183, -10438],
            hasDiscrepancy: false,
          },
          {
            id: "office",
            name: "Office & Administrative",
            level: 2,
            isCategory: false,
            isExpanded: false,
            showMonthly: false,
            t12Actual: -3328,
            t12Monthly: [-277, -277, -277, -277, -277, -277, -277, -277, -277, -277, -277, -277],
            underwriting: -3000,
            proForma: [-3000, -3075, -3152, -3231, -3312, -3395, -3479],
            hasDiscrepancy: false,
          },
        ],
      },
      {
        id: "utilities",
        name: "UTILITIES",
        level: 1,
        isCategory: true,
        isExpanded: true,
        showMonthly: false,
        t12Actual: -89234,
        underwriting: -96000,
        proForma: [-96000, -98400, -100860, -103382, -105968, -108622, -111338],
        hasDiscrepancy: false,
        children: [
          {
            id: "electric",
            name: "Electric",
            level: 2,
            isCategory: false,
            isExpanded: false,
            showMonthly: false,
            t12Actual: -34567,
            t12Monthly: [-2880, -2880, -2880, -2880, -2880, -2880, -2880, -2880, -2880, -2880, -2880, -2880],
            underwriting: -36000,
            proForma: [-36000, -36900, -37823, -38769, -39738, -40732, -41750],
            hasDiscrepancy: false,
          },
          {
            id: "gas",
            name: "Gas",
            level: 2,
            isCategory: false,
            isExpanded: false,
            showMonthly: false,
            t12Actual: -23456,
            t12Monthly: [-1955, -1955, -1955, -1955, -1955, -1955, -1955, -1955, -1955, -1955, -1955, -1955],
            underwriting: -24000,
            proForma: [-24000, -24600, -25215, -25846, -26492, -27154, -27833],
            hasDiscrepancy: false,
          },
          {
            id: "water",
            name: "Water & Sewer",
            level: 2,
            isCategory: false,
            isExpanded: false,
            showMonthly: false,
            t12Actual: -28211,
            t12Monthly: [-2351, -2351, -2351, -2351, -2351, -2351, -2351, -2351, -2351, -2351, -2351, -2351],
            underwriting: -30000,
            proForma: [-30000, -30750, -31519, -32307, -33115, -33943, -34792],
            hasDiscrepancy: false,
          },
          {
            id: "trash",
            name: "Trash Removal",
            level: 2,
            isCategory: false,
            isExpanded: false,
            showMonthly: false,
            t12Actual: -3000,
            t12Monthly: [-250, -250, -250, -250, -250, -250, -250, -250, -250, -250, -250, -250],
            underwriting: -6000,
            underwritingNote: "Increased to market rates",
            proForma: [-6000, -6150, -6304, -6461, -6623, -6788, -6958],
            hasDiscrepancy: false,
          },
        ],
      },
      {
        id: "repairs",
        name: "REPAIRS & MAINTENANCE",
        level: 1,
        isCategory: true,
        isExpanded: false,
        showMonthly: false,
        t12Actual: -123456,
        underwriting: -132000,
        proForma: [-132000, -135300, -138683, -142149, -145702, -149344, -153077],
        hasDiscrepancy: false,
      },
      {
        id: "payroll",
        name: "PAYROLL",
        level: 1,
        isCategory: true,
        isExpanded: false,
        showMonthly: false,
        t12Actual: -98765,
        underwriting: -108000,
        proForma: [-108000, -110700, -113468, -116306, -119216, -122197, -125252],
        hasDiscrepancy: false,
      },
      {
        id: "insurance",
        name: "Insurance",
        level: 1,
        isCategory: false,
        isExpanded: false,
        showMonthly: false,
        t12Actual: -34567,
        t12Monthly: [-2880, -2880, -2880, -2880, -2880, -2880, -2880, -2880, -2880, -2880, -2880, -2880],
        underwriting: -36000,
        proForma: [-36000, -36900, -37823, -38769, -39738, -40732, -41750],
        hasDiscrepancy: false,
      },
      {
        id: "taxes",
        name: "Property Taxes",
        level: 1,
        isCategory: false,
        isExpanded: false,
        showMonthly: false,
        t12Actual: -32311,
        t12Monthly: [-2693, -2693, -2693, -2693, -2693, -2693, -2693, -2693, -2693, -2693, -2693, -2693],
        underwriting: -24000,
        underwritingNote: "Appealed and reduced",
        proForma: [-24000, -24600, -25215, -25846, -26492, -27154, -27833],
        hasDiscrepancy: false,
      },
    ],
  },
  {
    id: "noi",
    name: "NET OPERATING INCOME",
    level: 0,
    isCategory: true,
    isExpanded: false,
    showMonthly: false,
    t12Actual: 661226,
    underwriting: 720000,
    proForma: [720000, 769800, 814398, 859679, 887606, 916176, 945396],
    hasDiscrepancy: false,
  },
]

const mockRentRollData: RentRollUnit[] = generateRentRollUnits(89, "Riverside Apartments")

export function DocumentsTab({ property }: DocumentsTabProps) {
  // Declared DocsView as a type alias for string to resolve the undeclared variable error.
  type DocsView = "library" | "upload" | "analysis" | "analytics" | "insights"
  const [docsView, setDocsView] = useState<DocsView>("library")
  const [documentView, setDocumentView] = useState<DocumentView>("extracted")
  const [selectedDoc, setSelectedDoc] = useState<string | null>("1")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [documents] = useState<PropertyDocument[]>([
    {
      id: "1",
      name: `${property?.name || "Property"}_OS_2024.pdf`,
      type: "OS",
      uploadDate: "2024-01-15",
      stage: "review",
      extractedData: mockBrokerData,
      version: 1,
      holdPeriod: 7,
    },
    {
      id: "2",
      name: `${property?.name || "Property"}_RentRoll_Q4.xlsx`,
      type: "RR",
      uploadDate: "2024-01-14",
      stage: "verified",
      rentRollData: mockRentRollData,
    },
    {
      id: "3",
      name: `${property?.name || "Property"}_OM.pdf`,
      type: "OM",
      uploadDate: "2024-01-10",
      stage: "review",
    },
  ])
  // </CHANGE>

  const [extractedData, setExtractedData] = useState<LineItem[]>(mockBrokerData)

  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)

  const activeDocument = documents.find((d) => d.id === selectedDoc)

  const [activeSection, setActiveSection] = useState<"t12" | "normalized" | "summary">("t12")
  const [activeDocType, setActiveDocType] = useState<"OS" | "RR" | "OM">("OS")
  const [menuExpanded, setMenuExpanded] = useState(false)

  const [osValidated, setOsValidated] = useState(false)
  const [rrValidated, setRrValidated] = useState(false)
  const [omValidated, setOmValidated] = useState(false)

  // Check if all documents are validated to unlock Analyze
  const allDocsValidated = osValidated && rrValidated && omValidated
  // </CHANGE>

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setIsUploading(true)
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const toggleExpand = (itemId: string) => {
    setExtractedData((prevData) => {
      const updateItem = (items: LineItem[]): LineItem[] => {
        return items.map((item) => {
          if (item.id === itemId) {
            return { ...item, isExpanded: !item.isExpanded }
          }
          if (item.children) {
            return { ...item, children: updateItem(item.children) }
          }
          return item
        })
      }
      return updateItem(prevData)
    })
  }

  const toggleMonthly = (itemId: string) => {
    setExtractedData((prevData) => {
      const updateItem = (items: LineItem[]): LineItem[] => {
        return items.map((item) => {
          if (item.id === itemId) {
            return { ...item, showMonthly: !item.showMonthly }
          }
          if (item.children) {
            return { ...item, children: updateItem(item.children) }
          }
          return item
        })
      }
      return updateItem(prevData)
    })
  }

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case "OS":
        return FileSpreadsheet // Operating Statement - spreadsheet icon
      case "RR":
        return Users // Rent Roll - users/tenants icon
      case "OM":
        return BookOpen // Offering Memorandum - open book icon
      case "Appraisal":
        return Home
      case "Insurance":
        return Shield
      default:
        return FileText
    }
  }

  const getDocumentTypeLabel = (type: DocumentType) => {
    switch (type) {
      case "OS":
        return "Operating Statement / Cashflow"
      case "RR":
        return "Rent Roll"
      case "OM":
        return "Offering Memorandum / Brochure"
      case "Appraisal":
        return "Appraisal Report"
      case "Insurance":
        return "Insurance Document"
      default:
        return "Document"
    }
  }

  const getPropertyName = (filename: string) => {
    const name = filename.split("_")[0] || filename.split(".")[0]
    return name.replace(/-/g, " ").replace(/_/g, " ")
  }

  const propertyName = activeDocument ? getPropertyName(activeDocument.name) : "Unknown Property"

  const renderLineItem = (item: LineItem, depth = 0): ReactNode => {
    const paddingLeft = depth * 24
    const isMajorCategory = item.level === 0
    const isSubcategory = item.level === 1
    const isLineItem = item.level === 2

    return (
      <React.Fragment key={item.id}>
        <tr
          className={`border-b border-gray-200 hover:bg-gray-50 ${
            isMajorCategory ? "bg-blue-50 font-bold" : isSubcategory ? "bg-gray-50 font-semibold" : ""
          }`}
        >
          {/* Expand/Collapse + Line Item Name */}
          <td className="border-r border-gray-200 p-2 sticky left-0 bg-inherit z-10" style={{ paddingLeft }}>
            <div className="flex items-center gap-2">
              {item.isCategory && item.children && (
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="text-gray-600 hover:text-gray-900 flex-shrink-0"
                  title={item.isExpanded ? "Collapse category" : "Expand category"}
                >
                  {item.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}
              {!item.isCategory && (
                <button
                  onClick={() => toggleMonthly(item.id)}
                  className="text-gray-400 hover:text-gray-700 flex-shrink-0"
                  title={
                    item.showMonthly ? "Hide monthly breakdown" : "Show monthly breakdown (click to see T-12 values)"
                  }
                >
                  {item.showMonthly ? <ChevronDown className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </button>
              )}
              <span className={`${isMajorCategory ? "text-sm" : "text-xs"}`}>{item.name}</span>
            </div>
          </td>

          {/* T-12 Actual */}
          <td className="border-r border-gray-200 p-2 text-right font-mono text-xs">
            <span className={item.t12Actual < 0 ? "text-red-600" : ""}>
              {item.t12Actual < 0
                ? `($${Math.abs(item.t12Actual).toLocaleString()})`
                : `$${item.t12Actual.toLocaleString()}`}
            </span>
          </td>

          {/* Underwriting */}
          <td className="border-r border-gray-200 p-2 text-right font-mono text-xs bg-blue-50">
            <div className="flex items-center justify-end gap-1">
              <span className={item.underwriting && item.underwriting < 0 ? "text-red-600" : ""}>
                {item.underwriting
                  ? item.underwriting < 0
                    ? `($${Math.abs(item.underwriting).toLocaleString()})`
                    : `$${item.underwriting.toLocaleString()}`
                  : "-"}
              </span>
              {item.underwritingNote && (
                <MessageSquare className="w-3 h-3 text-blue-500" title={item.underwritingNote} />
              )}
            </div>
          </td>

          {/* Pro Forma Years */}
          {item.proForma.map((value, idx) => (
            <td key={idx} className="border-r border-gray-200 p-2 text-right font-mono text-xs bg-green-50">
              <span className={value < 0 ? "text-red-600" : ""}>
                {value < 0 ? `($${Math.abs(value).toLocaleString()})` : `$${value.toLocaleString()}`}
              </span>
            </td>
          ))}
        </tr>

        {/* Monthly Breakdown Row */}
        {item.showMonthly && item.t12Monthly && (
          <tr className="bg-gray-50 border-b border-gray-200">
            <td
              className="border-r border-gray-200 p-2 text-xs text-gray-600 italic sticky left-0 bg-gray-50 z-10"
              style={{ paddingLeft: paddingLeft + 32 }}
            >
              Monthly Breakdown (T-12)
            </td>
            <td colSpan={1 + (activeDocument?.holdPeriod || 7) + 1} className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                        (month) => (
                          <th
                            key={month}
                            className="border-r border-gray-200 p-1 text-center font-medium text-gray-600"
                          >
                            {month}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {item.t12Monthly.map((value, idx) => (
                        <td
                          key={idx}
                          className="border-r border-gray-200 p-1 text-right font-mono text-xs hover:bg-blue-50 cursor-pointer"
                          title={`Double-click to edit ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][idx]}`}
                          // Added onDoubleClick handler to edit monthly values.
                          onDoubleClick={(e) => {
                            const promptValue = prompt(
                              `Edit value for ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][idx]}:`,
                              value.toString(),
                            )
                            if (promptValue !== null) {
                              // In a real app, you would update the state here.
                              // For this example, we'll just log it.
                              console.log(`[v0] Updated monthly value: ${promptValue}`)
                            }
                          }}
                        >
                          <span className={value < 0 ? "text-red-600" : ""}>
                            {value === 0
                              ? "$0"
                              : value < 0
                                ? `($${Math.abs(value).toLocaleString()})`
                                : `$${value.toLocaleString()}`}
                          </span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        )}

        {/* Render Children */}
        {item.isExpanded && item.children?.map((child) => renderLineItem(child, depth + 1))}
      </React.Fragment>
    )
  }

  const calculateSummary = () => {
    if (!extractedData) return null

    const totalIncome = extractedData.find((item) => item.id === "total-income")
    const noi = extractedData.find((item) => item.id === "noi")

    return {
      totalIncome: totalIncome?.underwriting || totalIncome?.t12Actual || 0,
      noi: noi?.underwriting || noi?.t12Actual || 0,
      noiMargin: totalIncome
        ? ((noi?.underwriting || noi?.t12Actual || 0) / (totalIncome.underwriting || totalIncome.t12Actual)) * 100
        : 0,
    }
  }

  const summary = calculateSummary()

  const renderRentRollTable = () => {
    if (!activeDocument?.rentRollData) return null

    return (
      <div className="overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-20 bg-gray-100 border-b-2 border-gray-300">
            <tr>
              <th colSpan={9} className="bg-blue-100 border-r border-gray-300 p-2 text-left font-bold text-gray-900">
                UNIT INFORMATION
              </th>
              <th colSpan={8} className="bg-green-100 border-r border-gray-300 p-2 text-left font-bold text-gray-900">
                LEASE TERMS
              </th>
              <th colSpan={6} className="bg-orange-100 border-r border-gray-300 p-2 text-left font-bold text-gray-900">
                RENT & CHARGES
              </th>
              <th colSpan={13} className="bg-purple-100 border-r border-gray-300 p-2 text-left font-bold text-gray-900">
                MONTHLY CHARGES
              </th>
              <th colSpan={7} className="bg-pink-100 border-r border-gray-300 p-2 text-left font-bold text-gray-900">
                ADDITIONAL CHARGES
              </th>
              <th colSpan={10} className="bg-yellow-100 p-2 text-left font-bold text-gray-900">
                INCOME ITEMS
              </th>
            </tr>
            <tr className="bg-white">
              {/* Unit Information */}
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Floor Plan</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Square Feet</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Suite Number</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Building Id</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Unit Type</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Bed</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Bath</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Renovated</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700 bg-blue-50">Status</th>

              {/* Lease Terms */}
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Start Date</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">End Date</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Move In Date</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Move Out Date</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Tenant Name</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Lease Description</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Month To Month</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700 bg-green-50">
                Market Rent
              </th>

              {/* Rent & Charges */}
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Base Rent</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">
                Total Charges Paid
              </th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">
                Total Contractual Rent
              </th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Balance</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Deposit</th>
              <th className="border-r border-gray-200 p-2 text-right font-semibold text-gray-700 bg-orange-50">RENT</th>

              {/* Monthly Charges */}
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">WATER</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Unit Upgrades</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">WASH/DRY</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">GARAGE</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">MTOM</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">PETFEE</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">CORP</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">EMPLOYED</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">CONC</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">VACANCY</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">laundry</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">parking</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700 bg-purple-50">
                Utility Reimbursement
              </th>

              {/* Additional Charges */}
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Concessions</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Monthly Rent</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Other Charges</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Corporate Unit</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Employee Discount</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">
                Month To Month Fees
              </th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700 bg-pink-50">
                Pet Fee
              </th>

              {/* Income Items */}
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Storage</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Subsidy</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Late Fee</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Insurance</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Rent Premium</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Trash Income</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Garage Income</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Non Revenue Unit</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">
                Pest Control Income
              </th>
              <th className="p-2 text-right font-semibold text-gray-700 bg-yellow-50">Cable Internet Income</th>
            </tr>
          </thead>
          <tbody>
            {activeDocument.rentRollData.map((unit, idx) => (
              <tr
                key={unit.id}
                className={`border-b border-gray-200 hover:bg-blue-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                {/* Unit Information */}
                <td className="border-r border-gray-200 p-2">{unit.floorPlan}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  {unit.squareFeet.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2">{unit.suiteNumber}</td>
                <td className="border-r border-gray-200 p-2">{unit.buildingId}</td>
                <td className="border-r border-gray-200 p-2">{unit.unitType}</td>
                <td className="border-r border-gray-200 p-2 text-center">{unit.bed}</td>
                <td className="border-r border-gray-200 p-2 text-center">{unit.bath}</td>
                <td className="border-r border-gray-200 p-2">{unit.renovated}</td>
                <td className="border-r border-gray-200 p-2">
                  <Badge
                    variant={unit.status === "Occupied" ? "default" : "secondary"}
                    className={`text-xs ${
                      unit.status === "Occupied"
                        ? "bg-green-100 text-green-800"
                        : unit.status === "Occupied-NTVL"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {unit.status}
                  </Badge>
                </td>

                {/* Lease Terms */}
                <td className="border-r border-gray-200 p-2 text-xs">{unit.startDate || "-"}</td>
                <td className="border-r border-gray-200 p-2 text-xs">{unit.endDate || "-"}</td>
                <td className="border-r border-gray-200 p-2 text-xs">{unit.moveInDate || "-"}</td>
                <td className="border-r border-gray-200 p-2 text-xs">{unit.moveOutDate || "-"}</td>
                <td className="border-r border-gray-200 p-2">{unit.tenantName}</td>
                <td className="border-r border-gray-200 p-2 text-xs">{unit.leaseDescription || "-"}</td>
                <td className="border-r border-gray-200 p-2 text-center">{unit.monthToMonth || "-"}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.marketRent.toLocaleString()}
                </td>

                {/* Rent & Charges */}
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.baseRent.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.totalChargesPaid.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.totalContractualRent.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.balance.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.deposit.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.rent.toLocaleString()}</td>

                {/* Monthly Charges */}
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.water.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.unitUpgrades.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.washDry.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.garage.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.mtom.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.petFee.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.corp.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.employed.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.conc.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.vacancy.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.laundry.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.parking.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.utilityReimbursement.toLocaleString()}
                </td>

                {/* Additional Charges */}
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.concessions.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.monthlyRent.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.otherCharges.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.corporateUnit.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.employeeDiscount.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.monthToMonthFees.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.petFee.toLocaleString()}</td>

                {/* Income Items */}
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.storage.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.subsidy.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.lateFee.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.insurance.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.rentPremium.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.trashIncome.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.garageIncome.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.nonRevenueUnit.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.pestControlIncome.toLocaleString()}
                </td>
                <td className="p-2 text-right font-mono">${unit.cableInternetIncome.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderSummaryView = () => {
    if (activeDocument?.type === "RR" && activeDocument.rentRollData) {
      const totalUnits = activeDocument.rentRollData.length
      const occupiedUnits = activeDocument.rentRollData.filter((u) => u.status === "Occupied").length
      const occupancyRate = (occupiedUnits / totalUnits) * 100
      const totalMarketRent = activeDocument.rentRollData.reduce((sum, u) => sum + u.marketRent, 0)
      const totalActualRent = activeDocument.rentRollData.reduce((sum, u) => sum + u.baseRent, 0)
      const lossToLease = totalMarketRent - totalActualRent

      return (
        <div className="p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900">Rent Roll Summary</h3>
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 mb-1">Total Units</p>
                <p className="text-2xl font-bold text-gray-900">{totalUnits}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 mb-1">Occupied Units</p>
                <p className="text-2xl font-bold text-green-600">{occupiedUnits}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 mb-1">Occupancy Rate</p>
                <p className="text-2xl font-bold text-blue-600">{occupancyRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 mb-1">Loss to Lease</p>
                <p className="text-2xl font-bold text-red-600">${lossToLease.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    if (activeDocument?.type === "OS" && summary) {
      return (
        <div className="p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900">Operating Statement Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 mb-1">Total Income</p>
                <p className="text-2xl font-bold text-gray-900">${summary.totalIncome.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 mb-1">Net Operating Income</p>
                <p className="text-2xl font-bold text-green-600">${summary.noi.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 mb-1">NOI Margin</p>
                <p className="text-2xl font-bold text-blue-600">{summary.noiMargin.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    return null
  }

  if (!property) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border-2 border-white p-8 text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Documents</h2>
        <p className="text-gray-600">Select a property to manage documents.</p>
      </div>
    )
  }

  const handleDocTypeChange = (docType: "OS" | "RR" | "OM") => {
    setActiveDocType(docType)
    // Map document types to document IDs
    const docIdMap = { OS: "1", RR: "2", OM: "3" } as const
    setSelectedDoc(docIdMap[docType])
    setMenuExpanded(false) // Close the menu after selection
  }

  const handleValidateOS = () => {
    setOsValidated(true)
    // Auto-navigate to Rent Roll after validation
    handleDocTypeChange("RR")
  }

  const handleValidateRR = () => {
    setRrValidated(true)
    // Auto-navigate to OM after validation
    handleDocTypeChange("OM")
  }

  const handleValidateOM = () => {
    setOmValidated(true)
    // Optionally auto-navigate to Analyze
    // setActiveSection("normalized")
  }

  const handleUnvalidateOS = () => {
    if (confirm("Are you sure you want to unvalidate T-12 / OS? This will allow you to edit the data again.")) {
      setOsValidated(false)
    }
  }

  const handleUnvalidateRR = () => {
    if (confirm("Are you sure you want to unvalidate Rent Roll? This will allow you to edit the data again.")) {
      setRrValidated(false)
    }
  }

  const handleUnvalidateOM = () => {
    if (
      confirm("Are you sure you want to unvalidate Offering Memorandum? This will allow you to edit the data again.")
    ) {
      setOmValidated(false)
    }
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-white sm:border-2 overflow-hidden">
      {/* Completely removed the Documents Library header strip and replaced with direct content */}
      <div className="relative flex flex-col md:flex-row h-screen pt-2">
        <div className="w-full md:w-20 bg-white border-r border-gray-200 flex md:flex-col items-center gap-2 p-2">
          <button
            onClick={() => setMenuExpanded(!menuExpanded)}
            className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            title="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Expandable Menu Overlay */}
          {menuExpanded && (
            <div className="absolute left-20 top-0 bg-white shadow-xl rounded-r-lg border border-gray-200 p-4 z-50 min-w-[280px]">
              <div className="space-y-4">
                {/* Import Section */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    Import
                  </h4>
                  <div className="pl-6 space-y-1">
                    {documents
                      .filter((d) => d.type === "OS" || d.type === "RR" || d.type === "OM")
                      .map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => {
                            const typeMap = { OS: "OS", RR: "RR", OM: "OM" } as const
                            handleDocTypeChange(typeMap[doc.type as keyof typeof typeMap])
                            setMenuExpanded(false)
                          }}
                          className="w-full text-left px-2 py-1 rounded text-xs text-gray-700 hover:bg-gray-100 truncate"
                          title={doc.name}
                        >
                          {doc.name}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Analyze Section */}
                <div className={!allDocsValidated ? "opacity-50" : ""}>
                  <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Analyze
                    {!allDocsValidated && <Lock className="w-3 h-3 text-gray-500" />}
                  </h4>
                  <div className="pl-6 space-y-1">
                    <button
                      disabled={!allDocsValidated}
                      className="w-full text-left px-2 py-1 rounded text-xs text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      Inputs & Assumptions
                    </button>
                    <button
                      disabled={!allDocsValidated}
                      className="w-full text-left px-2 py-1 rounded text-xs text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      Tabular Data
                    </button>
                  </div>
                </div>

                {/* Report Section */}
                <div className={!allDocsValidated ? "opacity-50" : ""}>
                  <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Report
                    {!allDocsValidated && <Lock className="w-3 h-3 text-gray-500" />}
                  </h4>
                  <div className="pl-6 space-y-1">
                    <button
                      disabled={!allDocsValidated}
                      className="w-full text-left px-2 py-1 rounded text-xs text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      Tabular Analysis
                    </button>
                    <button
                      disabled={!allDocsValidated}
                      className="w-full text-left px-2 py-1 rounded text-xs text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      Visual Analysis
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setActiveSection("t12")
              setMenuExpanded(false)
            }}
            className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-colors ${
              activeSection === "t12" ? "text-blue-600" : "text-gray-700 hover:text-gray-900"
            }`}
            title="Upload Documents"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-bold">Upload</span>
          </button>

          {/* Analyze Button */}
          <div className="relative">
            <button
              onClick={() => allDocsValidated && setActiveSection("normalized")}
              disabled={!allDocsValidated}
              className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-colors ${
                activeSection === "normalized"
                  ? "text-blue-600"
                  : allDocsValidated
                    ? "text-gray-700 hover:text-gray-900"
                    : "text-gray-400 cursor-not-allowed"
              }`}
              title={allDocsValidated ? "Analyze" : "Complete all validations to unlock"}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-bold">Analyze</span>
            </button>
            {!allDocsValidated && (
              <div className="absolute top-0 right-0 bg-white rounded-full p-0.5">
                <Lock className="w-3 h-3 text-gray-500" />
              </div>
            )}
          </div>

          {/* Report Button */}
          <div className="relative">
            <button
              onClick={() => allDocsValidated && setActiveSection("summary")}
              disabled={!allDocsValidated}
              className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-colors ${
                activeSection === "summary"
                  ? "text-blue-600"
                  : allDocsValidated
                    ? "text-gray-700 hover:text-gray-900"
                    : "text-gray-400 cursor-not-allowed"
              }`}
              title={allDocsValidated ? "Report" : "Complete all validations to unlock"}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-bold">Report</span>
            </button>
            {!allDocsValidated && (
              <div className="absolute top-0 right-0 bg-white rounded-full p-0.5">
                <Lock className="w-3 h-3 text-gray-500" />
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
          {activeSection === "t12" && (
            <div className="bg-white border-b border-gray-200 px-2 py-2 flex items-center gap-2">
              <button
                onClick={() => handleDocTypeChange("OS")}
                className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 ${
                  activeDocType === "OS"
                    ? "bg-blue-600 text-white shadow-md"
                    : osValidated
                      ? "bg-green-50 text-gray-700 hover:bg-green-100 border border-green-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                T-12 / OS
                {osValidated && <CheckCircle2 className="w-4 h-4 text-green-600" />}
              </button>

              <div className="relative">
                <button
                  onClick={() => osValidated && handleDocTypeChange("RR")}
                  disabled={!osValidated}
                  className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 ${
                    activeDocType === "RR"
                      ? "bg-blue-600 text-white shadow-md"
                      : rrValidated
                        ? "bg-green-50 text-gray-700 hover:bg-green-100 border border-green-300"
                        : osValidated
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Rent Roll
                  {rrValidated && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                </button>
                {!osValidated && (
                  <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                    <Lock className="w-3 h-3 text-gray-500" />
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => rrValidated && handleDocTypeChange("OM")}
                  disabled={!rrValidated}
                  className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 ${
                    activeDocType === "OM"
                      ? "bg-blue-600 text-white shadow-md"
                      : omValidated
                        ? "bg-green-50 text-gray-700 hover:bg-green-100 border border-green-300"
                        : rrValidated
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Offering Memorandum
                  {omValidated && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                </button>
                {!rrValidated && (
                  <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                    <Lock className="w-3 h-3 text-gray-500" />
                  </div>
                )}
              </div>

              <button
                onClick={() => {}}
                className="ml-auto w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-sm"
                title="Add New Document"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex flex-1 min-h-0">
            <div className="flex-1 overflow-x-auto overflow-y-auto min-w-0">
              {activeSection === "t12" && activeDocType === "OS" && (
                <T12ActualsTab
                  property={property}
                  onValidate={handleValidateOS}
                  validated={osValidated}
                  onUnvalidate={handleUnvalidateOS}
                />
              )}

              {activeSection === "t12" && activeDocType === "RR" && activeDocument?.rentRollData && (
                <div>
                  <div className="bg-white rounded-lg border p-2 shadow-sm m-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        {rrValidated ? (
                          <span className="text-green-600 font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Rent Roll Data Validated
                          </span>
                        ) : (
                          <span>Review all rent roll units and validate the data before proceeding</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {rrValidated && (
                          <button
                            onClick={handleUnvalidateRR}
                            className="px-3 py-1.5 rounded text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                        )}
                        <button
                          onClick={handleValidateRR}
                          disabled={rrValidated}
                          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                            rrValidated
                              ? "bg-green-100 text-green-700 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {rrValidated ? "✓ Validated" : "Validate Data"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <RRDocument />
                </div>
              )}
              {activeSection === "t12" && activeDocType === "OM" && (
                <div>
                  <div className="bg-white rounded-lg border p-2 shadow-sm m-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        {omValidated ? (
                          <span className="text-green-600 font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Offering Memorandum Data Validated
                          </span>
                        ) : (
                          <span>Review the offering memorandum and validate the data before proceeding</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {omValidated && (
                          <button
                            onClick={handleUnvalidateOM}
                            className="px-3 py-1.5 rounded text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                        )}
                        <button
                          onClick={handleValidateOM}
                          disabled={omValidated}
                          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                            omValidated
                              ? "bg-green-100 text-green-700 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {omValidated ? "✓ Validated" : "Validate Data"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <OMDocument />
                </div>
              )}

              {activeSection === "normalized" && <AnalyzeTab />}

              {activeSection === "summary" && (
                <div className="p-4 space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 mb-1">Generate Reports</h2>
                    <p className="text-xs text-gray-600 mb-3">
                      Export comprehensive analysis reports in various formats for stakeholders and lenders.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white rounded border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-xs font-bold text-slate-900 mb-1">Investment Summary</h3>
                          <p className="text-xs text-slate-600">Executive summary with key metrics and highlights</p>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded">PDF</span>
                      </div>
                      <button className="mt-2 w-full px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <FileDown className="w-3 h-3" />
                        Download Report
                      </button>
                    </div>

                    <div className="bg-white rounded border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-xs font-bold text-slate-900 mb-1">Detailed Underwriting</h3>
                          <p className="text-xs text-slate-600">
                            Complete analysis with all assumptions and calculations
                          </p>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded">PDF</span>
                      </div>
                      <button className="mt-2 w-full px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <FileDown className="w-3 h-3" />
                        Download Report
                      </button>
                    </div>

                    <div className="bg-white rounded border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-xs font-bold text-slate-900 mb-1">Pro Forma Financials</h3>
                          <p className="text-xs text-slate-600">10-year cash flow projections and returns analysis</p>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                          Excel
                        </span>
                      </div>
                      <button className="mt-2 w-full px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <FileDown className="w-3 h-3" />
                        Download Report
                      </button>
                    </div>

                    <div className="bg-white rounded border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-xs font-bold text-slate-900 mb-1">Market Analysis</h3>
                          <p className="text-xs text-slate-600">Comparative market data and benchmarking</p>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded">PDF</span>
                      </div>
                      <button className="mt-2 w-full px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <FileDown className="w-3 h-3" />
                        Download Report
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 border-l border-gray-200">
              <RightToolbar />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { DocumentsTab as DocsTab }
