
import { FileImportFormat, TransactionType } from "@/types";

/**
 * זיהוי סוג העסקה (הכנסה/הוצאה) על פי ערך העמודה והתצורה
 */
export const detectTransactionType = (
  amount: number,
  typeValue?: string, 
  typeIdentifier?: FileImportFormat['typeIdentifier']
): { type: TransactionType; amount: number } => {
  let type: "income" | "expense";
  
  // קביעת סוג העסקה לפי הערך בעמודת הסוג
  if (typeValue && typeIdentifier) {
    const lowerTypeValue = typeValue.toLowerCase();
    
    if (typeIdentifier.incomeValues.some(v => lowerTypeValue.includes(v.toLowerCase()))) {
      type = "income";
      amount = Math.abs(amount);
    } else if (typeIdentifier.expenseValues.some(v => lowerTypeValue.includes(v.toLowerCase()))) {
      type = "expense";
      amount = Math.abs(amount);
    } else {
      // התנהגות ברירת מחדל: חיובי = הכנסה, שלילי = הוצאה
      // בכרטיסי אשראי, ההיגיון הפוך - חיובי הוא הוצאה, שלילי הוא הכנסה/זיכוי
      if (typeIdentifier.creditCardLogic) {
        type = amount >= 0 ? "expense" : "income";
      } else {
        type = amount >= 0 ? "income" : "expense";
      }
      amount = Math.abs(amount);
    }
  } else {
    // התנהגות ברירת מחדל על בסיס סימן הסכום
    type = amount >= 0 ? "income" : "expense";
    amount = Math.abs(amount);
  }
  
  return { type, amount };
};
