
/**
 * יוצר הערות לעסקה בהתאם לנתונים
 */
export const generateTransactionNotes = (
  isCreditCardFormat: boolean,
  sheetName?: string,
  originalTransactionDate?: string,
  installmentDetails?: any
): string => {
  let notes = "";
  
  // הוספת מקור הייבוא להערות
  if (isCreditCardFormat) {
    notes = "יובא מכרטיס אשראי";
  } else {
    notes = `יובא מקובץ אקסל - גליון: ${sheetName || "ראשי"}`;
  }
  
  // הוספת מידע לגבי תאריך העסקה להערות
  if (originalTransactionDate) {
    notes += ` | תאריך עסקה: ${originalTransactionDate}`;
  }
  
  // הוספת מידע על תשלומים אם קיים
  if (installmentDetails && installmentDetails.totalInstallments > 1 && installmentDetails.installmentNumber > 0) {
    notes += ` | תשלום ${installmentDetails.installmentNumber} מתוך ${installmentDetails.totalInstallments}`;
  }
  
  return notes;
};

/**
 * פורמט תאריך עסקה מקורי למחרוזת מובנת
 */
export const formatOriginalTransactionDate = (transactionDateValue: any): string => {
  if (!transactionDateValue) return "";
  
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
  
  return formattedTransactionDate;
};
