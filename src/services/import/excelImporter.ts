import * as XLSX from 'xlsx'
import { ImportedTransaction } from '@/types/finance'
import { normalizeCategory, normalizeStatus, normalizeType } from './importUtils'

export const processExcelFile = (arrayBuffer: ArrayBuffer): ImportedTransaction[] => {
  try {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // קריאת הנתונים כמערך של אובייקטים
    const rawData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      blankrows: false,
      defval: ''
    })

    console.log('Raw data from Excel:', rawData.slice(0, 3))

    // מיפוי שמות העמודות האפשריים
    const columnMappings = {
      date: ['תאריך', 'תאריך עסקה', 'תאריך חיוב', 'מועד חיוב', 'תאריך עסקה/שם בית עסק'],
      description: ['תיאור', 'שם בית עסק', 'פירוט', 'תיאור עסקה'],
      amount: ['סכום', 'סכום חיוב', 'סכום עסקה', 'חיוב'],
      category: ['קטגוריה', 'סיווג', 'סוג'],
      type: ['סוג חיוב', 'סוג עסקה', 'סוג תנועה'],
      status: ['סטטוס', 'מצב']
    }

    // פונקציה למציאת ערך בשדה לפי מיפוי
    const findFieldValue = (row: any, mappings: string[]): string => {
      for (const field of mappings) {
        if (row[field] !== undefined && row[field] !== '') {
          return row[field].toString().trim()
        }
      }
      return ''
    }

    const transactions: ImportedTransaction[] = rawData
      .map((row: any): ImportedTransaction | null => {
        console.log('Processing row:', row)

        const date = findFieldValue(row, columnMappings.date)
        const amount = findFieldValue(row, columnMappings.amount)
        
        if (!date || !amount) {
          console.log('Skipping row - missing required fields:', { date, amount })
          return null
        }

        // ניקוי והמרת הסכום למספר
        const cleanAmount = amount.replace(/[^\d.-]/g, '')
        const numericAmount = parseFloat(cleanAmount)

        if (isNaN(numericAmount)) {
          console.log('Skipping row - invalid amount:', amount)
          return null
        }

        const description = findFieldValue(row, columnMappings.description)
        const category = findFieldValue(row, columnMappings.category)
        const type = findFieldValue(row, columnMappings.type)
        const status = findFieldValue(row, columnMappings.status)

        const transaction: ImportedTransaction = {
          date: new Date(date).toISOString(),
          description: description || 'ללא תיאור',
          amount: numericAmount,
          category: normalizeCategory(category),
          type: normalizeType(type, numericAmount),
          status: normalizeStatus(status)
        }

        console.log('Created transaction:', transaction)
        return transaction
      })
      .filter((t): t is ImportedTransaction => t !== null)

    console.log(`Successfully processed ${transactions.length} transactions`)
    return transactions
  } catch (error: any) {
    console.error('Error processing Excel file:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    throw new Error(`שגיאה בעיבוד קובץ האקסל: ${error.message}`)
  }
} 