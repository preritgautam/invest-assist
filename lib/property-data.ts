/**
 * @fileoverview Property Data Management System
 *
 * This module provides comprehensive property data structures and management utilities
 * for the real estate investment analysis application. It defines the core PropertyData
 * interface and provides sample data for demonstration purposes.
 *
 * Key Features:
 * - Complete property data modeling with financial metrics
 * - Sample property data for Austin, Nashville, and Denver markets
 * - CRUD operations for property management
 * - Support for multifamily residential and commercial properties
 * - Integration with charts, analytics, and financial projections
 *
 * @author Real Estate Investment Platform
 * @version 1.0.0
 */

/**
 * Core interface defining the complete structure of property data
 * Used throughout the application for property analysis and management
 *
 * @interface PropertyData
 */
export interface PropertyData {
  /** Unique identifier for the property */
  id: string
  /** Display name of the property */
  name: string
  /** Full street address of the property */
  address: string
  /** Current status of the property (Active, Under Review, Draft) */
  status: string
  /** URL or path to the property's main thumbnail image */
  thumbnail: string
  /** Formatted offer price string (e.g., "$17.0M") */
  offerPrice: string
  /** Formatted capitalization rate string (e.g., "5.8%") */
  capRate: string
  /** Total number of units in the property */
  units: number
  /** Optional geographic coordinates for mapping */
  coordinates?: { lat: number; lng: number }

  /**
   * Key financial metrics for quick property overview
   * Used in property cards and summary displays
   */
  keyMetrics?: {
    /** Formatted offer price */
    offerPrice: string
    /** Formatted cap rate percentage */
    capRate: string
    /** Formatted unit count */
    units: string
    /** Formatted price per unit */
    pricePerUnit: string
    /** Cash-on-cash return percentage */
    cocReturn: string
    /** Internal rate of return percentage */
    irr: string
    /** Equity multiple (e.g., "2.4X") */
    emx: string
  }

  /**
   * Physical property characteristics
   * Used for property analysis and comparisons
   */
  /** Year the property was built */
  yearBuilt?: number
  /** Current occupancy rate as formatted string */
  occupancy?: string
  /** Planned investment hold period */
  holdPeriod?: string
  /** Average square footage per unit */
  avgSqFtPerUnit?: number
  /** Formatted price per square foot */
  pricePerSqFt?: string

  /**
   * Property image gallery
   * Used in property detail views and presentations
   */
  images?: Array<{
    /** Image source URL or path */
    src: string
    /** Descriptive label for the image */
    label: string
  }>

  /**
   * Financial projections over time
   * Used for pro forma analysis and charts
   */
  proForma?: Array<{
    /** Year label (e.g., "Year 1") */
    year: string
    /** Net operating income for the year */
    noi: number
  }>

  /**
   * Investment return metrics
   * Used in returns analysis and investor presentations
   */
  returns?: {
    /** Internal rate of return percentage */
    irr: string
    /** Cash-on-cash return percentage */
    cashOnCash: string
    /** Equity multiple (e.g., "2.4X") */
    equityMultiple: string
    /** Investment hold period */
    holdPeriod: string
  }

  /**
   * Sources and uses of funds
   * Used for capital structure analysis
   */
  sourcesUses?: {
    /** Funding sources breakdown */
    sources: Array<{ item: string; amount: number }>
    /** Fund usage breakdown */
    uses: Array<{ item: string; amount: number }>
  }

  /**
   * Debt financing terms
   * Used for financing analysis and DSCR calculations
   */
  debt?: {
    /** Total loan amount */
    loanAmount: number
    /** Annual interest rate */
    interestRate: number
    /** Loan term in years */
    term: number
    /** Loan-to-value ratio */
    ltv: number
    /** Debt service coverage ratio */
    dscr: number
  }

  /**
   * Investment business plan strategy
   * Used in business plan presentations and documentation
   */
  businessPlan?: string[]

  /**
   * Chart data for visualizations
   * Used in analytics charts and cash flow projections
   */
  chartData?: Array<{
    /** Year label for chart axis */
    year: string
    /** Annual cash flow amount */
    cashFlow: number
    /** Property value for the year */
    propertyValue: number
  }>

  /**
   * Unit mix breakdown by type
   * Used for rent roll analysis and market positioning
   */
  unitMix?: Array<{
    /** Unit type (Studio, 1BR, 2BR, etc.) */
    type: string
    /** Number of units of this type */
    units: number
    /** Percentage of total units */
    percentage: number
    /** Current market rent */
    marketRent: number
    /** Post-renovation rent potential */
    postRenoRent: number
  }>

