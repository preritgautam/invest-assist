import { GoogleGenerativeAI } from '@google/generative-ai'
import { ClassificationResult } from '@/lib/supabase/database.types'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Classification prompt for Gemini Vision
const PDF_CLASSIFICATION_PROMPT = `You are a document classification expert for commercial real estate documents. Analyze this document and classify it into one of these categories:

1. **rent_roll** - A detailed list of tenants, their unit numbers, lease terms, rent amounts, and occupancy status
2. **operating_statement** - Financial statement showing property income, expenses, and net operating income (NOI)
3. **offering_memorandum** - Marketing document for property sale containing property details, financials, and market analysis. This may contain embedded rent rolls and operating statements.
4. **appraisal** - Professional property valuation report
5. **insurance** - Insurance policy documents or certificates
6. **lease_abstract** - Summary of lease terms and conditions
7. **other** - Documents that don't fit the above categories

For your analysis:
1. Identify the primary document type
2. If this is an Offering Memorandum (OM), look for pages that contain:
   - Rent Roll data (tenant lists, unit details, rent amounts)
   - Operating Statement data (income/expense breakdown, NOI)
3. Provide page ranges for any embedded documents found within an OM

Respond in this exact JSON format:
{
  "document_type": "rent_roll" | "operating_statement" | "offering_memorandum" | "appraisal" | "insurance" | "lease_abstract" | "other",
  "confidence": 0.0-1.0,
  "total_pages": number,
  "embedded_documents": [
    {
      "type": "rent_roll" | "operating_statement",
      "page_range": "start-end" (e.g., "15-18")
    }
  ]
}

Important:
- Only include embedded_documents array if the main document is an offering_memorandum and embedded docs are found
- Page ranges should be accurate based on actual content
- Confidence should reflect how certain you are about the classification`

const EXCEL_CLASSIFICATION_PROMPT = `You are a document classification expert for commercial real estate Excel files. Analyze this spreadsheet and classify each sheet.

For commercial real estate, sheets typically contain:
1. **rent_roll** - Tenant lists with unit numbers, lease terms, rent amounts, occupancy
2. **operating_statement** - Income/expense breakdown, NOI calculations
3. **other** - Supporting data, calculations, or unrelated content

Analyze ALL sheets visible and classify each one.

Respond in this exact JSON format:
{
  "document_type": "rent_roll" | "operating_statement" | "other",
  "confidence": 0.0-1.0,
  "excel_sheets": [
    {
      "name": "Sheet Name",
      "index": 0,
      "type": "rent_roll" | "operating_statement" | "other"
    }
  ]
}

Important:
- The main document_type should be the most significant type found
- Include ALL sheets in the excel_sheets array
- Index starts at 0`

export async function classifyDocument(
  fileData: ArrayBuffer,
  filename: string,
  mimeType: string
): Promise<ClassificationResult> {
  const base64Data = Buffer.from(fileData).toString('base64')

  const isExcel = filename.toLowerCase().endsWith('.xlsx') || filename.toLowerCase().endsWith('.xls')
  const prompt = isExcel ? EXCEL_CLASSIFICATION_PROMPT : PDF_CLASSIFICATION_PROMPT

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
    { text: prompt },
  ])

  const response = result.response
  const text = response.text()

  // Extract JSON from response (it might be wrapped in markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No JSON found in classification response')
  }

  return JSON.parse(jsonMatch[0]) as ClassificationResult
}

export function getMimeType(filename: string): string {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.pdf')) return 'application/pdf'
  if (lower.endsWith('.xlsx')) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  if (lower.endsWith('.xls')) return 'application/vnd.ms-excel'
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  if (lower.endsWith('.gif')) return 'image/gif'
  if (lower.endsWith('.webp')) return 'image/webp'
  return 'application/octet-stream'
}
