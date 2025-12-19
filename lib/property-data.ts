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
   * Comprehensive Pro Forma financial data
   * Populated from backend API extraction of T-12/Operating Statements
   * All values stored in database for analysis and reporting
   */
  proFormaData?: {
    /** Income line items extracted from operating statements */
    income: {
      rentalIncome: ProFormaLineItem[]
      otherIncome: ProFormaLineItem[]
      recoveries: ProFormaLineItem[]
    }
    /** Operating expense line items */
    expenses: {
      controllable: ProFormaLineItem[]
      nonControllable: ProFormaLineItem[]
    }
    /** Capital expenses and reserves */
    capital: {
      items: ProFormaLineItem[]
    }
    /** Debt service information */
    debtService: {
      items: ProFormaLineItem[]
    }
    /** Calculated subtotals and totals */
    calculated: {
      netRentalIncome: number
      totalOtherIncome: number
      effectiveGrossIncome: number
      totalOperatingExpenses: number
      netOperatingIncome: number
      totalCapitalExpenses: number
      totalDebtService: number
      netCashFlow: number
    }
    /** Last updated timestamp */
    lastUpdated?: string
    /** Data source (e.g., "T-12", "T-3", "Operating Statement") */
    dataSource?: string
  }

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
 * Monthly data breakdown structure
 * Used for detailed monthly analysis in Pro Forma
 */
export interface MonthlyData {
  jan: number
  feb: number
  mar: number
  apr: number
  may: number
  jun: number
  jul: number
  aug: number
  sep: number
  oct: number
  nov: number
  dec: number
}

/**
 * Pro Forma line item structure
 * Represents a single line item in the Pro Forma analysis
 * Designed for database storage and API population
 */
export interface ProFormaLineItem {
  /** Unique identifier for the line item */
  id: string
  /** Display label for the line item */
  label: string
  /** Category classification (e.g., "RENTAL_INCOME", "UTILITIES") */
  category: string
  /** T-12 actual trailing 12-month data */
  t12Actual: number
  /** Underwritten/adjusted projection */
  underwritten: number
  /** Year 1 forward projection */
  year1: number
  /** Percentage of Effective Gross Income */
  percentOfEGI: number
  /** Variance percentage (year over year or vs budget) */
  variance: number
  /** Notes and assumptions for this line item */
  notes: string
  /** Monthly breakdown data (optional, for detailed analysis) */
  monthlyData?: MonthlyData
  /** Whether this is a subtotal row */
  isSubtotal?: boolean
  /** Whether this row should be bold */
  isBold?: boolean
  /** Whether this field is user-editable */
  isEditable?: boolean
  /** Order/sequence for display */
  displayOrder?: number
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