  /**
   * Whisper price analysis
   * Used for acquisition pricing strategy
   */
  whisperPrice?: {
    /** Cap rate based price */
    cap: number
    /** Per unit based price */
    perUnit: number
    /** Total whisper price */
    total: number
  }

  /**
   * Document management system
   * Used for due diligence and document tracking
   */
  documents?: Array<{
    /** Unique document identifier */
    id: string
    /** Document filename */
    name: string
    /** Document type classification */
    type: "OS" | "RR" | "OM" | "Other"
    /** Upload timestamp */
    uploadDate: string
    /** Processing status */
    status: "uploaded" | "processing" | "extracted" | "verified"
    /** Extracted financial data from document */
    extractedData?: {
      /** Net operating income */
      noi?: number
      /** Unit count */
      units?: number
      /** Occupancy rate */
      occupancy?: number
      /** Average rent */
      avgRent?: number
      /** Operating expenses */
      expenses?: number
      /** Capitalization rate */
      capRate?: number
    }
    /** File storage URL */
    fileUrl?: string
  }>
}

/**
 * Sample property data array containing demonstration properties
 * Includes multifamily and commercial properties from different markets
 *
 * Properties included:
 * - Downtown Heights (Austin, TX) - 152-unit multifamily
 * - Riverside Commons (Nashville, TN) - 84-unit multifamily
 * - Metro Plaza (Denver, CO) - 45-suite commercial office
 */
