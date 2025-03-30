import * as XLSX from 'xlsx'
import { ImportedTransaction } from '@/types/finance'
import { normalizeCategory, normalizeStatus, normalizeType } from './importUtils'

// הגדרת טיפוס לשורה מקובץ ישראכרט
interface IsracardRow {
  'תאריך עסקה': string
  'שם בית עסק': string
  'סכום חיוב': string
  'סכום עסקה': string
  'פירוט נוסף'?: string
  [key: string]: string | undefined
}

// המרת תאריך ישראלי לפורמט ISO
const parseHebrewDate = (dateStr: string): string => {
  try {
    // ניקוי התאריך מתווים מיותרים
    dateStr = dateStr.toString().trim()
    
    // בדיקה אם התאריך ריק
    if (!dateStr) {
      throw new Error('תאריך ריק')
    }

    // הסרת תווים מיותרים
    dateStr = dateStr.replace(/[^\d/.-]/g, '')
    
    let day: number, month: number, year: number

    // טיפול בפורמט עם מקף (DD-MM-YYYY או DD-MM-YY)
    if (dateStr.includes('-')) {
      [day, month, year] = dateStr.split('-').map(Number)
    }
    // טיפול בפורמט עם נקודה (DD.MM.YY)
    else if (dateStr.includes('.')) {
      [day, month, year] = dateStr.split('.').map(Number)
    }
    // טיפול בפורמט עם קו נטוי (DD/MM/YYYY)
    else if (dateStr.includes('/')) {
      [day, month, year] = dateStr.split('/').map(Number)
    }
    else {
      throw new Error(`פורמט תאריך לא מוכר: ${dateStr}`)
    }

    // טיפול בשנה דו-ספרתית
    if (year < 100) {
      year += 2000
    }

    // בדיקת תקינות התאריך
    if (isNaN(day) || isNaN(month) || isNaN(year) ||
        day < 1 || day > 31 || month < 1 || month > 12) {
      throw new Error(`תאריך לא תקין: ${dateStr} (${day}/${month}/${year})`)
    }

    // יצירת אובייקט תאריך
    const date = new Date(year, month - 1, day)
    
    // בדיקה שהתאריך תקין
    if (isNaN(date.getTime())) {
      throw new Error(`לא ניתן ליצור תאריך תקין: ${dateStr}`)
    }

    return date.toISOString()
  } catch (error) {
    console.error('שגיאה בפירוק התאריך:', dateStr, error)
    throw error
  }
}

// המרת סכום ישראלי למספר
const parseHebrewAmount = (amountStr: string): number => {
  try {
    if (!amountStr) {
      throw new Error('סכום ריק')
    }

    amountStr = amountStr.toString().trim()
    
    // טיפול במקרה של מינוס בסוף המספר (נפוץ בישראכרט)
    const isNegative = amountStr.endsWith('-')
    
    // ניקוי הסכום מתווים מיותרים
    amountStr = amountStr.replace(/[^\d,.-]/g, '')
    
    // החלפת פסיק בנקודה
    amountStr = amountStr.replace(/,/g, '.')
    
    // הסרת סימן מינוס מהסוף אם קיים
    amountStr = amountStr.replace(/-$/, '')
    
    // טיפול במקרה של מספר עם יותר מנקודה אחת
    const parts = amountStr.split('.')
    if (parts.length > 2) {
      amountStr = parts[0] + '.' + parts.slice(1).join('')
    }
    
    // המרה למספר
    let amount = parseFloat(amountStr)
    
    if (isNaN(amount)) {
      throw new Error(`סכום לא תקין: ${amountStr}`)
    }
    
    // הפיכת הסכום לשלילי אם היה סימן מינוס בסוף
    if (isNegative) {
      amount = -amount
    }
    
    return amount
  } catch (error) {
    console.error('שגיאה בפירוק הסכום:', amountStr, error)
    throw error
  }
}

// זיהוי האם הקובץ הוא מישראכרט
const isIsracardFile = (data: unknown[]): boolean => {
  if (data.length === 0) return false
  
  const firstRow = data[0] as Record<string, unknown>
  const headers = Object.keys(firstRow)
  
  // בדיקת שמות העמודות האופייניים לישראכרט
  const isracardHeaders = [
    'תאריך עסקה',
    'שם בית עסק',
    'סכום חיוב',
    'סכום עסקה',
    'פירוט נוסף'
  ]
  
  return isracardHeaders.some(header => headers.includes(header))
}

