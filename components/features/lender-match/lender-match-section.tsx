/**
 * @fileoverview Lender Match Section Component
 *
 * This component provides a comprehensive lender matching interface that allows users to:
 * - Filter loan products based on property criteria (LTV, DSCR, term, etc.)
 * - Compare multiple lender products side by side
 * - Add custom loan terms manually
 * - Select optimal loan products for their real estate investments
 *
 * Features:
 * - Responsive design with mobile-optimized modal interface
 * - Real-time filtering with slider controls for key metrics
 * - Product comparison functionality
 * - Integration with property analysis workflow
 *
 * @author Real Estate Analyzer Team
 * @version 1.0.0
 */

"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Filter, ExternalLink, Plus, GitCompare, Check, X } from "lucide-react"

/**
 * Interface defining the structure of a lender product
 * Contains all essential loan terms and lender information
 */
interface LenderProduct {
  id: string // Unique identifier for the product
  lender: string // Name of the lending institution
  logo: string // Emoji or logo representation
  productName: string // Specific loan product name
  maxLTV: number // Maximum Loan-to-Value ratio (percentage)
  minDSCR: number // Minimum Debt Service Coverage Ratio
  rate: string // Interest rate (can be fixed or variable)
  term: number // Loan term in years
  amortization: number // Amortization period in years
  prepayType: string // Prepayment penalty structure
  proceedsRange: string // Loan amount range
  source: string // Type of lender (Bank, Agency, Broker, etc.)
}

/**
 * Props interface for the LenderMatchSection component
 */
interface LenderMatchSectionProps {
  onSelectLoan: (product: LenderProduct) => void // Callback when user selects a loan product
}

/**
 * Mock data representing various lender products
 * In production, this would be fetched from an API or database
 */
const mockLenders: LenderProduct[] = [
  {
    id: "1",
    lender: "Wells Fargo",
    logo: "🏦",
    productName: "Multifamily Fixed Rate",
    maxLTV: 75,
    minDSCR: 1.25,
    rate: "4.25%",
    term: 10,
    amortization: 30,
    prepayType: "Yield Maintenance",
    proceedsRange: "$5M - $50M",
    source: "Direct Lender",
  },
  {
    id: "2",
    lender: "JPMorgan Chase",
    logo: "🏛️",
    productName: "Commercial Real Estate",
    maxLTV: 70,
    minDSCR: 1.3,
    rate: "SOFR + 2.75%",
    term: 7,
    amortization: 25,
    prepayType: "Stepdown",
    proceedsRange: "$10M - $100M",
    source: "Bank",
  },
  {
    id: "3",
    lender: "Freddie Mac",
    logo: "🏢",
    productName: "Small Balance Loan",
    maxLTV: 80,
    minDSCR: 1.2,
    rate: "4.15%",
    term: 12,
    amortization: 30,
    prepayType: "Open",
    proceedsRange: "$1M - $7.5M",
    source: "Agency",
  },
  {
    id: "4",
    lender: "CBRE Capital Markets",
    logo: "🏗️",
    productName: "Bridge Loan",
    maxLTV: 75,
    minDSCR: 1.15,
    rate: "Prime + 1.50%",
    term: 3,
    amortization: 30,
    prepayType: "Open",
    proceedsRange: "$5M - $25M",
    source: "Broker",
  },
  {
    id: "5",
    lender: "Fannie Mae",
    logo: "🏘️",
    productName: "DUS Loan",
    maxLTV: 80,
    minDSCR: 1.25,
    rate: "4.35%",
    term: 10,
    amortization: 30,
    prepayType: "Yield Maintenance",
    proceedsRange: "$1M - $100M",
    source: "Agency",
  },
]

/**
 * Main LenderMatchSection Component
 *
 * Provides a comprehensive interface for finding and comparing loan products.
 * Includes both desktop and mobile-optimized layouts with advanced filtering capabilities.
 *
 * @param onSelectLoan - Callback function triggered when user selects a loan product
 * @returns JSX element containing the lender match interface
 */
