"use client"

import { useState, useEffect } from "react"

type RentRollUnit = Record<string, any>

const mockRentRollData: RentRollUnit[] = []

export function RRDocument() {
  const [data, setData] = useState<RentRollUnit[]>(mockRentRollData)
  const [columns, setColumns] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRentRollData()
  }, [])

  const fetchRentRollData = async () => {
    try {
      setLoading(true)
      setError(null)

      const documentId = "878e830c-8995-4c84-9da9-aabc0d7139e9"
      const response = await fetch(`/api/documents/${documentId}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.document?.extraction_result?.data?.extraction?.units) {
        const units = result.document.extraction_result.data.extraction.units
        const headers = result.document.extraction_result.data.extraction.headers

        // Map API data using headers as keys
        const mappedData: RentRollUnit[] = units.map((unit: any[]) => {
          const unitMap: Record<string, any> = {}
          headers.forEach((header: string, index: number) => {
            unitMap[header] = unit[index]
          })
          return unitMap
        })

        setData(mappedData)
        setColumns(headers)
      } else {
        throw new Error("Invalid API response format")
      }
    } catch (err) {
      console.error("Failed to fetch rent roll data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data")
      setData(mockRentRollData)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Occupied":
        return "bg-green-100 text-green-800"
      case "Occupied-NTVL":
      case "Occupied-NTV":
        return "bg-yellow-100 text-yellow-800"
      case "Vacant":
      case "Applicant":
        return "bg-gray-100 text-gray-800"
      case "Admin/Down":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-white">
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading rent roll data...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> {error} - Displaying sample data instead.
          </p>
        </div>
      )}

      {!loading && (
        <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                {columns.map((column) => {
                  const value = row[column]
                  const displayValue = 
                    value === null || 
                    value === undefined || 
                    value === "NA" || 
                    value === "N/A" || 
                    String(value).toUpperCase() === "NA"
                      ? "-"
                      : String(value)
                  
                  return (
                    <td
                      key={`${index}-${column}`}
                      className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap"
                    >
                      {displayValue}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}
