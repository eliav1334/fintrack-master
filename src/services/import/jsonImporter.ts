import { ImportedTransaction } from '@/types/finance'
import { normalizeCategory, normalizeStatus, normalizeType, validateTransaction } from './importUtils'

export const processJsonFile = (jsonString: string): ImportedTransaction[] => {
  console.log('Starting JSON file processing')
  
  try {
    const data = JSON.parse(jsonString)
    console.log('Parsed JSON data:', data)

    // בדיקה אם הנתונים הם מערך
    if (!Array.isArray(data)) {
      console.warn('JSON data is not an array')
      return []
    }

    // המרה וסינון של העסקאות
    const transactions = data
      .filter(validateTransaction)
      .map(item => ({
        ...item,
        category: normalizeCategory(item.category),
        status: normalizeStatus(item.status),
        type: normalizeType(item.type)
      }))

    console.log('Processed transactions:', transactions)
    return transactions
  } catch (error) {
    console.error('Error processing JSON file:', error)
    return []
  }
} 