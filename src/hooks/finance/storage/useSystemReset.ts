
import { toast } from "sonner";

/**
 * הוק לניהול איפוס מערכת
 */
export const useSystemReset = () => {
  /**
   * איפוס כל הנתונים השמורים במערכת
   */
  const resetAllStoredData = () => {
    try {
      console.log("מתחיל תהליך איפוס נתונים מלא...");
      
      // שמירת גיבוי לפני ניקוי מלא (רק אם המשתמש רוצה)
      const shouldBackup = localStorage.getItem("backup_before_reset") === "true";
      if (shouldBackup) {
        const currentData = localStorage.getItem("financeState");
        if (currentData) {
          const timestamp = new Date().toISOString();
          localStorage.setItem(`financeState_before_reset_${timestamp}`, currentData);
          console.log(`גיבוי נשמר לפני מחיקה: financeState_before_reset_${timestamp}`);
        }
      }
      
      // מוודא שיש דילוג על הוספת הכנסות אוטומטיות
      localStorage.setItem("skip_auto_incomes", "true");
      localStorage.setItem("permanent_skip_auto_incomes", "true");
      
      // מחיקת כל הנתונים בלוקאל סטורג' מלבד סימון הדילוג הקבוע
      const itemsToKeep = ["permanent_skip_auto_incomes"];
      
      // שמירת המצב הנוכחי של פריטים שרוצים לשמור
      const preservedItems: Record<string, string | null> = {};
      itemsToKeep.forEach(key => {
        preservedItems[key] = localStorage.getItem(key);
      });
      
      // ניקוי מלא של LocalStorage
      localStorage.clear();
      
      // שחזור הפריטים שרצינו לשמור
      Object.entries(preservedItems).forEach(([key, value]) => {
        if (value) {
          localStorage.setItem(key, value);
        }
      });
      
      // מסמן שאנחנו במצב איפוס
      localStorage.setItem("reset_in_progress", "true");
      
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
   * הפעלת התכונה של הוספת הכנסות אוטומטיות (רק לשימוש אדמין)
   */
  const enableAutoIncomes = () => {
    localStorage.removeItem("permanent_skip_auto_incomes");
    localStorage.removeItem("skip_auto_incomes");
    localStorage.setItem("enable_auto_incomes", "true");
    return true;
  };

  return {
    resetAllStoredData,
    enableAutoIncomes
  };
};
