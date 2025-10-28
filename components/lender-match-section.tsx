"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Building2, TrendingUp, Clock, DollarSign, Star, Filter } from "lucide-react"
import { useState } from "react"

interface LenderProduct {
  id: string
  lenderName: string
  productName: string
  interestRate: number
  term: number
  ltv: number
  dscr: number
  points: number
  rating: number
  isPreferred: boolean
  minLoanAmount: number
  maxLoanAmount: number
  propertyTypes: string[]
  features: string[]
}

interface LenderMatchSectionProps {
  onSelectLoan: (product: LenderProduct) => void
}

export function LenderMatchSection({ onSelectLoan }: LenderMatchSectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPropertyType, setFilterPropertyType] = useState("all")
  const [filterMinRate, setFilterMinRate] = useState("")
  const [filterMaxRate, setFilterMaxRate] = useState("")

  const lenderProducts: LenderProduct[] = [
    {
      id: "1",
      lenderName: "Capital One",
      productName: "Multifamily Bridge",
      interestRate: 4.25,
      term: 24,
      ltv: 75,
      dscr: 1.25,
      points: 1.0,
      rating: 4.8,
      isPreferred: true,
      minLoanAmount: 5000000,
      maxLoanAmount: 50000000,
      propertyTypes: ["Multifamily", "Mixed Use"],
      features: ["Interest Only", "Non-Recourse", "Fast Close"],
    },
    {
      id: "2",
      lenderName: "Wells Fargo",
      productName: "Permanent Financing",
      interestRate: 4.75,
      term: 120,
      ltv: 80,
      dscr: 1.3,
      points: 0.75,
      rating: 4.6,
      isPreferred: false,
      minLoanAmount: 10000000,
      maxLoanAmount: 100000000,
      propertyTypes: ["Multifamily", "Office", "Retail"],
      features: ["Fixed Rate", "30 Year Amortization", "Assumable"],
    },
    {
      id: "3",
      lenderName: "JPMorgan Chase",
      productName: "Construction-to-Perm",
      interestRate: 5.0,
      term: 36,
      ltv: 70,
      dscr: 1.2,
      points: 1.25,
      rating: 4.7,
      isPreferred: true,
      minLoanAmount: 15000000,
      maxLoanAmount: 75000000,
      propertyTypes: ["Multifamily", "Mixed Use"],
      features: ["Single Close", "Interest Only", "Flexible Terms"],
    },
  ]

  const filteredProducts = lenderProducts.filter((product) => {
    const matchesSearch =
      product.lenderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPropertyType =
      filterPropertyType === "all" ||
      product.propertyTypes.some((type) => type.toLowerCase().includes(filterPropertyType.toLowerCase()))

    const matchesMinRate = !filterMinRate || product.interestRate >= Number.parseFloat(filterMinRate)
    const matchesMaxRate = !filterMaxRate || product.interestRate <= Number.parseFloat(filterMaxRate)

    return matchesSearch && matchesPropertyType && matchesMinRate && matchesMaxRate
  })

  return (
    <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-gray-900">Lender Match</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600">Find the best financing options for your property</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search lenders or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-semibold text-gray-600">Property Type</Label>
              <Select value={filterPropertyType} onValueChange={setFilterPropertyType}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="multifamily">Multifamily</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="mixed">Mixed Use</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-gray-600">Min Rate (%)</Label>
              <Input
                placeholder="4.0"
                value={filterMinRate}
                onChange={(e) => setFilterMinRate(e.target.value)}
                className="h-8 text-xs"
                type="number"
                step="0.1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-gray-600">Max Rate (%)</Label>
              <Input
                placeholder="6.0"
                value={filterMaxRate}
                onChange={(e) => setFilterMaxRate(e.target.value)}
                className="h-8 text-xs"
                type="number"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">{filteredProducts.length} Products Found</h4>
            <Button variant="outline" size="sm" className="h-8 text-xs bg-transparent">
              <Filter className="w-3 h-3 mr-1" />
              More Filters
            </Button>
          </div>

          {filteredProducts.map((product) => (
            <Card key={product.id} className="border border-gray-200 hover:border-gray-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold text-gray-900 text-sm">{product.lenderName}</h5>
                      {product.isPreferred && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Preferred
                        </Badge>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600">{product.rating}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">{product.productName}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-gray-600">Rate:</span>
                        <span className="font-medium">{product.interestRate}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-600" />
                        <span className="text-gray-600">Term:</span>
                        <span className="font-medium">{product.term}mo</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-purple-600" />
                        <span className="text-gray-600">LTV:</span>
                        <span className="font-medium">{product.ltv}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-orange-600" />
                        <span className="text-gray-600">DSCR:</span>
                        <span className="font-medium">{product.dscr}x</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.features.slice(0, 3).map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:items-end">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{product.points}%</div>
                      <div className="text-xs text-gray-600">Points</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onSelectLoan(product)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Select Loan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No lenders match your criteria</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
