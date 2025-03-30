import { ImportedTransaction, TransactionCategory, TransactionStatus, TransactionType } from '@/types/finance'

// מיפוי קטגוריות
const categoryMapping: Record<string, TransactionCategory> = {
  'דיור': 'דיור',
  'מזון': 'מזון',
  'תחבורה': 'תחבורה',
  'חשבונות': 'חשבונות',
  'בריאות': 'בריאות',
  'בידור': 'בידור',
  'קניות': 'קניות',
  'חינוך': 'חינוך',
  'חסכונות': 'חסכונות',
  'אחר': 'אחר'
}

// מיפוי סטטוס
const statusMapping: Record<string, TransactionStatus> = {
  'ממתין': 'ממתין',
  'הושלם': 'הושלם',
  'בוטל': 'בוטל'
}

// מיפוי סוג עסקה
const typeMapping: Record<string, TransactionType> = {
  'הכנסה': 'הכנסה',
  'הוצאה': 'הוצאה'
}

// המרת קטגוריה לערך תקין
export const normalizeCategory = (category: string | undefined): TransactionCategory => {
  if (!category) return 'אחר'
  
  const trimmedCategory = category.trim()
  const normalizedCategory = categoryMapping[trimmedCategory]
  
  if (!normalizedCategory) {
    console.log('Category not found in mapping:', category)
    return 'אחר'
  }
  
  return normalizedCategory
}

// המרת סטטוס לערך תקין
export const normalizeStatus = (status: string | undefined): TransactionStatus => {
  if (!status) return 'הושלם'
  
  const normalizedStatus = statusMapping[status]
  return normalizedStatus || 'הושלם'
}

// המרת סוג עסקה לערך תקין
export const normalizeType = (type: string | undefined, amount?: number): TransactionType => {
  // אם יש סכום, נקבע את סוג העסקה לפיו
  if (amount !== undefined) {
    return amount >= 0 ? 'הכנסה' : 'הוצאה'
  }

  if (!type) return 'הוצאה'
  
  const normalizedType = typeMapping[type]
  return normalizedType || 'הוצאה'
}

// בדיקת תקינות עסקה
export const validateTransaction = (transaction: Partial<ImportedTransaction>): transaction is ImportedTransaction => {
  const isValid = (
    typeof transaction.description === 'string' &&
    transaction.description.length > 0 &&
    typeof transaction.amount === 'number' &&
    transaction.amount > 0 &&
    typeof transaction.date === 'string' &&
    transaction.date.length > 0
  )

  if (!isValid) {
    console.warn('Invalid transaction:', transaction)
  }

  return isValid
} 