export function LenderMatchSection({ onSelectLoan }: LenderMatchSectionProps) {
  // State management for filter criteria
  const [filters, setFilters] = useState({
    propertyType: [] as string[], // Selected property types
    location: "", // Geographic location filter
    noi: "", // Net Operating Income input
    targetLTV: [75], // Target Loan-to-Value ratio slider
    loanPurpose: "", // Purpose of the loan (acquisition, refinance, etc.)
    term: [10], // Desired loan term slider
    amortization: [30], // Desired amortization period slider
    interestType: "", // Fixed vs floating rate preference
    recourse: "", // Recourse type preference
  })

  // State for product selection and comparison
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]) // IDs of products selected for comparison
  const [showManualAdd, setShowManualAdd] = useState(false) // Controls manual loan addition modal
  const [filteredLenders, setFilteredLenders] = useState(mockLenders) // Filtered results based on criteria
  const [showMobileModal, setShowMobileModal] = useState(false) // Controls mobile modal visibility

  /**
   * Handles changes to filter criteria
   * Updates the filters state and triggers re-filtering of results
   *
   * @param key - The filter property to update
   * @param value - The new value for the filter
   */
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    applyFilters({ ...filters, [key]: value })
  }

  /**
   * Applies current filter criteria to the lender dataset
   * Filters products based on LTV requirements, loan terms, and other criteria
   *
   * @param currentFilters - The current filter state to apply
   */
  const applyFilters = (currentFilters: typeof filters) => {
    let filtered = mockLenders

    // Filter by maximum LTV requirement
    if (currentFilters.targetLTV[0]) {
      filtered = filtered.filter((lender) => lender.maxLTV >= currentFilters.targetLTV[0])
    }

    // Filter by minimum term requirement
    if (currentFilters.term[0]) {
      filtered = filtered.filter((lender) => lender.term >= currentFilters.term[0])
    }

    // Update the filtered results
    setFilteredLenders(filtered)
  }

  /**
   * Toggles selection state of a product for comparison
   * Adds or removes product from the comparison list
   *
   * @param productId - The ID of the product to toggle
   */
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  return (
    <>
      {/* Mobile-only search button - shows modal on tap */}
      <div className="block sm:hidden">
        <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
          <CardContent className="p-4">
            <Button onClick={() => setShowMobileModal(true)} className="w-full h-12 text-base">
              <Search className="w-5 h-5 mr-2" />
              Find Lenders
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Desktop layout - full interface visible */}
      <Card className="hidden sm:block bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-gray-900">Lender Match</CardTitle>
              <p className="text-sm text-gray-600">Find the best loan products for your property</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filters Section - allows users to narrow down loan options */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>

            {/* Grid layout for filter controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Property Type Selection */}
              <div>
                <Label className="text-xs font-semibold text-gray-700">Property Type</Label>
                <Select onValueChange={(value) => handleFilterChange("propertyType", [value])}>
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multifamily">Multifamily</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Geographic Location Filter */}
              <div>
                <Label className="text-xs font-semibold text-gray-700">Location</Label>
                <Select onValueChange={(value) => handleFilterChange("location", value)}>
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ny">New York</SelectItem>
                    <SelectItem value="ca">California</SelectItem>
                    <SelectItem value="tx">Texas</SelectItem>
                    <SelectItem value="fl">Florida</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Net Operating Income Input */}
              <div>
                <Label className="text-xs font-semibold text-gray-700">NOI</Label>
                <Input
                  className="mt-1 h-8 text-xs"
                  placeholder="$1,200,000"
                  value={filters.noi}
                  onChange={(e) => handleFilterChange("noi", e.target.value)}
                  inputMode="numeric"
                />
              </div>

              {/* Loan Purpose Selection */}
              <div>
                <Label className="text-xs font-semibold text-gray-700">Loan Purpose</Label>
                <Select onValueChange={(value) => handleFilterChange("loanPurpose", value)}>
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acquisition">Acquisition</SelectItem>
                    <SelectItem value="refinance">Refinance</SelectItem>
                    <SelectItem value="bridge">Bridge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Slider Controls for Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Target LTV Slider - determines maximum leverage */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-gray-700">Target LTV: {filters.targetLTV[0]}%</Label>
                <div className="px-2">
                  <Slider
                    value={filters.targetLTV}
                    onValueChange={(value) => handleFilterChange("targetLTV", value)}
                    max={85}
                    min={50}
                    step={5}
                    className="w-full [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-600 [&_.slider-track]:bg-blue-200"
                  />
                </div>
              </div>

              {/* Loan Term Slider - desired loan duration */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-gray-700">Term: {filters.term[0]} years</Label>
                <div className="px-2">
                  <Slider
                    value={filters.term}
                    onValueChange={(value) => handleFilterChange("term", value)}
                    max={30}
                    min={1}
                    step={1}
                    className="w-full [&_[role=slider]]:bg-green-600 [&_[role=slider]]:border-green-600 [&_.slider-track]:bg-green-200"
                  />
                </div>
              </div>

              {/* Amortization Period Slider - payment schedule duration */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-gray-700">
                  Amortization: {filters.amortization[0]} years
                </Label>
                <div className="px-2">
                  <Slider
                    value={filters.amortization}
                    onValueChange={(value) => handleFilterChange("amortization", value)}
                    max={30}
                    min={15}
                    step={5}
                    className="w-full [&_[role=slider]]:bg-purple-600 [&_[role=slider]]:border-purple-600 [&_.slider-track]:bg-purple-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Header with Action Buttons */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Results ({filteredLenders.length})</h3>
              <p className="text-sm text-gray-600">Matching loan products</p>
            </div>
            <div className="flex gap-2">
              {/* Show comparison button when products are selected */}
              {selectedProducts.length > 0 && (
                <Button variant="outline" size="sm">
                  <GitCompare className="w-4 h-4 mr-2" />
                  Compare ({selectedProducts.length})
                </Button>
              )}
              {/* Manual loan addition dialog */}
              <Dialog open={showManualAdd} onOpenChange={setShowManualAdd}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Manual Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Custom Loan Terms</DialogTitle>
                  </DialogHeader>
                  {/* Form for adding custom loan terms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                    <div>
                      <Label>Lender Name</Label>
                      <Input placeholder="Enter lender name" className="h-10" />
                    </div>
                    <div>
                      <Label>Product Name</Label>
                      <Input placeholder="Enter product name" className="h-10" />
                    </div>
                    <div>
                      <Label>Interest Rate</Label>
                      <Input placeholder="4.25%" className="h-10" inputMode="decimal" />
                    </div>
                    <div>
                      <Label>Max LTV (%)</Label>
                      <Input placeholder="75" className="h-10" inputMode="numeric" />
                    </div>
                    <div>
                      <Label>Min DSCR</Label>
                      <Input placeholder="1.25" className="h-10" inputMode="decimal" />
                    </div>
                    <div>
                      <Label>Term (years)</Label>
                      <Input placeholder="10" className="h-10" inputMode="numeric" />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <Label>Notes</Label>
                      <Textarea placeholder="Additional terms and conditions..." className="min-h-[80px]" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowManualAdd(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setShowManualAdd(false)}>Add Loan</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Loan Products Results List */}
          <div className="space-y-3">
            {filteredLenders.map((product) => (
              <Card key={product.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Lender Information */}
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{product.logo}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{product.lender}</h4>
                        <p className="text-sm text-gray-600">{product.productName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {product.source}
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Key Loan Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{product.maxLTV}%</div>
                        <div className="text-xs text-gray-600">Max LTV</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{product.minDSCR}x</div>
                        <div className="text-xs text-gray-600">Min DSCR</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{product.rate}</div>
                        <div className="text-xs text-gray-600">Rate</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{product.term}Y</div>
                        <div className="text-xs text-gray-600">Term</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant={selectedProducts.includes(product.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleProductSelection(product.id)}
                        className="h-10 lg:h-8"
                      >
                        {selectedProducts.includes(product.id) ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Selected
                          </>
                        ) : (
                          "Compare"
                        )}
                      </Button>
                      <Button size="sm" onClick={() => onSelectLoan(product)} className="h-10 lg:h-8">
                        Select
                      </Button>
                    </div>
                  </div>

                  {/* Additional Loan Details */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-600">
                    <span>Amortization: {product.amortization} years</span>
                    <span>Prepay: {product.prepayType}</span>
                    <span>Range: {product.proceedsRange}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Modal - Full-screen interface for mobile devices */}
      <Dialog open={showMobileModal} onOpenChange={setShowMobileModal}>
        <DialogContent className="sm:hidden max-w-full h-screen m-0 rounded-none p-0 max-h-screen">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <DialogHeader className="p-4 border-b flex-shrink-0 bg-white sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-bold">Find Lenders</DialogTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowMobileModal(false)} className="h-8 w-8 p-0">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </DialogHeader>

            {/* Mobile Content - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-white">
              <div className="p-4 space-y-6 pb-20">
                {/* Mobile Filters Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg">Filters</h3>

                  {/* Mobile Filter Controls - Stacked Layout */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Property Type - Mobile Optimized */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Property Type</Label>
                      <Select onValueChange={(value) => handleFilterChange("propertyType", [value])}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multifamily">Multifamily</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="industrial">Industrial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location - Mobile Optimized */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Location</Label>
                      <Select onValueChange={(value) => handleFilterChange("location", value)}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ny">New York</SelectItem>
                          <SelectItem value="ca">California</SelectItem>
                          <SelectItem value="tx">Texas</SelectItem>
                          <SelectItem value="fl">Florida</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* NOI Input - Mobile Optimized */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">NOI</Label>
                      <Input
                        className="h-12 text-base"
                        placeholder="$1,200,000"
                        value={filters.noi}
                        onChange={(e) => handleFilterChange("noi", e.target.value)}
                        inputMode="numeric"
                      />
                    </div>

                    {/* Loan Purpose - Mobile Optimized */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Loan Purpose</Label>
                      <Select onValueChange={(value) => handleFilterChange("loanPurpose", value)}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="acquisition">Acquisition</SelectItem>
                          <SelectItem value="refinance">Refinance</SelectItem>
                          <SelectItem value="bridge">Bridge</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Mobile Sliders - Enhanced for Touch */}
                  <div className="space-y-6">
                    {/* Target LTV Slider - Mobile Enhanced */}
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold text-gray-700">Target LTV: {filters.targetLTV[0]}%</Label>
                      <div className="px-4 py-2 bg-blue-50 rounded-lg">
                        <Slider
                          value={filters.targetLTV}
                          onValueChange={(value) => handleFilterChange("targetLTV", value)}
                          max={85}
                          min={50}
                          step={5}
                          className="w-full [&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_.slider-track]:h-2 [&_.slider-track]:bg-blue-200 [&_.slider-range]:bg-blue-600"
                        />
                      </div>
                    </div>

                    {/* Term Slider - Mobile Enhanced */}
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold text-gray-700">Term: {filters.term[0]} years</Label>
                      <div className="px-4 py-2 bg-green-50 rounded-lg">
                        <Slider
                          value={filters.term}
                          onValueChange={(value) => handleFilterChange("term", value)}
                          max={30}
                          min={1}
                          step={1}
                          className="w-full [&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:bg-green-600 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_.slider-track]:h-2 [&_.slider-track]:bg-green-200 [&_.slider-range]:bg-green-600"
                        />
                      </div>
                    </div>

                    {/* Amortization Slider - Mobile Enhanced */}
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold text-gray-700">
                        Amortization: {filters.amortization[0]} years
                      </Label>
                      <div className="px-4 py-2 bg-purple-50 rounded-lg">
                        <Slider
                          value={filters.amortization}
                          onValueChange={(value) => handleFilterChange("amortization", value)}
                          max={30}
                          min={15}
                          step={5}
                          className="w-full [&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:bg-purple-600 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_.slider-track]:h-2 [&_.slider-track]:bg-purple-200 [&_.slider-range]:bg-purple-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mobile Results Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-lg">Results ({filteredLenders.length})</h3>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Manual Add
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Matching loan products</p>

                    {/* Mobile Results List */}
                    <div className="space-y-4">
                      {filteredLenders.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>No matching lenders found</p>
                          <p className="text-sm">Try adjusting your filters</p>
                        </div>
                      ) : (
                        filteredLenders.map((product) => (
                          <Card key={product.id} className="border border-gray-200 bg-white">
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                {/* Mobile Product Header */}
                                <div className="flex items-center gap-3">
                                  <div className="text-2xl">{product.logo}</div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 truncate">{product.lender}</h4>
                                    <p className="text-sm text-gray-600 truncate">{product.productName}</p>
                                    <Badge variant="secondary" className="text-xs mt-1">
                                      {product.source}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Mobile Metrics Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                                    <div className="text-base font-bold text-gray-900">{product.maxLTV}%</div>
                                    <div className="text-xs text-gray-600">Max LTV</div>
                                  </div>
                                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                                    <div className="text-base font-bold text-gray-900">{product.minDSCR}x</div>
                                    <div className="text-xs text-gray-600">Min DSCR</div>
                                  </div>
                                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                                    <div className="text-base font-bold text-gray-900">{product.rate}</div>
                                    <div className="text-xs text-gray-600">Rate</div>
                                  </div>
                                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                                    <div className="text-base font-bold text-gray-900">{product.term}Y</div>
                                    <div className="text-xs text-gray-600">Term</div>
                                  </div>
                                </div>

                                {/* Mobile Action Buttons */}
                                <div className="flex gap-3">
                                  <Button
                                    variant={selectedProducts.includes(product.id) ? "default" : "outline"}
                                    className="flex-1 h-12 text-base"
                                    onClick={() => toggleProductSelection(product.id)}
                                  >
                                    {selectedProducts.includes(product.id) ? (
                                      <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Selected
                                      </>
                                    ) : (
                                      "Compare"
                                    )}
                                  </Button>
                                  <Button
                                    className="flex-1 h-12 text-base"
                                    onClick={() => {
                                      onSelectLoan(product)
                                      setShowMobileModal(false)
                                    }}
                                  >
                                    Select
                                  </Button>
                                </div>

                                {/* Mobile Additional Details */}
                                <div className="text-sm text-gray-600 space-y-1 pt-2 border-t border-gray-100">
                                  <div>Amortization: {product.amortization} years</div>
                                  <div>Prepay: {product.prepayType}</div>
                                  <div>Range: {product.proceedsRange}</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Bottom spacing for mobile scrolling */}
                  <div className="h-8"></div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
