"use client"

import { useState } from "react"

interface RentRollUnit {
  floorPlan: string
  squareFeet: number
  suiteNumber: number
  buildingId: string
  unitType: string
  bed: number
  bath: number
  renovated: string
  status: "Occupied" | "Vacant" | "Occupied-NTVL"
  startDate: string
  endDate: string
  moveInDate: string
  moveOutDate: string
}

const mockRentRollData: RentRollUnit[] = [
  {
    floorPlan: "Plan A",
    squareFeet: 800,
    suiteNumber: 1,
    buildingId: "B1",
    unitType: "Studio",
    bed: 0,
    bath: 1,
    renovated: "2020",
    status: "Occupied",
    startDate: "2025-03-31",
    endDate: "2026-02-27",
    moveInDate: "2025-01-27",
    moveOutDate: "2026-04-05",
  },
  {
    floorPlan: "Plan B",
    squareFeet: 850,
    suiteNumber: 2,
    buildingId: "B1",
    unitType: "1 Bed",
    bed: 1,
    bath: 1.5,
    renovated: "N/A",
    status: "Vacant",
    startDate: "2025-03-02",
    endDate: "Month-to-Month",
    moveInDate: "2025-02-02",
    moveOutDate: "N/A",
  },
  {
    floorPlan: "Plan C",
    squareFeet: 900,
    suiteNumber: 3,
    buildingId: "B1",
    unitType: "2 Bed",
    bed: 2,
    bath: 2,
    renovated: "2020",
    status: "Occupied-NTVL",
    startDate: "2025-02-24",
    endDate: "2026-09-05",
    moveInDate: "2025-03-01",
    moveOutDate: "2026-07-04",
  },
  {
    floorPlan: "Plan D",
    squareFeet: 950,
    suiteNumber: 4,
    buildingId: "B1",
    unitType: "3 Bed",
    bed: 3,
    bath: 1,
    renovated: "N/A",
    status: "Occupied",
    startDate: "2025-09-11",
    endDate: "2026-01-16",
    moveInDate: "2025-02-25",
    moveOutDate: "2025-11-23",
  },
  {
    floorPlan: "Plan E",
    squareFeet: 1000,
    suiteNumber: 5,
    buildingId: "B1",
    unitType: "Studio",
    bed: 0,
    bath: 1.5,
    renovated: "2020",
    status: "Vacant",
    startDate: "2025-05-11",
    endDate: "Month-to-Month",
    moveInDate: "2025-10-05",
    moveOutDate: "N/A",
  },
  {
    floorPlan: "Plan A",
    squareFeet: 1050,
    suiteNumber: 6,
    buildingId: "B1",
    unitType: "1 Bed",
    bed: 1,
    bath: 2,
    renovated: "N/A",
    status: "Occupied-NTVL",
    startDate: "2025-03-05",
    endDate: "2026-04-14",
    moveInDate: "2025-05-13",
    moveOutDate: "2025-11-13",
  },
  {
    floorPlan: "Plan B",
    squareFeet: 1100,
    suiteNumber: 7,
    buildingId: "B1",
    unitType: "2 Bed",
    bed: 2,
    bath: 1,
    renovated: "2020",
    status: "Occupied",
    startDate: "2025-09-18",
    endDate: "2026-08-02",
    moveInDate: "2025-08-24",
    moveOutDate: "2025-12-15",
  },
  {
    floorPlan: "Plan C",
    squareFeet: 1150,
    suiteNumber: 8,
    buildingId: "B1",
    unitType: "3 Bed",
    bed: 3,
    bath: 1.5,
    renovated: "N/A",
    status: "Vacant",
    startDate: "2025-02-28",
    endDate: "Month-to-Month",
    moveInDate: "2025-01-04",
    moveOutDate: "N/A",
  },
  {
    floorPlan: "Plan D",
    squareFeet: 1200,
    suiteNumber: 9,
    buildingId: "B1",
    unitType: "Studio",
    bed: 0,
    bath: 2,
    renovated: "2020",
    status: "Occupied-NTVL",
    startDate: "2025-10-15",
    endDate: "2026-05-20",
    moveInDate: "2025-08-18",
    moveOutDate: "2026-02-15",
  },
  {
    floorPlan: "Plan E",
    squareFeet: 1250,
    suiteNumber: 10,
    buildingId: "B1",
    unitType: "1 Bed",
    bed: 1,
    bath: 1,
    renovated: "N/A",
    status: "Occupied",
    startDate: "2025-10-22",
    endDate: "2026-07-19",
    moveInDate: "2025-02-27",
    moveOutDate: "2025-11-20",
  },
  {
    floorPlan: "Plan A",
    squareFeet: 800,
    suiteNumber: 11,
    buildingId: "B2",
    unitType: "2 Bed",
    bed: 2,
    bath: 1.5,
    renovated: "2020",
    status: "Vacant",
    startDate: "2025-10-04",
    endDate: "Month-to-Month",
    moveInDate: "2025-08-10",
    moveOutDate: "N/A",
  },
  {
    floorPlan: "Plan B",
    squareFeet: 850,
    suiteNumber: 12,
    buildingId: "B2",
    unitType: "3 Bed",
    bed: 3,
    bath: 2,
    renovated: "N/A",
    status: "Occupied-NTVL",
    startDate: "2025-09-17",
    endDate: "2026-09-27",
    moveInDate: "2025-05-16",
    moveOutDate: "2026-07-19",
  },
  {
    floorPlan: "Plan C",
    squareFeet: 900,
    suiteNumber: 13,
    buildingId: "B2",
    unitType: "Studio",
    bed: 0,
    bath: 1,
    renovated: "2020",
    status: "Occupied",
    startDate: "2025-08-16",
    endDate: "2025-12-08",
    moveInDate: "2025-01-17",
    moveOutDate: "2026-08-29",
  },
  {
    floorPlan: "Plan D",
    squareFeet: 950,
    suiteNumber: 14,
    buildingId: "B2",
    unitType: "1 Bed",
    bed: 1,
    bath: 1.5,
    renovated: "N/A",
    status: "Vacant",
    startDate: "2025-09-26",
    endDate: "Month-to-Month",
    moveInDate: "2024-11-17",
    moveOutDate: "N/A",
  },
  {
    floorPlan: "Plan E",
    squareFeet: 1000,
    suiteNumber: 15,
    buildingId: "B2",
    unitType: "2 Bed",
    bed: 2,
    bath: 2,
    renovated: "2020",
    status: "Occupied-NTVL",
    startDate: "2025-01-30",
    endDate: "2026-09-08",
    moveInDate: "2025-03-16",
    moveOutDate: "2026-07-12",
  },
  {
    floorPlan: "Plan A",
    squareFeet: 1050,
    suiteNumber: 16,
    buildingId: "B2",
    unitType: "3 Bed",
    bed: 3,
    bath: 1,
    renovated: "N/A",
    status: "Occupied",
    startDate: "2025-10-05",
    endDate: "2026-04-30",
    moveInDate: "2025-08-11",
    moveOutDate: "2026-05-17",
  },
]

