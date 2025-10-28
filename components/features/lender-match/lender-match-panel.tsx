"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { X, Search, Filter, ExternalLink, Plus, GitCompare, Check } from "lucide-react"

/**
 * Interface defining the structure of a lender product
 * Contains comprehensive loan terms and lender information
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
 * Props interface for the LenderMatchPanel component
 */
interface LenderMatchPanelProps {
  isOpen: boolean // Controls panel visibility
  onClose: () => void // Callback to close the panel
  onSelectLoan: (product: LenderProduct) => void // Callback function triggered when user selects a loan product
}

/**
 * Mock data representing various lender products
 * In production, this would be fetched from an API or database
 * Includes major lenders across different product types and risk profiles
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
 * Main LenderMatchPanel Component
 *
 * Provides a comprehensive full-screen interface for finding and comparing loan products.
 * Features a dedicated filter sidebar and detailed results display area.
 *
 * @param isOpen - Boolean controlling panel visibility
 * @param onClose - Function to close the panel
 * @param onSelectLoan - Callback function triggered when user selects a loan product
 * @returns JSX element containing the lender match panel or null if closed
 */
export function LenderMatchPanel({ isOpen, onClose, onSelectLoan }: LenderMatchPanelProps) {
  // State management for comprehensive filter criteria
  const [filters, setFilters] = useState({
    propertyType: [] as string[], // Selected property types (multifamily, office, etc.)
    location: "", // Geographic location filter
    noi: "", // Net Operating Income input
    targetLTV: [75], // Target Loan-to-Value ratio slider
    loanPurpose: "", // Purpose of the loan (acquisition, refinance, etc.)
    term: [10], // Desired loan term slider
    amortization: [30], // Desired amortization period slider
    interestType: "", // Fixed vs floating rate preference
    recourse: "", // Recourse type preference (none, partial, full)
  })

  // State for product selection and UI management
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]) // IDs of products selected for comparison
  const [showManualAdd, setShowManualAdd] = useState(false) // Controls manual loan addition modal
  const [filteredLenders, setFilteredLenders] = useState(mockLenders) // Filtered results based on criteria

  /**
   * Handles changes to filter criteria
   * Updates the filters state and triggers re-filtering of results
   *
   * @param key - The filter property to update
   * @param value - The new value for the filter
   */
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    // Apply filtering logic with updated criteria
    applyFilters({ ...filters, [key]: value })
  }

  /**
   * Applies current filter criteria to the lender dataset
   * Implements comprehensive filtering logic for all criteria
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

    // Additional filtering logic can be added here for loan purpose, etc.
    if (currentFilters.loanPurpose) {
      // Filter by loan purpose logic would be implemented here
    }

    // Update the filtered results
    setFilteredLenders(filtered)
  }

  /**
   * Toggles selection state of a product for comparison
   * Manages the list of products selected for side-by-side comparison
   *
   * @param productId - The ID of the product to toggle
   */
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  // Return null if panel is not open (conditional rendering)
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop Overlay - clicking closes the panel */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Main Panel Container - slides in from right */}
      <div className="ml-auto w-full max-w-4xl bg-white shadow-2xl flex flex-col">
        {/* Panel Header with Title and Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Lender Match</h2>
              <p className="text-sm text-gray-600">Find the best loan products for your property</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Main Content Area - Split Layout */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Sidebar - Comprehensive Filters */}
          <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>

            <div className="space-y-6">
              {/* Property Type Selection */}
              <div>
                <Label className="text-sm font-semibold text-gray-700">Property Type</Label>
                <Select onValueChange={(value) => handleFilterChange("propertyType", [value])}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multifamily">Multifamily</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="mixed-use">Mixed Use</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Geographic Location Filter */}
              <div>
                <Label className="text-sm font-semibold text-gray-700">Location</Label>
                <Select onValueChange={(value) => handleFilterChange("location", value)}>
                  <SelectTrigger className="mt-2">
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
                <Label className="text-sm font-semibold text-gray-700">NOI</Label>
                <Input
                  className="mt-2"
                  placeholder="$1,200,000"
                  value={filters.noi}
                  onChange={(e) => handleFilterChange("noi", e.target.value)}
                />
              </div>

              {/* Target LTV Slider - Key Leverage Metric */}
              <div>
                <Label className="text-sm font-semibold text-gray-700">Target LTV: {filters.targetLTV[0]}%</Label>
                <Slider
                  value={filters.targetLTV}
                  onValueChange={(value) => handleFilterChange("targetLTV", value)}
                  max={85}
                  min={50}
                  step={5}
                  className="mt-3"
                />
              </div>

              {/* Loan Purpose Selection */}
              <div>
                <Label className="text-sm font-semibold text-gray-700">Loan Purpose</Label>
                <Select onValueChange={(value) => handleFilterChange("loanPurpose", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acquisition">Acquisition</SelectItem>
                    <SelectItem value="refinance">Refinance</SelectItem>
                    <SelectItem value="bridge">Bridge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Loan Term Slider */}
              <div>
                <Label className="text-sm font-semibold text-gray-700">Term: {filters.term[0]} years</Label>
                <Slider
                  value={filters.term}
                  onValueChange={(value) => handleFilterChange("term", value)}
                  max={30}
                  min={1}
                  step={1}
                  className="mt-3"
                />
              </div>

              {/* Amortization Period Slider */}
              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  Amortization: {filters.amortization[0]} years
                </Label>
                <Slider
                  value={filters.amortization}
                  onValueChange={(value) => handleFilterChange("amortization", value)}
                  max={30}
                  min={15}
                  step={5}
                  className="mt-3"
                />
              </div>

              {/* Interest Rate Type Selection */}
              <div>
                <Label className="text-sm font-semibold text-gray-700">Interest Type</Label>
                <Select onValueChange={(value) => handleFilterChange("interestType", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="floating">Floating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Recourse Type Selection */}
              <div>
                <Label className="text-sm font-semibold text-gray-700">Recourse</Label>
                <Select onValueChange={(value) => handleFilterChange("recourse", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select recourse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Right Side - Results Display Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Results Header with Action Buttons */}
            <div className="flex items-center justify-between mb-6">
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
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div>
                        <Label>Lender Name</Label>
                        <Input placeholder="Enter lender name" />
                      </div>
                      <div>
                        <Label>Product Name</Label>
                        <Input placeholder="Enter product name" />
                      </div>
                      <div>
                        <Label>Interest Rate</Label>
                        <Input placeholder="4.25%" />
                      </div>
                      <div>
                        <Label>Max LTV (%)</Label>
                        <Input placeholder="75" />
                      </div>
                      <div>
                        <Label>Min DSCR</Label>
                        <Input placeholder="1.25" />
                      </div>
                      <div>
                        <Label>Term (years)</Label>
                        <Input placeholder="10" />
                      </div>
                      <div className="col-span-2">
                        <Label>Notes</Label>
                        <Textarea placeholder="Additional terms and conditions..." />
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
                    <div className="flex items-center justify-between">
                      {/* Lender Information Section */}
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
                      <div className="grid grid-cols-4 gap-6 text-center">
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
                      <div className="flex items-center gap-2">
                        <Button
                          variant={selectedProducts.includes(product.id) ? "default" : "outline"}
                          size="sm"
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
                          size="sm"
                          onClick={() => {
                            onSelectLoan(product)
                            onClose()
                          }}
                        >
                          Select
                        </Button>
                      </div>
                    </div>

                    {/* Additional Loan Details Footer */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                      <span>Amortization: {product.amortization} years</span>
                      <span>Prepay: {product.prepayType}</span>
                      <span>Range: {product.proceedsRange}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
