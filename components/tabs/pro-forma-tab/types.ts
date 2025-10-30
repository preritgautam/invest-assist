export interface MonthlyData {
  month: string
  value: number
}

export interface LineItemData {
  id: string
  label: string
  category: string
  inPlace: number
  yourUnderwriting: number
  inputMode: InputMode
  inputType: InputType
  percentBase?: "EGI" | "PGI" | "NOI"
  isEditable: boolean
  isSubtotal?: boolean
  formula?: string
  growthRate?: number
  monthlyData?: MonthlyData[]
  documentTotal?: number
}

export interface CategoryData {
  id: string
  title: string
  items: LineItemData[]
  expanded: boolean
  color: string
}

export type InputMode = "total" | "perUnit"
export type InputType = "dollar" | "percent"
