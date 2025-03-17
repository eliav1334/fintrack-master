
import { FileImportFormat } from "@/types";

/**
 * זיהוי פרטי תשלומים מנתונים ומתיאור העסקה
 */
export const detectInstallmentDetails = (
  description: string,
  amount: number,
  totalAmount: number,
  installmentNumberValue: any,
  totalInstallmentsValue: any,
  dateStr: string,
  originalTransactionDateStr: string,
  format: FileImportFormat
) => {
  // זיהוי מספר תשלומים ותשלום נוכחי
  let installmentNumber = 0;
  let totalInstallments = 0;
  
  if (installmentNumberValue) {
    const installmentStr = String(installmentNumberValue).replace(/[^\d]/g, '');
    installmentNumber = parseInt(installmentStr) || 0;
  }
  
  if (totalInstallmentsValue) {
    const totalInstallmentsStr = String(totalInstallmentsValue).replace(/[^\d]/g, '');
    totalInstallments = parseInt(totalInstallmentsStr) || 0;
  } else if (format.installmentIdentifier) {
    // ניסיון לזהות תשלומים מהתיאור
    
    // חיפוש תבניות כמו "תשלום 2 מ-6" או "2/6"
    const regex1 = /תשלום\s+(\d+)\s+מ-?\s*(\d+)/i;
    const regex2 = /(\d+)\/(\d+)\s+תשלומים/i;
    
    let match = description.match(regex1);
    if (!match) match = description.match(regex2);
    
    if (match) {
      installmentNumber = parseInt(match[1]) || 0;
      totalInstallments = parseInt(match[2]) || 0;
    }
  }
  
  // בדיקה אם זו עסקת תשלומים
  if (totalInstallments > 1 && installmentNumber > 0) {
    // חישוב סכום כולל אם לא סופק
    const calculatedTotalAmount = totalAmount > 0 ? 
      totalAmount : amount * totalInstallments;
    
    const installmentDetails: {
      totalAmount: number;
      currentInstallment: number;
      totalInstallments: number;
      installmentNumber: number;
      originalTransactionDate: string;
      installmentDate: string;
      remainingAmount?: number; // הוספת שדה נותר לתשלום כרשות
    } = {
      totalAmount: calculatedTotalAmount,
      currentInstallment: amount,
      totalInstallments,
      installmentNumber,
      originalTransactionDate: originalTransactionDateStr || dateStr,
      installmentDate: dateStr
    };
    
    // חישוב הסכום הנותר לתשלום
    if (calculatedTotalAmount > 0) {
      const alreadyPaid = amount * (installmentNumber - 1);
      const remaining = calculatedTotalAmount - alreadyPaid - amount;
      installmentDetails.remainingAmount = remaining > 0 ? remaining : 0;
    }
    
    return installmentDetails;
  }
  
  return null;
};
