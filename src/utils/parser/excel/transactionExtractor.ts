
import { Transaction, FileImportFormat } from "@/types";
import { formatExcelDate } from './dateUtils';
import { detectInstallmentDetails } from './installmentUtils';
import { extractColumnIndices, extractRowValues } from './columnExtractor';
import { determineTransactionType } from './transactionTypeHandler';
import { parseAmount, parseTotalAmount } from './amountParser';
import { generateTransactionNotes, formatOriginalTransactionDate } from './notesGenerator';

/**
 * מיצוי עסקאות מנתוני גליון אקסל
 */
export const extractTransactionsFromSheet = (
  headers: any[],
  jsonData: any[][],
  format: FileImportFormat,
  cardFilter?: string[],
  sheetName?: string
): Omit<Transaction, "id">[] => {
  // קבלת אינדקסים של עמודות
  const indices = extractColumnIndices(headers, format, sheetName);
  
  // ניתוח שורות
  const transactions: Omit<Transaction, "id">[] = [];
  const processedIds = new Set<string>(); // סט למעקב אחר עסקאות שכבר עובדו
  
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || !Array.isArray(row) || row.length < Math.max(indices.dateIndex, indices.amountIndex, indices.descriptionIndex) + 1) {
      continue;  // דילוג על שורות חסרות או קצרות מדי
    }
    
    // בדיקה אם השורה ריקה - דילוג על שורות סיכום בסוף דוח כרטיס אשראי
    if (row.every(cell => cell === null || cell === undefined || cell === "")) {
      continue;
    }
    
    // חילוץ ערכים מהשורה
    const values = extractRowValues(row, indices);
    
    // דילוג על שורות שאינן מכילות נתוני עסקאות חיוניים
    if (!values.dateValue && !values.amountValue && !values.descriptionValue) {
      continue;
    }

    // סינון לפי מספר כרטיס אשראי
    if (cardFilter?.length && indices.cardNumberIndex !== -1 && values.cardNumberValue) {
      // המרה למחרוזת במקרה שמדובר במספר או ערך אחר
      const cardNumberStr = String(values.cardNumberValue);
      
      // בדיקה אם מספר הכרטיס מוכל בפילטר שהוגדר
      if (!cardFilter.some(filter => cardNumberStr.includes(filter))) {
        // אם מספר הכרטיס לא נמצא ברשימת הפילטר, נדלג על השורה הזו
        continue;
      }
    }
    
    // טיפול בתאריך - עדיפות לתאריך העסקה אם קיים
    const dateStr = formatExcelDate(values.dateValue, format);
    
    // מיפוי תאריך העסקה המקורי
    const originalTransactionDateStr = values.transactionDateValue ? 
      formatExcelDate(values.transactionDateValue, format) : "";
    
    // פרסור סכומים
    const amount = parseAmount(values.amountValue);
    const totalAmount = parseTotalAmount(values.totalAmountValue);
    
    // זיהוי תשלומים
    const description = String(values.descriptionValue || '');
    const installmentDetails = detectInstallmentDetails(
      description, 
      amount,
      totalAmount,
      values.installmentNumberValue,
      values.totalInstallmentsValue,
      dateStr,
      originalTransactionDateStr,
      format
    );
    
    // קביעת סוג העסקה (הכנסה/הוצאה)
    const typeValue = indices.typeIndex >= 0 ? row[indices.typeIndex] : undefined;
    const isCreditCardFormat = format.name === "כרטיס אשראי ישראלי" || 
                              format.name.includes("אשראי") || 
                              format.creditCardFormat === true;
    
    const { type, amount: finalAmount } = determineTransactionType(amount, format, typeValue, indices);
    
    // קיצור תיאורים ארוכים מדי
    const truncatedDescription = description.length > 100 
      ? description.substring(0, 97) + '...' 
      : description;

    // יצירת הערות לעסקה
    const formattedOriginalDate = indices.transactionDateIndex !== -1 && values.transactionDateValue && 
                                 values.dateValue !== values.transactionDateValue ? 
                                 formatOriginalTransactionDate(values.transactionDateValue) : "";
    
    const notes = generateTransactionNotes(
      isCreditCardFormat,
      sheetName,
      formattedOriginalDate,
      installmentDetails
    );

    // יצירת מזהה ייחודי לבדיקת כפילויות
    const uniqueId = `${dateStr}_${finalAmount}_${truncatedDescription}`;
    if (processedIds.has(uniqueId)) {
      // אם כבר ראינו עסקה זהה, נדלג עליה
      continue;
    }
    processedIds.add(uniqueId);

    // יצירת העסקה
    const transaction: Omit<Transaction, "id"> = {
      date: dateStr,
      amount: finalAmount,
      description: truncatedDescription,
      type,
      categoryId: indices.categoryIndex >= 0 ? String(row[indices.categoryIndex] || '') : "",
      notes
    };

    // הוספת מספר כרטיס לעסקה אם קיים
    if (indices.cardNumberIndex !== -1 && values.cardNumberValue) {
      transaction.cardNumber = String(values.cardNumberValue);
    }
    
    // הוספת פרטי תשלומים אם קיימים
    if (installmentDetails) {
      transaction.isInstallment = true;
      transaction.installmentDetails = installmentDetails;
    }
    
    // הוספת מידע נוסף אם קיים
    if (indices.transactionCodeIndex !== -1 && values.transactionCodeValue) {
      transaction.transactionCode = String(values.transactionCodeValue);
    }
    
    if (indices.businessCategoryIndex !== -1 && values.businessCategoryValue) {
      transaction.businessCategory = String(values.businessCategoryValue);
    }
    
    if (indices.businessIdentifierIndex !== -1 && values.businessIdentifierValue) {
      transaction.businessIdentifier = String(values.businessIdentifierValue);
    }
    
    if (totalAmount > 0 && totalAmount !== finalAmount) {
      transaction.originalAmount = totalAmount;
    }

    transactions.push(transaction);
  }
  
  return transactions;
};
