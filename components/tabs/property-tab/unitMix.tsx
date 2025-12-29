import React, { useEffect, useState } from 'react'

interface Document {
  id: string
}

interface UnitMixProps {
  documents: Document[]
}

interface RentRollData {
  units: string[][]
  headers: string[]
}

interface UnitSummary {
  type: string
  units: number
  percentage: string
  marketRent: number
  postRenoRent: number
}

interface Totals {
  units: number
  totalMarketRent: number
  totalPostRenoRent: number
}

const UnitMix: React.FC<UnitMixProps> = ({ documents }) => {
  const [rentRollData, setRentRollData] = useState<RentRollData | null>(null)
  const [loading, setLoading] = useState(false)
  const [unitMixSummary, setUnitMixSummary] = useState<UnitSummary[]>([])

  const documentId = documents?.[0]?.id

  const [images, setImages] = useState([])

  const propertyId = 'b3ae0daf-a454-490c-8796-40de30027b55' // Replace with actual property ID as needed

useEffect(() => {
  async function fetchImages() {
    const res = await fetch(`/api/properties/images?propertyId=${propertyId}`)
    const data = await res.json()
    if (data.success) {
      setImages(data.images)
    }
  }
  fetchImages()
}, [propertyId])

  // Fetch rent roll data
  useEffect(() => {
    if (!documentId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/documents/${documentId}`)
        
        if (!response.ok) throw new Error('Failed to fetch')
        
        const result = await response.json()
        
        if (result.success && result.document?.extraction_result?.data?.extraction) {
          setRentRollData(result.document.extraction_result.data.extraction)
        }
      } catch (err) {
        console.error('Failed to fetch rent roll data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [documentId])

  // Process rent roll data into unit mix summary
  useEffect(() => {
    if (!rentRollData?.units || !rentRollData?.headers) return

    const headers = rentRollData.headers
    const units = rentRollData.units

    // Find indices for required columns
    const floorPlanIndex = headers.indexOf('Floor Plan')
    const marketRentIndex = headers.indexOf('Market Rent')

    if (floorPlanIndex === -1 || marketRentIndex === -1) {
      console.error('Required columns not found')
      return
    }

    // Group by floor plan
    const unitGroups: Record<string, {
      type: string
      units: number
      totalMarketRent: number
    }> = {}

    units.forEach(unit => {
      const floorPlan = unit[floorPlanIndex]
      const marketRent = parseFloat(unit[marketRentIndex]?.replace(/,/g, '') || '0')

      if (!floorPlan || floorPlan === 'N/A') return

      if (!unitGroups[floorPlan]) {
        unitGroups[floorPlan] = {
          type: floorPlan,
          units: 0,
          totalMarketRent: 0
        }
      }

      unitGroups[floorPlan].units += 1
      unitGroups[floorPlan].totalMarketRent += marketRent
    })

    // Convert to array and calculate averages
    const summary: UnitSummary[] = Object.values(unitGroups).map(group => ({
      type: group.type,
      units: group.units,
      percentage: ((group.units / units.length) * 100).toFixed(1),
      marketRent: Math.round(group.totalMarketRent / group.units),
      postRenoRent: Math.round(group.totalMarketRent / group.units * 1.1) // 10% increase for post-reno
    }))

    // Sort by unit type
    summary.sort((a, b) => a.type.localeCompare(b.type))

    setUnitMixSummary(summary)
  }, [rentRollData])

  // Calculate totals
  const totals: Totals = unitMixSummary.reduce(
    (acc, unit) => ({
      units: acc.units + unit.units,
      totalMarketRent: acc.totalMarketRent + (unit.marketRent * unit.units),
      totalPostRenoRent: acc.totalPostRenoRent + (unit.postRenoRent * unit.units)
    }),
    { units: 0, totalMarketRent: 0, totalPostRenoRent: 0 }
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!rentRollData || unitMixSummary.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No unit mix data available
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Unit Mix
        </h2>
        <div className="w-16 h-0.5 bg-gray-800 mx-auto mt-2"></div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border-2 border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 tracking-wide">
                  Unit Type
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 tracking-wide">
                  Units
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 tracking-wide">
                  %
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 tracking-wide">
                  Market
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 tracking-wide">
                  Post-Reno
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {unitMixSummary.map((unit, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {unit.type}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    {unit.units}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    {unit.percentage}%
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    ${unit.marketRent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    ${unit.postRenoRent.toLocaleString()}
                  </td>
                </tr>
              ))}
              
              {/* Totals row */}
              <tr className="bg-gray-900 text-white">
                <td className="px-6 py-4 text-sm font-bold">Total</td>
                <td className="px-6 py-4 text-center text-sm font-bold">
                  {totals.units}
                </td>
                <td className="px-6 py-4 text-center text-sm font-bold">100%</td>
                <td className="px-6 py-4 text-center text-sm font-bold">
                  ${Math.round(totals.totalMarketRent / totals.units).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center text-sm font-bold">
                  ${Math.round(totals.totalPostRenoRent / totals.units).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div>
        {images.map(img => (
  <img key={img.id} src={img.signed_url} alt={img.filename} />
))}
      </div>
    </div>
  )
}

export default UnitMix
