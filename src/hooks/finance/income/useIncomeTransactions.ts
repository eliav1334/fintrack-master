
import { generateId } from "@/utils/generateId";
import { Transaction } from "@/types";
import { format } from "date-fns";

/**
 * הוק לניהול עסקאות הכנסה
 */
export const useIncomeTransactions = () => {
  /**
   * יצירת עסקאות הכנסה חודשיות קבועות ל-7 חודשים אחרונים
   * מוסיף בדיוק עסקת הכנסה אחת לחודש בסך 16,000 ₪ ב-1 לחודש
   */
  const addMonthlyIncomes = (): Transaction[] => {
    // בדיקה אם יש סימון לדלג על הוספת הכנסות אוטומטיות
    if (localStorage.getItem("skip_auto_incomes") === "true" || 
        localStorage.getItem("permanent_skip_auto_incomes") === "true" ||
        localStorage.getItem("reset_in_progress") === "true") {
      console.log("מדלג על הוספת הכנסות חודשיות קבועות לפי סימון");
      localStorage.removeItem("skip_auto_incomes");
      return [];
    }
    
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

  return {
    addMonthlyIncomes
  };
};