export function RRDocument() {
  const [data] = useState<RentRollUnit[]>(mockRentRollData)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Occupied":
        return "bg-green-100 text-green-800"
      case "Occupied-NTVL":
        return "bg-yellow-100 text-yellow-800"
      case "Vacant":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th
                colSpan={9}
                className="bg-blue-100 px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-200"
              >
                UNIT INFORMATION
              </th>
              <th
                colSpan={4}
                className="bg-green-100 px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-200"
              >
                LEASE TERMS
              </th>
            </tr>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">Floor Plan</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 whitespace-nowrap">Square Feet</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 whitespace-nowrap">
                Suite Number
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 whitespace-nowrap">Building Id</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">Unit Type</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 whitespace-nowrap">Bed</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 whitespace-nowrap">Bath</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 whitespace-nowrap">Renovated</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">Start Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">End Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">Move In Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap">Move Out Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">{row.floorPlan}</td>
                <td className="px-4 py-2 text-sm text-gray-900 text-right whitespace-nowrap">
                  {row.squareFeet.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900 text-center whitespace-nowrap">{row.suiteNumber}</td>
                <td className="px-4 py-2 text-sm text-gray-900 text-center whitespace-nowrap">{row.buildingId}</td>
                <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">{row.unitType}</td>
                <td className="px-4 py-2 text-sm text-gray-900 text-center whitespace-nowrap">{row.bed}</td>
                <td className="px-4 py-2 text-sm text-gray-900 text-center whitespace-nowrap">{row.bath}</td>
                <td className="px-4 py-2 text-sm text-gray-900 text-center whitespace-nowrap">{row.renovated}</td>
                <td className="px-4 py-2 text-sm whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">{row.startDate}</td>
                <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">{row.endDate}</td>
                <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">{row.moveInDate}</td>
                <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">{row.moveOutDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