export const PROPERTIES_DATA: PropertyData[] = [
  {
    id: "downtown-heights-152",
    name: "Downtown Heights",
    address: "1247 Broadway Avenue, Austin, TX 78701",
    status: "Active",
    thumbnail: "/modern-apartment-building-exterior-downtown.jpg",
    offerPrice: "$17.0M",
    capRate: "5.8%",
    units: 152,
    coordinates: { lat: 30.2672, lng: -97.7431 },

    // Key metrics - Austin multifamily market
    keyMetrics: {
      offerPrice: "$17.0M",
      capRate: "5.8%",
      units: "152",
      pricePerUnit: "$111,842",
      cocReturn: "12.5%",
      irr: "18.2%",
      emx: "2.4X",
    },

    // Property details - Modern Austin development
    yearBuilt: 2019,
    occupancy: "97.8%",
    holdPeriod: "5 years",
    avgSqFtPerUnit: 925,
    pricePerSqFt: "$120.91",

    // Property gallery images
    images: [
      { src: "/modern-apartment-exterior.png", label: "Building View" },
      { src: "/apartment-interior-1.png", label: "Inside Apartment" },
      { src: "/renovated-modern-kitchen-apartment.jpg", label: "Renovated Unit" },
      { src: "/apartment-unit-before-renovation.jpg", label: "Non-Renovated Unit" },
      { src: "/modern-apartment-bathroom.png", label: "Bathroom" },
      { src: "/apartment-fitness-center-amenity.jpg", label: "Amenity" },
      { src: "/apartment-building-parking-garage.jpg", label: "Parking" },
    ],

    // Unit mix - Austin market rents
    unitMix: [
      { type: "Studio", units: 15, percentage: 10, marketRent: 1650, postRenoRent: 1850 },
      { type: "1BR", units: 76, percentage: 50, marketRent: 1950, postRenoRent: 2200 },
      { type: "2BR", units: 53, percentage: 35, marketRent: 2650, postRenoRent: 2950 },
      { type: "3BR", units: 8, percentage: 5, marketRent: 3400, postRenoRent: 3750 },
    ],

    // Whisper price
    whisperPrice: {
      cap: 1020000,
      perUnit: 109211,
      total: 16600000,
    },

    // Pro Forma projections - Austin growth market
    proForma: [
      { year: "Year 1", noi: 986000 },
      { year: "Year 2", noi: 1064820 },
      { year: "Year 3", noi: 1149165 },
      { year: "Year 4", noi: 1240098 },
      { year: "Year 5", noi: 1338706 },
    ],

    // Investment returns - Austin value-add
    returns: {
      irr: "18.2%",
      cashOnCash: "12.5%",
      equityMultiple: "2.4X",
      holdPeriod: "5 years",
    },

    // Sources and uses
    sourcesUses: {
      sources: [
        { item: "Equity", amount: 5100000 },
        { item: "Debt", amount: 11900000 },
        { item: "Total Sources", amount: 17000000 },
      ],
      uses: [
        { item: "Purchase Price", amount: 17000000 },
        { item: "Closing Costs", amount: 340000 },
        { item: "Renovation Reserve", amount: 760000 },
        { item: "Working Capital", amount: 200000 },
        { item: "Total Uses", amount: 18300000 },
      ],
    },

    // Financing terms - Current Austin market
    debt: {
      loanAmount: 11900000,
      interestRate: 6.75,
      term: 30,
      ltv: 70,
      dscr: 1.28,
    },

    // Business plan - Austin tech hub strategy
    businessPlan: [
      "Acquire 152-unit Class A multifamily property in Austin's booming downtown tech corridor",
      "Target young professionals and tech workers with premium amenities and smart home features",
      "Implement strategic unit renovations focusing on modern finishes and technology integration",
      "Capitalize on Austin's 15% annual rent growth through aggressive lease-up strategy",
      "Exit to institutional buyer targeting Austin's high-growth demographic trends",
    ],

    // Chart data for Austin market growth
    chartData: [
      { year: "Year 1", cashFlow: 425000, propertyValue: 17000000 },
      { year: "Year 2", cashFlow: 503820, propertyValue: 18360000 },
      { year: "Year 3", cashFlow: 588165, propertyValue: 19829400 },
      { year: "Year 4", cashFlow: 679098, propertyValue: 21417772 },
      { year: "Year 5", cashFlow: 777706, propertyValue: 23137173 },
    ],
  },
  {
    id: "riverside-commons-84",
    name: "Riverside Commons",
    address: "2850 Riverside Drive, Nashville, TN 37208",
    status: "Active",
    thumbnail: "/riverside-apartment-complex-building.jpg",
    offerPrice: "$12.5M",
    capRate: "6.4%",
    units: 84,
    coordinates: { lat: 36.1627, lng: -86.7816 },

    // Key metrics - Nashville market
    keyMetrics: {
      offerPrice: "$12.5M",
      capRate: "6.4%",
      units: "84",
      pricePerUnit: "$148,810",
      cocReturn: "9.8%",
      irr: "15.7%",
      emx: "2.1X",
    },

    // Property details - Nashville music district
    yearBuilt: 2016,
    occupancy: "95.2%",
    holdPeriod: "5 years",
    avgSqFtPerUnit: 1050,
    pricePerSqFt: "$141.72",

    // Property gallery images
    images: [
      { src: "/riverside-apartment-complex-building.jpg", label: "Building View" },
      { src: "/apartment-interior-living-space.jpg", label: "Inside Apartment" },
      { src: "/renovated-apartment-unit-modern.jpg", label: "Renovated Unit" },
      { src: "/original-apartment-unit-before-renovation.jpg", label: "Non-Renovated Unit" },
      { src: "/modern-apartment-bathroom.png", label: "Bathroom" },
      { src: "/apartment-complex-swimming-pool-amenity.jpg", label: "Amenity" },
      { src: "/apartment-building-parking-area.jpg", label: "Parking" },
    ],

    // Unit mix - Nashville market rents
    unitMix: [
      { type: "1BR", units: 34, percentage: 40, marketRent: 1750, postRenoRent: 1950 },
      { type: "2BR", units: 42, percentage: 50, marketRent: 2250, postRenoRent: 2500 },
      { type: "3BR", units: 8, percentage: 10, marketRent: 2850, postRenoRent: 3150 },
    ],

    // Whisper price
    whisperPrice: {
      cap: 780000,
      perUnit: 145238,
      total: 12200000,
    },

    // Pro Forma projections - Nashville steady growth
    proForma: [
      { year: "Year 1", noi: 800000 },
      { year: "Year 2", noi: 848000 },
      { year: "Year 3", noi: 898240 },
      { year: "Year 4", noi: 951134 },
      { year: "Year 5", noi: 1006702 },
    ],

    // Investment returns - Nashville value-add
    returns: {
      irr: "15.7%",
      cashOnCash: "9.8%",
      equityMultiple: "2.1X",
      holdPeriod: "5 years",
    },

    // Sources and uses
    sourcesUses: {
      sources: [
        { item: "Equity", amount: 3750000 },
        { item: "Debt", amount: 8750000 },
        { item: "Total Sources", amount: 12500000 },
      ],
      uses: [
        { item: "Purchase Price", amount: 12500000 },
        { item: "Closing Costs", amount: 250000 },
        { item: "Renovation Reserve", amount: 420000 },
        { item: "Lease-up Costs", amount: 125000 },
        { item: "Total Uses", amount: 13295000 },
      ],
    },

    // Financing terms - Nashville market
    debt: {
      loanAmount: 8750000,
      interestRate: 6.25,
      term: 30,
      ltv: 70,
      dscr: 1.32,
    },

    // Business plan - Nashville music city strategy
    businessPlan: [
      "Acquire 84-unit workforce housing property in Nashville's emerging Riverside district",
      "Target music industry professionals and healthcare workers with affordable luxury",
      "Execute comprehensive interior renovation program focusing on modern amenities",
      "Leverage Nashville's population growth and job creation for sustained rent increases",
      "Position for sale to regional multifamily operator after stabilization",
    ],

    // Chart data for Nashville market
    chartData: [
      { year: "Year 1", cashFlow: 245000, propertyValue: 12500000 },
      { year: "Year 2", cashFlow: 293000, propertyValue: 13250000 },
      { year: "Year 3", cashFlow: 343240, propertyValue: 14037500 },
      { year: "Year 4", cashFlow: 396134, propertyValue: 14879375 },
      { year: "Year 5", cashFlow: 451702, propertyValue: 15773344 },
    ],
  },
  {
    id: "metro-plaza-commercial",
    name: "Metro Plaza",
    address: "1455 Market Street, Denver, CO 80202",
    status: "Active",
    thumbnail: "/modern-commercial-office-building-downtown.jpg",
    offerPrice: "$24.8M",
    capRate: "7.1%",
    units: 45, // Office suites
    coordinates: { lat: 39.7392, lng: -104.9903 },

    // Key metrics - Denver commercial market
    keyMetrics: {
      offerPrice: "$24.8M",
      capRate: "7.1%",
      units: "45",
      pricePerUnit: "$551,111",
      cocReturn: "11.2%",
      irr: "16.8%",
      emx: "2.3X",
    },

    // Commercial property details - Denver CBD
    yearBuilt: 2018,
    occupancy: "89.7%",
    holdPeriod: "7 years",
    avgSqFtPerUnit: 2150, // Average square feet per office suite
    pricePerSqFt: "$256.28",

    // Commercial property gallery images
    images: [
      { src: "/property-overview.png", label: "Building View" },
      { src: "/commercial-office-building-lobby.jpg", label: "Lobby" },
      { src: "/modern-office-suite-interior.jpg", label: "Office Suite" },
      { src: "/commercial-retail-space-interior.jpg", label: "Retail Space" },
      { src: "/office-conference-room-modern.jpg", label: "Conference Room" },
      { src: "/office-building-rooftop-terrace.jpg", label: "Amenity" },
      { src: "/placeholder.svg?height=300&width=500", label: "Parking" },
    ],

    // Commercial unit mix - Denver office market
    unitMix: [
      { type: "Small Office", units: 22, percentage: 49, marketRent: 2850, postRenoRent: 3200 },
      { type: "Medium Office", units: 15, percentage: 33, marketRent: 5200, postRenoRent: 5800 },
      { type: "Large Office", units: 5, percentage: 11, marketRent: 8500, postRenoRent: 9500 },
      { type: "Ground Retail", units: 3, percentage: 7, marketRent: 4200, postRenoRent: 4800 },
    ],

    // Whisper price for Denver commercial
    whisperPrice: {
      cap: 1704000,
      perUnit: 538667,
      total: 24240000,
    },

    // Commercial Pro Forma - Denver market
    proForma: [
      { year: "Year 1", noi: 1761000 },
      { year: "Year 2", noi: 1849050 },
      { year: "Year 3", noi: 1941503 },
      { year: "Year 4", noi: 2038578 },
      { year: "Year 5", noi: 2140507 },
      { year: "Year 6", noi: 2247532 },
      { year: "Year 7", noi: 2359909 },
    ],

    // Commercial investment returns
    returns: {
      irr: "16.8%",
      cashOnCash: "11.2%",
      equityMultiple: "2.3X",
      holdPeriod: "7 years",
    },

    // Commercial sources and uses
    sourcesUses: {
      sources: [
        { item: "Equity", amount: 7440000 },
        { item: "Debt", amount: 17360000 },
        { item: "Total Sources", amount: 24800000 },
      ],
      uses: [
        { item: "Purchase Price", amount: 24800000 },
        { item: "Closing Costs", amount: 496000 },
        { item: "Tenant Improvements", amount: 1200000 },
        { item: "Leasing Commissions", amount: 450000 },
        { item: "Working Capital", amount: 300000 },
        { item: "Total Uses", amount: 27246000 },
      ],
    },

    // Commercial financing terms - Denver market
    debt: {
      loanAmount: 17360000,
      interestRate: 7.25,
      term: 25,
      ltv: 70,
      dscr: 1.21,
    },

    // Commercial business plan - Denver tech hub
    businessPlan: [
      "Acquire Class A mixed-use office building in Denver's central business district",
      "Target growing tech companies and professional services firms seeking modern workspace",
      "Implement comprehensive tenant improvement program to attract premium tenants",
      "Leverage Denver's business-friendly environment and population growth for rent escalation",
      "Focus on ESG improvements including energy efficiency and wellness certifications",
      "Execute strategic exit to institutional investor or REIT after value creation",
    ],

    // Commercial chart data - Denver office market
    chartData: [
      { year: "Year 1", cashFlow: 834000, propertyValue: 24800000 },
      { year: "Year 2", cashFlow: 922050, propertyValue: 26040000 },
      { year: "Year 3", cashFlow: 1014503, propertyValue: 27342000 },
      { year: "Year 4", cashFlow: 1111578, propertyValue: 28709100 },
      { year: "Year 5", cashFlow: 1213507, propertyValue: 30144555 },
      { year: "Year 6", cashFlow: 1320532, propertyValue: 31651783 },
      { year: "Year 7", cashFlow: 1432909, propertyValue: 33234372 },
    ],
  },
]

