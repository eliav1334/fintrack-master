
import { Transaction } from "@/types";

interface InstallmentDetectionParams {
  description: string;
  totalAmountValue?: string;
  installmentNumberValue?: string;
  totalInstallmentsValue?: string;
  originalTransactionDateValue?: string;
  chargeDateValue?: string;
  currentAmount: number;
  installmentIdentifier?: {
    enabled: boolean;
    pattern: string[];
  };
  defaultDate: string;
}

/**
 * זיהוי תשלומים מהתיאור וחילוץ פרטיהם
 */
export const detectInstallments = (params: InstallmentDetectionParams): {
  isInstallment: boolean;
  details: Transaction['installmentDetails'] | null;
} => {
  const {
    description,
    totalAmountValue,
    installmentNumberValue,
    totalInstallmentsValue,
    originalTransactionDateValue,
    chargeDateValue,
    currentAmount,
    installmentIdentifier,
    defaultDate
  } = params;
  
  let isInstallment = false;
  let installmentDetails = null;

  // בדיקה אם קיימים שדות תשלומים ייעודיים
  if (totalAmountValue || installmentNumberValue || totalInstallmentsValue) {
    const totalAmount = totalAmountValue ? parseFloat(totalAmountValue.replace(/[^\d.-]/g, "") || "0") : 0;
    const installmentNumber = installmentNumberValue ? parseInt(installmentNumberValue.replace(/[^\d]/g, "") || "0") : 0;
    const totalInstallments = totalInstallmentsValue ? parseInt(totalInstallmentsValue.replace(/[^\d]/g, "") || "0") : 0;
    
    if (totalInstallments > 1 || (totalAmount > 0 && totalAmount !== currentAmount)) {
      isInstallment = true;
      installmentDetails = {
        totalAmount: totalAmount > 0 ? totalAmount : currentAmount * totalInstallments,
        currentInstallment: currentAmount,
        totalInstallments: totalInstallments || 1,
        installmentNumber: installmentNumber || 1,
        originalTransactionDate: originalTransactionDateValue || defaultDate,
        installmentDate: chargeDateValue || defaultDate,
        remainingAmount: totalAmount - (currentAmount * installmentNumber)
      };
    }
  } else if (installmentIdentifier?.enabled && installmentIdentifier.pattern.length > 0) {
    // זיהוי תשלומים לפי תבנית טקסט בתיאור
    for (const pattern of installmentIdentifier.pattern) {
      if (description.includes(pattern)) {
        // ניסיון לחלץ מספרי תשלומים מהתיאור
        const regex = /תשלום\s+(\d+)\s+מ-?\s*(\d+)/i;
        const match = description.match(regex);
        
        if (match) {
          const currentInstallment = parseInt(match[1]);
          const totalInstallments = parseInt(match[2]);
          
          if (totalInstallments > 1) {
            isInstallment = true;
            installmentDetails = {
              totalAmount: currentAmount * totalInstallments,  // הערכה לפי הכפלה
              currentInstallment: currentAmount,
              totalInstallments: totalInstallments,
              installmentNumber: currentInstallment,
              installmentDate: defaultDate,
              originalTransactionDate: defaultDate // אין לנו את התאריך המקורי
            };
          }
        }
        break;
      }
    }
  }

  return { isInstallment, details: installmentDetails };
};
