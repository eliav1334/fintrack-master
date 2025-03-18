
import { FileImportFormat } from "@/types";

/**
 * קובע את סוג העסקה (הכנסה/הוצאה) לפי הפורמט והערכים
 */
export const determineTransactionType = (
  amount: number,
  format: FileImportFormat,
  typeValue?: string,
  indices?: any
) => {
  // בדיקה אם מדובר בפורמט של כרטיס אשראי
  const isCreditCardFormat = format.name === "כרטיס אשראי ישראלי" || 
                            format.name.includes("אשראי") || 
                            format.creditCardFormat === true;
  
  let type: "income" | "expense";
  let finalAmount = amount;
  
  if (isCreditCardFormat) {
    // בכרטיסי אשראי, חיוב (סכום חיובי) הוא הוצאה, זיכוי (סכום שלילי) הוא הכנסה
    type = amount >= 0 ? "expense" : "income";
    finalAmount = Math.abs(amount);
  } else if (indices?.typeIndex >= 0 && format.typeIdentifier && typeValue) {
    // שימוש במזהה הסוג אם הוגדר בפורמט
    const typeValueLower = String(typeValue).toLowerCase();
    const typeIdentifier = {
      ...format.typeIdentifier,
      creditCardLogic: isCreditCardFormat
    };
    
    if (typeIdentifier.incomeValues.some(v => typeValueLower.includes(v.toLowerCase()))) {
      type = "income";
      finalAmount = Math.abs(amount);
    } else if (typeIdentifier.expenseValues.some(v => typeValueLower.includes(v.toLowerCase()))) {
      type = "expense";
      finalAmount = Math.abs(amount);
    } else {
      // התנהגות ברירת מחדל: חיובי = הכנסה, שלילי = הוצאה
      if (typeIdentifier.creditCardLogic) {
        type = amount >= 0 ? "expense" : "income";
      } else {
        type = amount >= 0 ? "income" : "expense";
      }
      finalAmount = Math.abs(amount);
    }
  } else {
    // התנהגות ברירת מחדל על בסיס סימן הסכום
    type = amount >= 0 ? "income" : "expense";
    finalAmount = Math.abs(amount);
  }
  
  return { type, amount: finalAmount };
};
