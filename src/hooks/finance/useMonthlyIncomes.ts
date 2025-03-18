
import { generateId } from "@/utils/generateId";
import { Transaction } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";

/**
 * הוק לניהול עסקאות הכנסה חודשיות
 */
export const useMonthlyIncomes = () => {
  // חיפוש האם ישנם נתוני localStorage להסרה (לצורך איפוס)
  const resetAllStoredData = () => {
    try {
      console.log("מתחיל תהליך איפוס נתונים מלא...");
      
      // שמירת גיבוי לפני ניקוי מלא
      const currentData = localStorage.getItem("financeState");
      if (currentData) {
        const timestamp = new Date().toISOString();
        localStorage.setItem(`financeState_before_reset_${timestamp}`, currentData);
        console.log(`גיבוי נשמר לפני מחיקה: financeState_before_reset_${timestamp}`);
      }
      
      // מחיקת הנתונים העיקריים
      localStorage.removeItem("financeState");
      
      // מחיקת נתוני טפסים זמניים
      localStorage.removeItem("transaction_form_data");
      localStorage.removeItem("budget_form_data");
      localStorage.removeItem("category_form_data");
      localStorage.removeItem("import_settings");
      
      // מחיקת הגדרות שמורות
      localStorage.removeItem("lastSelectedMonth");
      localStorage.removeItem("lastSelectedYear");
      localStorage.removeItem("lastViewMode");
      localStorage.removeItem("lastTabIndex");
      localStorage.removeItem("lastImportFormat");
      
      // הסרת כל הגיבויים האוטומטיים
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          if (key.startsWith("financeState_") || 
              key.includes("backup") || 
              key.includes("finance")) {
            keysToRemove.push(key);
          }
        }
      }
      
      // מחיקת המפתחות שנאספו (מחוץ ללולאה כדי למנוע בעיות באינדקסים)
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`נמחק: ${key}`);
      });
      
      // הגדרה מפורשת לדילוג על הוספת הכנסות אוטומטיות
      localStorage.setItem("skip_auto_incomes", "true");
      localStorage.setItem("reset_in_progress", "true");
      
      // הסרת תאריך הגיבוי האחרון
      localStorage.removeItem("lastBackupDate");
      
      console.log("איפוס נתונים הושלם בהצלחה");
      
      return true;
    } catch (error) {
      console.error("שגיאה באיפוס הנתונים:", error);
      toast.error("שגיאה באיפוס הנתונים", {
        description: "לא ניתן היה לאפס את הנתונים. נסה שוב."
      });
      return false;
    }
  };

  /**
   * יצירת עסקאות הכנסה חודשיות קבועות ל-7 חודשים אחרונים
   * מוסיף בדיוק עסקת הכנסה אחת לחודש בסך 16,000 ₪ ב-1 לחודש
   */
  const addMonthlyIncomes = (): Transaction[] => {
    // בדיקה אם יש סימון לדלג על הוספת הכנסות אוטומטיות
    if (localStorage.getItem("skip_auto_incomes") === "true") {
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
