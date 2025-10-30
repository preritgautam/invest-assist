import type { RentRollUnit } from "./types"

export const generateRentRollUnits = (count: number, propertyName: string): RentRollUnit[] => {
  const units: RentRollUnit[] = []
  for (let i = 0; i < count; i++) {
    units.push({
      id: `unit-${i + 1}`,
      floorPlan: `Plan ${String.fromCharCode(65 + (i % 5))}`,
      squareFeet: 800 + (i % 10) * 50,
      suiteNumber: ` ${i + 1}`,
      buildingId: `B${Math.floor(i / 10) + 1}`,
      unitType: ["Studio", "1 Bed", "2 Bed", "3 Bed"][i % 4],
      bed: ["0", "1", "2", "3"][i % 4],
      bath: ["1", "1.5", "2"][i % 3],
      renovated: i % 2 === 0 ? "2020" : "N/A",
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
      baseRent: 1200 + (i % 10) * 100,
      marketRent: 1400 + (i % 10) * 120,
      totalChargesPaid: 1350 + (i % 10) * 100,
      totalContractualRent: 1400 + (i % 10) * 120,
      balance: Math.random() > 0.8 ? Math.floor(Math.random() * 500) : 0,
      deposit: 500 + (i % 5) * 100,
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
      vacancy: 0,
      laundry: i % 11 === 0 ? 20 : 0,
      parking: i % 12 === 0 ? 75 : 0,
      concessions: i % 4 === 0 ? 50 : 0,
      monthlyRent: 1250 + (i % 10) * 100,
      otherCharges: i % 13 === 0 ? 10 : 0,
      corporateUnit: i % 8 === 0 ? 100 : 0,
      employeeDiscount: i % 9 === 0 ? 50 : 0,
      monthToMonthFees: i % 3 === 1 ? 25 : 0,
      utilityReimbursement: i % 14 === 0 ? 75 : 0,
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

export const getDocumentIcon = (type: string) => {
  const { FileSpreadsheet, Users, BookOpen, Home, Shield, FileText } = require("lucide-react")

  switch (type) {
    case "OS":
      return FileSpreadsheet
    case "RR":
      return Users
    case "OM":
      return BookOpen
    case "Appraisal":
      return Home
    case "Insurance":
      return Shield
    default:
      return FileText
  }
}

export const getDocumentTypeLabel = (type: string) => {
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

export const getPropertyName = (filename: string) => {
  const name = filename.split("_")[0] || filename.split(".")[0]
  return name.replace(/-/g, " ").replace(/_/g, " ")
}
