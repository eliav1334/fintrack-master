
import { Transaction, FileImportFormat } from "@/types";
import { findColumnIndices } from './headerDetection';
import { formatExcelDate } from './dateUtils';
import { detectInstallmentDetails } from './installmentUtils';

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
  const indices = findColumnIndices(headers, format);
  
  // בדיקת עמודות חובה
  if (indices.dateIndex === -1 || indices.amountIndex === -1 || indices.descriptionIndex === -1) {
    console.error("Missing required columns in sheet", sheetName, ". Headers:", headers);
    const foundCols = [];
    if (indices.dateIndex !== -1) foundCols.push("תאריך");
    if (indices.amountIndex !== -1) foundCols.push("סכום");
    if (indices.descriptionIndex !== -1) foundCols.push("תיאור");
    
    throw new Error(`לא זוהו כל העמודות הנדרשות בגליון ${sheetName}. נמצאו: ${foundCols.join(", ")}`);
  }
  
  // ניתוח שורות
  const transactions: Omit<Transaction, "id">[] = [];
  
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
    let dateValue = row[indices.dateIndex];
    let amountValue = row[indices.amountIndex];
    let descriptionValue = row[indices.descriptionIndex];
    let cardNumberValue = indices.cardNumberIndex !== -1 ? row[indices.cardNumberIndex] : null;
    let transactionDateValue = indices.transactionDateIndex !== -1 ? row[indices.transactionDateIndex] : null;
    
    // שדות תשלומים
    let totalAmountValue = indices.totalAmountIndex !== -1 ? row[indices.totalAmountIndex] : null;
    let installmentNumberValue = indices.installmentNumberIndex !== -1 ? row[indices.installmentNumberIndex] : null;
    let totalInstallmentsValue = indices.totalInstallmentsIndex !== -1 ? row[indices.totalInstallmentsIndex] : null;
    
    // שדות נוספים
    let businessCategoryValue = indices.businessCategoryIndex !== -1 ? row[indices.businessCategoryIndex] : null;
    let businessIdentifierValue = indices.businessIdentifierIndex !== -1 ? row[indices.businessIdentifierIndex] : null;
    let transactionCodeValue = indices.transactionCodeIndex !== -1 ? row[indices.transactionCodeIndex] : null;
    
    // דילוג על שורות שאינן מכילות נתוני עסקאות חיוניים
    if (!dateValue && !amountValue && !descriptionValue) {
      continue;
    }

    // סינון לפי מספר כרטיס אשראי
    if (cardFilter?.length && indices.cardNumberIndex !== -1 && cardNumberValue) {
      // המרה למחרוזת במקרה שמדובר במספר או ערך אחר
      const cardNumberStr = String(cardNumberValue);
      
      // בדיקה אם מספר הכרטיס מוכל בפילטר שהוגדר
      if (!cardFilter.some(filter => cardNumberStr.includes(filter))) {
        // אם מספר הכרטיס לא נמצא ברשימת הפילטר, נדלג על השורה הזו
        continue;
      }
    }
    
    // טיפול בתאריך - עדיפות לתאריך העסקה אם קיים
    const dateStr = formatExcelDate(dateValue, format);
    
    // מיפוי תאריך העסקה המקורי
    const originalTransactionDateStr = transactionDateValue ? 
      formatExcelDate(transactionDateValue, format) : "";
    
    // טיפול בסכום
    let amount: number;
    
    if (typeof amountValue === 'number') {
      amount = amountValue;
    } else {
      // ניקוי הסכום מתווים מיוחדים
      const amountStr = String(amountValue || '0').replace(/[^\d.-]/g, '');
      amount = parseFloat(amountStr) || 0;
    }
    
    // טיפול בסכום המקורי של העסקה (לפני תשלומים)
    let totalAmount: number = 0;
    if (totalAmountValue) {
      if (typeof totalAmountValue === 'number') {
        totalAmount = totalAmountValue;
      } else {
        const totalAmountStr = String(totalAmountValue || '0').replace(/[^\d.-]/g, '');
        totalAmount = parseFloat(totalAmountStr) || 0;
      }
    }
    
    // זיהוי תשלומים
    const description = String(descriptionValue || '');
    const installmentDetails = detectInstallmentDetails(
      description, 
      amount,
      totalAmount,
      installmentNumberValue,
      totalInstallmentsValue,
      dateStr,
      originalTransactionDateStr,
      format
    );
    
    // קביעת סוג העסקה (הכנסה/הוצאה)
    let type: "income" | "expense" = "expense";
    
    if (format.name === "כרטיס אשראי ישראלי" || format.name.includes("אשראי")) {
      // אם סכום שלילי בכרטיס אשראי, זה עשוי להיות החזר/זיכוי
      if (amount < 0) {
        type = "income";
        amount = Math.abs(amount);
      }
    } else if (indices.typeIndex >= 0 && format.typeIdentifier) {
      // שימוש במזהה הסוג אם הוגדר בפורמט
      const typeValue = String(row[indices.typeIndex] || '').toLowerCase();
      if (format.typeIdentifier.incomeValues.some(v => typeValue.includes(v.toLowerCase()))) {
        type = "income";
        amount = Math.abs(amount);
      } else if (format.typeIdentifier.expenseValues.some(v => typeValue.includes(v.toLowerCase()))) {
        type = "expense";
        amount = Math.abs(amount);
      } else {
        // התנהגות ברירת מחדל: חיובי = הכנסה, שלילי = הוצאה
        type = amount >= 0 ? "income" : "expense";
        amount = Math.abs(amount);
      }
    } else {
      // התנהגות ברירת מחדל על בסיס סימן הסכום
      type = amount >= 0 ? "income" : "expense";
      amount = Math.abs(amount);
    }
    
    // קיצור תיאורים ארוכים מדי
    const truncatedDescription = description.length > 100 
      ? description.substring(0, 97) + '...' 
      : description;

    // יצירת הערות לעסקה
    let notes = "";
    
    if (format.name === "כרטיס אשראי ישראלי" || format.name.includes("אשראי")) {
      notes = "יובא מכרטיס אשראי";
    } else {
      notes = `יובא מקובץ אקסל - גליון: ${sheetName || "ראשי"}`;
    }
    
    // הוספת מידע לגבי תאריך העסקה להערות
    if (indices.transactionDateIndex !== -1 && transactionDateValue && dateValue !== transactionDateValue) {
      let formattedTransactionDate = "";
      
      if (typeof transactionDateValue === 'string') {
        // ניסיון לפרסר את תאריך העסקה
        const dateMatch = transactionDateValue.match(/(\d{1,2})[-.\/](\d{1,2})[-.\/](\d{2,4})/);
        if (dateMatch) {
          const day = dateMatch[1].padStart(2, '0');
          const month = dateMatch[2].padStart(2, '0');
          let year = dateMatch[3];
          if (year.length === 2) year = '20' + year;
          formattedTransactionDate = `${day}/${month}/${year}`;
        } else {
          formattedTransactionDate = transactionDateValue;
        }
      } else if (transactionDateValue instanceof Date) {
        formattedTransactionDate = transactionDateValue.toLocaleDateString('he-IL');
      }
      
      if (formattedTransactionDate) {
        notes += ` | תאריך עסקה: ${formattedTransactionDate}`;
      }
    }
    
    // הוספת מידע על תשלומים אם קיים
    if (installmentDetails && installmentDetails.totalInstallments > 1 && installmentDetails.installmentNumber > 0) {
      notes += ` | תשלום ${installmentDetails.installmentNumber} מתוך ${installmentDetails.totalInstallments}`;
    }

    // יצירת העסקה
    const transaction: Omit<Transaction, "id"> = {
      date: dateStr,
      amount,
      description: truncatedDescription,
      type,
      categoryId: indices.categoryIndex >= 0 ? String(row[indices.categoryIndex] || '') : "",
      notes
    };

    // הוספת מספר כרטיס לעסקה אם קיים
    if (indices.cardNumberIndex !== -1 && cardNumberValue) {
      transaction.cardNumber = String(cardNumberValue);
    }
    
    // הוספת פרטי תשלומים אם קיימים
    if (installmentDetails) {
      transaction.isInstallment = true;
      transaction.installmentDetails = installmentDetails;
    }
    
    // הוספת מידע נוסף אם קיים
    if (indices.transactionCodeIndex !== -1 && transactionCodeValue) {
      transaction.transactionCode = String(transactionCodeValue);
    }
    
    if (indices.businessCategoryIndex !== -1 && businessCategoryValue) {
      transaction.businessCategory = String(businessCategoryValue);
    }
    
    if (indices.businessIdentifierIndex !== -1 && businessIdentifierValue) {
      transaction.businessIdentifier = String(businessIdentifierValue);
    }
    
    if (totalAmount > 0 && totalAmount !== amount) {
      transaction.originalAmount = totalAmount;
    }

    transactions.push(transaction);
  }
  
  return transactions;
};