export const processExcelFile = (arrayBuffer: ArrayBuffer): ImportedTransaction[] => {
  try {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // קריאת הנתונים בצורה גולמית
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1')
    console.log('Sheet range:', range)

    // קריאת שורת הכותרות
    const headers: string[] = []
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col })
      const cell = worksheet[cellAddress]
      if (cell && cell.v) {
        headers[col] = String(cell.v).trim()
      }
    }

    console.log('Raw headers:', headers)

    // סינון וניקוי הכותרות
    const cleanHeaders = headers.filter(header => header && !header.startsWith('_EMPTY_'))
    console.log('Clean headers:', cleanHeaders)

    // קריאת הנתונים
    const data: Record<string, string>[] = []
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const rowData: Record<string, string> = {}
      let hasData = false

      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
        const cell = worksheet[cellAddress]
        const header = headers[col]

        if (header && cell && cell.v !== undefined && cell.v !== '') {
          rowData[header] = String(cell.v).trim()
          hasData = true
        }
      }

      if (hasData) {
        data.push(rowData)
      }
    }

    console.log('First 3 rows:', data.slice(0, 3))

    // בדיקה האם זה קובץ ישראכרט
    const isIsracard = cleanHeaders.some(header => 
      ['תאריך עסקה', 'שם בית עסק', 'סכום חיוב'].includes(header)
    )
    
    console.log('Is Isracard file:', isIsracard)
    console.log('Available columns:', cleanHeaders)

    // מיפוי שמות העמודות
    const columnMappings = {
      date: ['תאריך חיוב', 'תאריך עסקה', 'תאריך'],
      businessName: ['שם בית עסק'],
      amount: ['סכום חיוב', 'סכום עסקה', 'סכום העסקה', 'סכום'],
      category: ['קטגוריה'],
      transactionType: ['סוג עסקה'],
      status: ['סטטוס']
    }

    // פונקציה למציאת ערך בשדה לפי מיפוי
    const findFieldValue = (row: Record<string, string>, mappings: string[]): string => {
      // חיפוש ערך לפי סדר העדיפות במיפוי
      for (const field of mappings) {
        const value = row[field]
        if (value !== undefined && value !== '') {
          return value.toString().trim()
        }
      }
      return ''
    }

    // פונקציה למציאת תאריך עם עדיפות לתאריך חיוב
    const findDateValue = (row: Record<string, string>): string => {
      // קודם מחפשים תאריך חיוב
      const chargeDate = row['תאריך חיוב']
      if (chargeDate !== undefined && chargeDate !== '') {
        console.log('Found charge date:', chargeDate)
        return chargeDate.toString().trim()
      }
      
      // אם אין תאריך חיוב, מחפשים תאריך עסקה
      const transactionDate = row['תאריך עסקה']
      if (transactionDate !== undefined && transactionDate !== '') {
        console.log('No charge date found, using transaction date:', transactionDate)
        return transactionDate.toString().trim()
      }
      
      // אם אין אף אחד מהם, מחפשים שדה תאריך כללי
      const generalDate = row['תאריך']
      if (generalDate !== undefined && generalDate !== '') {
        console.log('No specific date found, using general date:', generalDate)
        return generalDate.toString().trim()
      }
      
      console.log('No date found in row')
      return ''
    }

    const transactions: ImportedTransaction[] = []
    
    for (const row of data) {
      try {
        console.log('\nProcessing row:', row)

        // חיפוש תאריך עם עדיפות לתאריך חיוב
        const date = findDateValue(row)
        if (!date) {
          console.log('Missing date, available fields:', Object.keys(row))
          continue
        }

        // חיפוש סכום
        const amount = findFieldValue(row, columnMappings.amount)
        if (!amount) {
          console.log('Missing amount, available fields:', Object.keys(row))
          continue
        }

        console.log('Found date and amount:', { date, amount })

        // ניסיון לפרסר את התאריך והסכום
        let parsedDate: string
        let parsedAmount: number
        
        try {
          parsedDate = parseHebrewDate(date)
          console.log('Parsed date:', parsedDate)
        } catch (error) {
          console.log(`שגיאה בפירוק התאריך: ${date}`, error)
          continue
        }
        
        try {
          parsedAmount = parseHebrewAmount(amount)
          console.log('Parsed amount:', parsedAmount)
        } catch (error) {
          console.log(`שגיאה בפירוק הסכום: ${amount}`, error)
          continue
        }

        // שילוב של שם בית העסק ופירוט נוסף בתיאור
        let description = ''
        if (isIsracard) {
          const businessName = row['שם בית עסק']?.trim() || ''
          const additionalDetails = row['פירוט נוסף']?.trim() || ''
          const transactionType = row['סוג עסקה']?.trim() || ''
          
          // יצירת תיאור מפורט
          const descriptionParts = [
            businessName,
            additionalDetails,
            transactionType
          ].filter(part => part && part !== '')
          
          description = descriptionParts.join(' - ')
          
          // אם אין תיאור בכלל, ננסה למצוא מידע נוסף
          if (!description) {
            // חיפוש בכל השדות שעשויים להכיל מידע על העסקה
            const possibleDescriptionFields = [
              'תיאור עסקה',
              'פרטי עסקה',
              'הערות',
              'מהות העסקה'
            ]
            
            for (const field of possibleDescriptionFields) {
              const value = row[field]?.trim()
              if (value) {
                description = value
                break
              }
            }
          }
        } else {
          description = findFieldValue(row, columnMappings.businessName)
        }

        // אם עדיין אין תיאור, נוסיף תיאור ברירת מחדל עם הסכום
        if (!description) {
          description = `עסקה בסכום ${amount}`
        }

        const category = findFieldValue(row, columnMappings.category)
        const type = findFieldValue(row, columnMappings.transactionType)
        const status = findFieldValue(row, columnMappings.status)

        const transaction: ImportedTransaction = {
          date: parsedDate,
          description: description || 'ללא תיאור',
          amount: Math.abs(parsedAmount), // תמיד נשמור את הסכום כחיובי
          category: normalizeCategory(row['קטגוריה'] || 'other'),
          type: isIsracard ? (parsedAmount < 0 ? 'income' : 'expense') : normalizeType(type, parsedAmount),
          status: normalizeStatus(status),
          businessName: row['שם בית עסק']?.trim() || row['תיאור עסקה']?.trim() || 'לא צוין',
          transactionType: row['סוג עסקה']?.trim() || ''
        }

        console.log('Created transaction:', transaction)
        transactions.push(transaction)
      } catch (error) {
        console.error('Error processing row:', row, error)
        continue
      }
    }

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