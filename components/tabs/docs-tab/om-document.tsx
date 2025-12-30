"use client"

import { useEffect, useState } from "react"
import {
  Building,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Home,
  Ruler,
  Car,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText,
  Lightbulb,
  BarChart3,
  Building2,
  Percent,
  Target,
  Briefcase,
  Users,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronRight,
  Layers
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OMExtractionResult, OMUnitMix, OMProFormaProjection, OMSourceUseItem } from "@/lib/supabase/database.types"
import { useTabData } from "@/hooks/use-tab-data"

interface OMDocumentProps {
  propertyId?: string
}

interface OMDataResponse {
  success: boolean
  propertyId: string
  propertyName: string
  hasOMData: boolean
  omExtraction: OMExtractionResult | null
  documentFilename?: string
  extractedAt?: string
  source?: string
  message?: string
}

// Format currency
function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return "-"
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toLocaleString()}`
}

// Format percentage
function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return "-"
  // If value is already a decimal like 0.055, convert to percentage
  if (value < 1) {
    return `${(value * 100).toFixed(2)}%`
  }
  return `${value.toFixed(2)}%`
}

// Format number
function formatNumber(value: number | null): string {
  if (value === null || value === undefined) return "-"
  return value.toLocaleString()
}

// Info row component
function InfoRow({ label, value, icon }: { label: string; value: string | null; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </div>
      <div className="text-sm font-medium text-gray-900">{value || "-"}</div>
    </div>
  )
}

// Section card component
function SectionCard({
  title,
  icon,
  children,
  className = ""
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`bg-white shadow-sm border border-gray-200 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
            {icon}
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function OMDocument({ propertyId }: OMDocumentProps) {
  // Get prefetched OM data from cache
  const { 
    data: prefetchedData, 
    isInitialLoading: prefetchLoading,
    prefetched,
    error: prefetchError
  } = useTabData<OMDataResponse>(propertyId || '', 'om')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [omData, setOMData] = useState<OMDataResponse | null>(null)

  // Use prefetched data when available
  useEffect(() => {
    if (!propertyId) {
      setOMData(null)
      return
    }

    // If we have prefetched data, use it immediately
    if (prefetched && prefetchedData) {
      setOMData(prefetchedData)
      setLoading(false)
      return
    }

    // Handle prefetch error
    if (prefetchError) {
      setError(prefetchError)
      setLoading(false)
      return
    }

    // Fallback: fetch if not prefetched and not currently loading
    if (!prefetched && !prefetchLoading) {
      const fetchOMData = async () => {
        setLoading(true)
        setError(null)

        try {
          const response = await fetch(`/api/properties/${propertyId}/om-data`)
          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch OM data')
          }

          setOMData(data)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load OM data')
        } finally {
          setLoading(false)
        }
      }

      fetchOMData()
    }
  }, [propertyId, prefetched, prefetchedData, prefetchLoading, prefetchError])

  // Loading state - consider both local loading and prefetch loading
  const isLoading = (loading || prefetchLoading) && !prefetched
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading OM data...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Error Loading OM Data</h3>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  // No property selected
  if (!propertyId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Offering Memorandum</h3>
          <p className="text-sm text-gray-500">Select a property to view OM data</p>
        </div>
      </div>
    )
  }

  // No OM data available
  if (!omData?.hasOMData || !omData.omExtraction) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No OM Data Available</h3>
          <p className="text-sm text-gray-500 max-w-md">
            {omData?.message || "Upload an Offering Memorandum to extract property information, financial details, and investment highlights."}
          </p>
        </div>
      </div>
    )
  }

  const { omExtraction, documentFilename, extractedAt } = omData
  const { property_info, financial_info, investment_info, returns_info, pro_forma_projections, sources_uses, images } = omExtraction

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Offering Memorandum Data</h2>
            <p className="text-sm text-gray-500 mt-1">
              Extracted from: {documentFilename || "OM Document"}
              {extractedAt && ` on ${new Date(extractedAt).toLocaleDateString()}`}
            </p>
          </div>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Extracted
          </Badge>
        </div>

        {/* Property Info Section */}
        <SectionCard title="Property Information" icon={<Building className="w-4 h-4" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div>
              <InfoRow
                label="Property Name"
                value={property_info.property_name}
                icon={<Building2 className="w-4 h-4" />}
              />
              <InfoRow
                label="Address"
                value={property_info.property_address}
                icon={<MapPin className="w-4 h-4" />}
              />
              <InfoRow
                label="City"
                value={property_info.city}
              />
              <InfoRow
                label="State"
                value={property_info.state}
              />
              <InfoRow
                label="Zip Code"
                value={property_info.zip_code}
              />
              <InfoRow
                label="Property Type"
                value={property_info.property_type}
              />
              <InfoRow
                label="Class Rating"
                value={property_info.class_rating}
              />
            </div>
            <div>
              <InfoRow
                label="Year Built"
                value={property_info.year_built?.toString() || null}
                icon={<Calendar className="w-4 h-4" />}
              />
              <InfoRow
                label="Year Renovated"
                value={property_info.year_renovated?.toString() || null}
              />
              <InfoRow
                label="Total Units"
                value={formatNumber(property_info.total_units)}
                icon={<Home className="w-4 h-4" />}
              />
              <InfoRow
                label="Avg Unit Size"
                value={property_info.avg_unit_size ? `${formatNumber(property_info.avg_unit_size)} SF` : null}
                icon={<Ruler className="w-4 h-4" />}
              />
              <InfoRow
                label="Building Count"
                value={formatNumber(property_info.building_count)}
              />
              <InfoRow
                label="Stories"
                value={formatNumber(property_info.stories)}
              />
              <InfoRow
                label="Parking Ratio"
                value={property_info.parking_ratio?.toString() || null}
                icon={<Car className="w-4 h-4" />}
              />
              <InfoRow
                label="Occupancy"
                value={formatPercent(property_info.occupancy_rate)}
                icon={<Percent className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Amenities */}
          {property_info.amenity_list && property_info.amenity_list.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {property_info.amenity_list.map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Unit Mix Section */}
        {property_info.unit_mix_breakdown && property_info.unit_mix_breakdown.length > 0 && (
          <SectionCard title="Unit Mix" icon={<Home className="w-4 h-4" />}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-600">Unit Type</th>
                    <th className="text-right py-2 font-medium text-gray-600">Count</th>
                    <th className="text-right py-2 font-medium text-gray-600">% Mix</th>
                    <th className="text-right py-2 font-medium text-gray-600">Avg SF</th>
                    <th className="text-right py-2 font-medium text-gray-600">Current Rent</th>
                    <th className="text-right py-2 font-medium text-gray-600">Post-Reno Rent</th>
                    <th className="text-right py-2 font-medium text-gray-600">Upside</th>
                  </tr>
                </thead>
                <tbody>
                  {property_info.unit_mix_breakdown.map((unit: OMUnitMix, index: number) => {
                    const upside = unit.avg_rent && unit.post_reno_rent
                      ? ((unit.post_reno_rent - unit.avg_rent) / unit.avg_rent * 100).toFixed(1)
                      : null
                    return (
                      <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="py-2 text-gray-900 font-medium">{unit.unit_type}</td>
                        <td className="py-2 text-right text-gray-900">{unit.count}</td>
                        <td className="py-2 text-right text-gray-600">
                          {unit.percentage ? `${(unit.percentage * 100).toFixed(1)}%` : "-"}
                        </td>
                        <td className="py-2 text-right text-gray-600">
                          {unit.avg_sqft ? `${formatNumber(unit.avg_sqft)} SF` : "-"}
                        </td>
                        <td className="py-2 text-right text-gray-900">
                          {unit.avg_rent ? formatCurrency(unit.avg_rent) : "-"}
                        </td>
                        <td className="py-2 text-right text-gray-900">
                          {unit.post_reno_rent ? formatCurrency(unit.post_reno_rent) : "-"}
                        </td>
                        <td className="py-2 text-right">
                          {upside ? (
                            <span className="text-green-600 font-medium flex items-center justify-end gap-1">
                              <ArrowUpRight className="w-3 h-3" />
                              {upside}%
                            </span>
                          ) : "-"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {/* Financial Info Section */}
        <SectionCard title="Financial Information" icon={<DollarSign className="w-4 h-4" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
            <div>
              <InfoRow
                label="Offer Price"
                value={formatCurrency(financial_info.offer_price)}
                icon={<DollarSign className="w-4 h-4" />}
              />
              <InfoRow
                label="Price Per Unit"
                value={formatCurrency(financial_info.price_per_unit)}
              />
              <InfoRow
                label="Price Per SF"
                value={financial_info.price_per_sf ? `$${formatNumber(financial_info.price_per_sf)}` : null}
              />
              <InfoRow
                label="Cap Rate"
                value={formatPercent(financial_info.cap_rate)}
                icon={<Percent className="w-4 h-4" />}
              />
              <InfoRow
                label="NOI"
                value={formatCurrency(financial_info.noi)}
              />
            </div>
            <div>
              <InfoRow
                label="Effective Gross Income"
                value={formatCurrency(financial_info.effective_gross_income)}
              />
              <InfoRow
                label="Total Operating Expenses"
                value={formatCurrency(financial_info.total_operating_expenses)}
              />
              <InfoRow
                label="Rent Growth Rate"
                value={formatPercent(financial_info.rent_growth_rate)}
              />
              <InfoRow
                label="Market Rent PSF"
                value={financial_info.market_rent_psf ? `$${financial_info.market_rent_psf.toFixed(2)}` : null}
              />
              <InfoRow
                label="Market Rent Per Unit"
                value={formatCurrency(financial_info.market_rent_unit)}
              />
            </div>
            <div>
              <InfoRow
                label="Loan Amount"
                value={formatCurrency(financial_info.loan_amount)}
              />
              <InfoRow
                label="Interest Rate"
                value={formatPercent(financial_info.interest_rate)}
              />
              <InfoRow
                label="Amortization"
                value={financial_info.amortization ? `${financial_info.amortization} years` : null}
              />
              <InfoRow
                label="Loan Term"
                value={financial_info.loan_term ? `${financial_info.loan_term} years` : null}
              />
              <InfoRow
                label="LTV"
                value={formatPercent(financial_info.ltv)}
              />
              <InfoRow
                label="DSCR"
                value={financial_info.dscr ? `${financial_info.dscr.toFixed(2)}x` : null}
              />
              <InfoRow
                label="Expense Ratio"
                value={formatPercent(financial_info.expense_ratio)}
              />
            </div>
          </div>
        </SectionCard>

        {/* Investment Returns Section - NEW */}
        {returns_info && (returns_info.irr || returns_info.cash_on_cash || returns_info.equity_multiple) && (
          <SectionCard title="Investment Returns" icon={<Target className="w-4 h-4" />}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {returns_info.irr && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-100">
                  <div className="text-2xl font-bold text-green-700">
                    {formatPercent(returns_info.irr)}
                  </div>
                  <div className="text-xs text-green-600 mt-1 font-medium">Projected IRR</div>
                </div>
              )}
              {returns_info.cash_on_cash && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-100">
                  <div className="text-2xl font-bold text-blue-700">
                    {formatPercent(returns_info.cash_on_cash)}
                  </div>
                  <div className="text-xs text-blue-600 mt-1 font-medium">Cash-on-Cash</div>
                </div>
              )}
              {returns_info.equity_multiple && (
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 text-center border border-purple-100">
                  <div className="text-2xl font-bold text-purple-700">
                    {returns_info.equity_multiple.toFixed(2)}x
                  </div>
                  <div className="text-xs text-purple-600 mt-1 font-medium">Equity Multiple</div>
                </div>
              )}
              {returns_info.hold_period && (
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 text-center border border-amber-100">
                  <div className="text-2xl font-bold text-amber-700 flex items-center justify-center gap-1">
                    <Clock className="w-5 h-5" />
                    {returns_info.hold_period}
                  </div>
                  <div className="text-xs text-amber-600 mt-1 font-medium">Hold Period</div>
                </div>
              )}
            </div>
            {returns_info.average_annual_return && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <span className="text-sm text-gray-600">Average Annual Return: </span>
                <span className="text-sm font-semibold text-gray-900">{formatPercent(returns_info.average_annual_return)}</span>
              </div>
            )}
          </SectionCard>
        )}

        {/* Pro Forma Projections Section - NEW */}
        {pro_forma_projections && pro_forma_projections.length > 0 && (
          <SectionCard title="Pro Forma Projections" icon={<BarChart3 className="w-4 h-4" />}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-3 font-medium text-gray-600">Year</th>
                    <th className="text-right py-3 px-3 font-medium text-gray-600">NOI</th>
                    <th className="text-right py-3 px-3 font-medium text-gray-600">Cash Flow</th>
                    <th className="text-right py-3 px-3 font-medium text-gray-600">Property Value</th>
                  </tr>
                </thead>
                <tbody>
                  {pro_forma_projections.map((proj: OMProFormaProjection, index: number) => (
                    <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-3 text-gray-900 font-medium">{proj.year_label}</td>
                      <td className="py-3 px-3 text-right text-gray-900">{formatCurrency(proj.noi)}</td>
                      <td className="py-3 px-3 text-right">
                        {proj.cash_flow !== null ? (
                          <span className={proj.cash_flow >= 0 ? "text-green-600" : "text-red-600"}>
                            {formatCurrency(proj.cash_flow)}
                          </span>
                        ) : "-"}
                      </td>
                      <td className="py-3 px-3 text-right text-gray-900">{formatCurrency(proj.property_value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {/* Sources & Uses Section - NEW */}
        {sources_uses && (sources_uses.sources.length > 0 || sources_uses.uses.length > 0) && (
          <SectionCard title="Sources & Uses of Capital" icon={<Layers className="w-4 h-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sources */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-green-500" />
                  Sources
                </h4>
                <div className="space-y-2">
                  {sources_uses.sources.map((source: OMSourceUseItem, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-700">{source.item}</span>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(source.amount)}</span>
                        {source.percentage && (
                          <span className="text-xs text-gray-500 ml-2">({(source.percentage * 100).toFixed(1)}%)</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {sources_uses.total_sources && (
                    <div className="flex items-center justify-between pt-2 border-t-2 border-gray-200 mt-2">
                      <span className="text-sm font-semibold text-gray-900">Total Sources</span>
                      <span className="text-sm font-bold text-green-600">{formatCurrency(sources_uses.total_sources)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Uses */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-blue-500" />
                  Uses
                </h4>
                <div className="space-y-2">
                  {sources_uses.uses.map((use: OMSourceUseItem, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-700">{use.item}</span>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(use.amount)}</span>
                        {use.percentage && (
                          <span className="text-xs text-gray-500 ml-2">({(use.percentage * 100).toFixed(1)}%)</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {sources_uses.total_uses && (
                    <div className="flex items-center justify-between pt-2 border-t-2 border-gray-200 mt-2">
                      <span className="text-sm font-semibold text-gray-900">Total Uses</span>
                      <span className="text-sm font-bold text-blue-600">{formatCurrency(sources_uses.total_uses)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Investment Info Section */}
        <SectionCard title="Investment Information" icon={<TrendingUp className="w-4 h-4" />}>
          {/* Investment Highlights */}
          {investment_info.investment_highlights && investment_info.investment_highlights.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Investment Highlights
              </h4>
              <ul className="space-y-2">
                {investment_info.investment_highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Property Description */}
          {investment_info.property_description && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Property Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{investment_info.property_description}</p>
            </div>
          )}

          {/* Investment Thesis */}
          {investment_info.investment_thesis && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Investment Thesis</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{investment_info.investment_thesis}</p>
            </div>
          )}

          {/* Submarket Description */}
          {investment_info.submarket_description && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Submarket Analysis</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{investment_info.submarket_description}</p>
            </div>
          )}

          {/* Renovation Plan */}
          {investment_info.renovation_plan && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Renovation Plan</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{investment_info.renovation_plan}</p>
            </div>
          )}

          {/* Business Plan - NEW */}
          {investment_info.business_plan && investment_info.business_plan.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" />
                Business Plan
              </h4>
              <ol className="space-y-2 list-decimal list-inside">
                {investment_info.business_plan.map((step, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    <span className="ml-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Major Employers - NEW */}
          {investment_info.major_employers && investment_info.major_employers.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                Major Employers in Area
              </h4>
              <div className="flex flex-wrap gap-2">
                {investment_info.major_employers.map((employer, index) => (
                  <Badge key={index} variant="secondary" className="bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {employer}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Demographics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-100">
            {investment_info.median_household_income && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(investment_info.median_household_income)}
                </div>
                <div className="text-xs text-gray-500">Median HH Income</div>
              </div>
            )}
            {investment_info.population_growth_rate && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {formatPercent(investment_info.population_growth_rate)}
                </div>
                <div className="text-xs text-gray-500">Population Growth</div>
              </div>
            )}
            {investment_info.employment_growth_rate && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {formatPercent(investment_info.employment_growth_rate)}
                </div>
                <div className="text-xs text-gray-500">Employment Growth</div>
              </div>
            )}
            {investment_info.population_radius_1mi && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {formatNumber(investment_info.population_radius_1mi)}
                </div>
                <div className="text-xs text-gray-500">Pop. (1 mi radius)</div>
              </div>
            )}
            {investment_info.population_radius_3mi && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {formatNumber(investment_info.population_radius_3mi)}
                </div>
                <div className="text-xs text-gray-500">Pop. (3 mi radius)</div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Images Summary */}
        {images && images.length > 0 && (
          <SectionCard title="Detected Images" icon={<BarChart3 className="w-4 h-4" />}>
            <div className="text-sm text-gray-600 mb-3">
              {images.length} property images detected in the OM
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(
                images.reduce((acc, img) => {
                  const cat = img.estimated_category || 'other'
                  acc[cat] = (acc[cat] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              ).map(([category, count]) => (
                <Badge key={category} variant="secondary" className="capitalize">
                  {category}: {count}
                </Badge>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  )
}
