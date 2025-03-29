import { ImportedTransaction, TransactionCategory, TransactionStatus, TransactionType } from '@/types/finance'

// מיפוי קטגוריות מעברית לאנגלית
const categoryMapping: Record<string, TransactionCategory> = {
  'דיור': 'housing',
  'מזון': 'food',
  'תחבורה': 'transportation',
  'חשבונות': 'utilities',
  'בריאות': 'healthcare',
  'בידור': 'entertainment',
  'קניות': 'shopping',
  'חינוך': 'education',
  'חסכונות': 'savings',
  'אחר': 'other',
  // גם באנגלית
  'housing': 'housing',
  'food': 'food',
  'transportation': 'transportation',
  'utilities': 'utilities',
  'healthcare': 'healthcare',
  'entertainment': 'entertainment',
  'shopping': 'shopping',
  'education': 'education',
  'savings': 'savings',
  'other': 'other'
}

// מיפוי סטטוס מעברית לאנגלית
const statusMapping: Record<string, TransactionStatus> = {
  'ממתין': 'pending',
  'הושלם': 'completed',
  'בוטל': 'cancelled',
  // גם באנגלית
  'pending': 'pending',
  'completed': 'completed',
  'cancelled': 'cancelled'
}

// מיפוי סוג עסקה מעברית לאנגלית
const typeMapping: Record<string, TransactionType> = {
  'הכנסה': 'income',
  'הוצאה': 'expense',
  // גם באנגלית
  'income': 'income',
  'expense': 'expense'
}

// המרת קטגוריה לערך תקין
export const normalizeCategory = (category: string | undefined): TransactionCategory => {
  if (!category) return 'other'
  
  const normalizedCategory = categoryMapping[category.toLowerCase()]
  return normalizedCategory || 'other'
}

// המרת סטטוס לערך תקין
export const normalizeStatus = (status: string | undefined): TransactionStatus => {
  if (!status) return 'completed'
  
  const normalizedStatus = statusMapping[status.toLowerCase()]
  return normalizedStatus || 'completed'
}

// המרת סוג עסקה לערך תקין
export const normalizeType = (type: string | undefined, amount?: number): TransactionType => {
  // אם יש סכום, נקבע את סוג העסקה לפיו
  if (amount !== undefined) {
    return amount >= 0 ? 'income' : 'expense'
  }

  if (!type) return 'expense'
  
  const normalizedType = typeMapping[type.toLowerCase()]
  return normalizedType || 'expense'
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