
import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";

/**
 * Hook for system reset functionality
 */
export const useSystemReset = () => {
  const [importBlocked, setImportBlocked] = useState(false);

  // בדיקה האם ייבוא נתונים חסום בעת טעינת הרכיב
  useEffect(() => {
    setImportBlocked(isImportBlocked());
  }, []);

  /**
   * Resets all stored data in localStorage
   */
  const resetAllStoredData = useCallback(() => {
    try {
      console.log("מבצע איפוס מלא של נתוני LocalStorage");
      
      // מוודא שיש דילוג על הוספת הכנסות אוטומטיות
      localStorage.setItem("skip_auto_incomes", "true");
      localStorage.setItem("permanent_skip_auto_incomes", "true");
      
      // סימון שאיפוס בתהליך (למניעת טעינת נתונים חדשים)
      localStorage.setItem("reset_in_progress", "true");
      localStorage.setItem("data_import_blocked", "true");
      
      // הגדרת מגבלת ייבוא קבצים
      const currentTime = new Date().getTime();
      localStorage.setItem("last_import_reset", currentTime.toString());
      
      // מחיקה של כל המפתחות הרלוונטיים מהאחסון המקומי
      const keysToKeep = ["skip_auto_incomes", "permanent_skip_auto_incomes", "reset_in_progress", "data_import_blocked", "last_import_reset"];
      
      // מחיקת מפתחות ספציפיים
      localStorage.removeItem("financeState");
      
      // מחיקת כל הגיבויים
      Object.keys(localStorage).forEach(key => {
        if (!keysToKeep.includes(key) && 
            (key.startsWith("financeState_") || 
             key === "lastAutoIncomeDate" || 
             key.includes("transaction") || 
             key.includes("budget") ||
             key.includes("import"))) {
          localStorage.removeItem(key);
        }
      });
      
      console.log("איפוס LocalStorage הושלם בהצלחה");
      setImportBlocked(true);
      return true;
    } catch (error) {
      console.error("שגיאה באיפוס LocalStorage:", error);
      toast.error("שגיאה באיפוס נתונים מקומיים");
      return false;
    }
  }, []);

  /**
   * מאפשר הכנסות אוטומטיות (מבטל את הדילוג)
   */
  const enableAutoIncomes = useCallback(() => {
    localStorage.removeItem("skip_auto_incomes");
    localStorage.removeItem("permanent_skip_auto_incomes");
    toast.success("הכנסות אוטומטיות הופעלו מחדש");
  }, []);
  
  /**
   * בודק אם יש הגבלת ייבוא נתונים
   */
  const isImportBlocked = useCallback(() => {
    // בדיקה אם יש חסימת ייבוא גורפת
    const isBlocked = localStorage.getItem("data_import_blocked") === "true";
    
    // בדיקה אם חלף מספיק זמן מאז האיפוס האחרון (24 שעות)
    const lastResetTimestamp = localStorage.getItem("last_import_reset");
    if (lastResetTimestamp) {
      const lastReset = parseInt(lastResetTimestamp);
      const currentTime = new Date().getTime();
      const hoursSinceReset = (currentTime - lastReset) / (1000 * 60 * 60);
      
      // אם עברו יותר מ-24 שעות מאז האיפוס, מסירים את החסימה
      if (hoursSinceReset > 24) {
        localStorage.removeItem("data_import_blocked");
        return false;
      }
    }
    
    // בדיקה אם יש יותר מדי עסקאות
    const currentData = localStorage.getItem("financeState");
    if (currentData) {
      try {
        const parsedData = JSON.parse(currentData);
        const transactionsCount = parsedData.transactions?.length || 0;
        
        // אם יש יותר מ-10,000 עסקאות, חוסמים ייבוא
        if (transactionsCount > 10000) {
          localStorage.setItem("data_import_blocked", "true");
          return true;
        }
      } catch (error) {
        console.error("שגיאה בבדיקת מספר עסקאות:", error);
      }
    }
    
    return isBlocked;
  }, []);
  
  /**
   * מאפשר ייבוא נתונים (מסיר חסימה)
   */
  const enableDataImport = useCallback(() => {
    localStorage.removeItem("data_import_blocked");
    localStorage.removeItem("reset_in_progress");
    
    // גם אם יש יותר מ-10,000 עסקאות, נאפשר ייבוא חד פעמי
    const currentTime = new Date().getTime();
    localStorage.setItem("import_override_time", currentTime.toString());
    
    toast.success("ייבוא נתונים הופעל מחדש");
    setImportBlocked(false);
  }, []);

  return {
    resetAllStoredData,
    enableAutoIncomes,
    isImportBlocked,
    enableDataImport
  };
};
