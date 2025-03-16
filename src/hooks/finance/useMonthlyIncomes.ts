
import { generateId } from "@/utils/generateId";
import { Transaction } from "@/types";
import { format } from "date-fns";

/**
 * הוק לניהול עסקאות הכנסה חודשיות
 */
export const useMonthlyIncomes = () => {
  // חיפוש האם ישנם נתוני localStorage להסרה (לצורך איפוס)
  const resetAllStoredData = () => {
    // הסרת כל הנתונים השמורים ב-localStorage
    localStorage.removeItem("financeState");
    
    // הסרת כל הגיבויים
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith("financeState_backup_") || 
        key.startsWith("financeState_daily_backup_") ||
        key.startsWith("financeState_before_restore_")
      )) {
        localStorage.removeItem(key);
        i--; // התאמת האינדקס לאחר הסרת פריט
      }
    }
    
    // הסרת תאריך הגיבוי האחרון
    localStorage.removeItem("lastBackupDate");
    
    return true;
  };

  /**
   * יצירת עסקאות הכנסה חודשיות קבועות ל-7 חודשים אחרונים
   * מוסיף בדיוק עסקת הכנסה אחת לחודש בסך 16,000 ₪ ב-1 לחודש
   */
  const addMonthlyIncomes = (): Transaction[] => {
    const currentDate = new Date();
    
    // יצירת מערך של 7 חודשים אחרונים
    const last7Months = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return format(date, "yyyy-MM");
    });
    
    // הכנת עסקאות חדשות להוספה
    const newTransactions: Transaction[] = [];
    
    // עבור כל אחד מ-7 החודשים האחרונים, הוסף הכנסה חודשית
    last7Months.forEach(month => {
      const [year, monthNum] = month.split("-");
      
      // יצירת תאריך ליום ה-1 בחודש (יום תשלום - תמיד ב-1 לחודש)
      const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      
      const monthlyIncome: Transaction = {
        id: generateId(`income-${month}`), // מזהה ייחודי לכל חודש
        description: "משכורת חודשית קבועה",
        amount: 16000,
        type: "income",
        date: format(date, "yyyy-MM-dd"),
        categoryId: "",
        notes: `הכנסה חודשית קבועה לחודש ${month}`
      };
      
      // הוספה למערך העסקאות החדשות
      newTransactions.push(monthlyIncome);
    });
    
    return newTransactions;
  };

  /**
   * בדיקה אם עסקה היא עסקת הכנסה חודשית
   */
  const isMonthlyIncome = (tx: Transaction): boolean => {
    return (
      tx.type === "income" && 
      tx.amount === 16000 && 
      tx.description === "משכורת חודשית קבועה"
    );
  };

  /**
   * ניקוי עסקאות הכנסה חודשיות מהמערך
   */
  const cleanMonthlyIncomes = (transactions: Transaction[]): Transaction[] => {
    return transactions.filter(tx => !isMonthlyIncome(tx));
  };

  return {
    addMonthlyIncomes,
    cleanMonthlyIncomes,
    isMonthlyIncome,
    resetAllStoredData
  };
};