/**
 * Property Data Management Utilities
 *
 * These helper functions provide CRUD operations for property data management.
 * They operate on the PROPERTIES_DATA array and are used throughout the application
 * for property data manipulation and retrieval.
 */

/**
 * Retrieves a property by its unique identifier
 *
 * @param id - The unique property identifier to search for
 * @returns The property data object if found, undefined otherwise
 *
 * @example
 * \`\`\`typescript
 * const property = getPropertyById("downtown-heights-152");
 * if (property) {
 *   console.log(property.name); // "Downtown Heights"
 * }
 * \`\`\`
 */
export const getPropertyById = (id: string): PropertyData | undefined => {
  return PROPERTIES_DATA.find((property) => property.id === id)
}

/**
 * Adds a new property to the data store
 *
 * @param property - Complete property data object to add
 *
 * @example
 * \`\`\`typescript
 * const newProperty: PropertyData = {
 *   id: "new-property-123",
 *   name: "New Development",
 *   // ... other required fields
 * };
 * addProperty(newProperty);
 * \`\`\`
 */
export const addProperty = (property: PropertyData): void => {
  PROPERTIES_DATA.push(property)
}

/**
 * Updates an existing property with partial data
 *
 * @param id - The unique identifier of the property to update
 * @param updates - Partial property data containing fields to update
 *
 * @example
 * \`\`\`typescript
 * updateProperty("downtown-heights-152", {
 *   status: "Under Contract",
 *   offerPrice: "$16.8M"
 * });
 * \`\`\`
 */
export const updateProperty = (id: string, updates: Partial<PropertyData>): void => {
  const index = PROPERTIES_DATA.findIndex((property) => property.id === id)
  if (index !== -1) {
    PROPERTIES_DATA[index] = { ...PROPERTIES_DATA[index], ...updates }
  }
}

/**
 * Removes a property from the data store
 *
 * @param id - The unique identifier of the property to delete
 *
 * @example
 * \`\`\`typescript
 * deleteProperty("old-property-456");
 * \`\`\`
 */
export const deleteProperty = (id: string): void => {
  const index = PROPERTIES_DATA.findIndex((property) => property.id === id)
  if (index !== -1) {
    PROPERTIES_DATA.splice(index, 1)
  }
}

/**
 * Retrieves all properties from the data store
 *
 * @returns Array of all property data objects
 *
 * @example
 * \`\`\`typescript
 * const allProperties = getAllProperties();
 * console.log(`Total properties: ${allProperties.length}`);
 * \`\`\`
 */
export const getAllProperties = (): PropertyData[] => {
  return PROPERTIES_DATA
}
