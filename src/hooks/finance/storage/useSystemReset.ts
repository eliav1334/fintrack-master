
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
   * איפוס מידע באחסון המקומי - עם אפשרות לשמירת גיבויים
   */
  const resetAllStoredData = useCallback((options: { keepBackups?: boolean; blockImport?: boolean } = { keepBackups: true }) => {
    try {
      console.log("מבצע איפוס נתוני LocalStorage עם שמירת גיבויים:", options);
      
      // מוודא שיש דילוג על הוספת הכנסות אוטומטיות
      localStorage.setItem("skip_auto_incomes", "true");
      localStorage.setItem("permanent_skip_auto_incomes", "true");
      
      // סימון שאיפוס בתהליך (למניעת טעינת נתונים חדשים)
      localStorage.setItem("reset_in_progress", "true");
      
      // במקום לחסום ייבוא נתונים באופן מיידי, נגדיר את מגבלת הזמן קצרה יותר
      const currentTime = new Date().getTime();
      localStorage.setItem("last_import_reset", currentTime.toString());
      // חסימת ייבוא רק אם המשתמש לא ביקש אחרת
      if (options.blockImport !== false) {
        localStorage.setItem("data_import_blocked", "true");
      }
      
      // מחיקה של מפתחות ספציפיים תוך שמירת גיבויים
      const keysToKeep = [
        "skip_auto_incomes", 
        "permanent_skip_auto_incomes", 
        "reset_in_progress", 
        "data_import_blocked", 
        "last_import_reset"
      ];
      
      // אם מבקשים לשמור גיבויים, נוסיף את כל המפתחות שמתחילים ב-backup
      if (options.keepBackups) {
        Object.keys(localStorage).forEach(key => {
          if (key.includes("backup") || key.includes("_daily_backup_")) {
            keysToKeep.push(key);
          }
        });
      }
      
      // יצירת גיבוי אוטומטי של המצב הנוכחי לפני האיפוס
      const currentData = localStorage.getItem("financeState");
      if (currentData) {
        const resetBackupKey = `financeState_reset_backup_${currentTime}`;
        localStorage.setItem(resetBackupKey, currentData);
        console.log("נוצר גיבוי אוטומטי לפני איפוס:", resetBackupKey);
      }
      
      // מחיקת מפתחות ספציפיים
      localStorage.removeItem("financeState");
      
      // מחיקת כל המפתחות שלא ברשימת השמורים
      Object.keys(localStorage).forEach(key => {
        if (!keysToKeep.includes(key) && 
            (key.startsWith("financeState_") && !key.includes("backup") && !key.includes("_daily_backup_") || 
             key === "lastAutoIncomeDate" || 
             key.includes("transaction") || 
             key.includes("budget") ||
             key.includes("import"))) {
          localStorage.removeItem(key);
        }
      });
      
      console.log("איפוס LocalStorage הושלם בהצלחה, גיבויים נשמרו");
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
    // בדיקה אם משתמש הפעיל ידנית דריסת חסימה
    const overrideTimestamp = localStorage.getItem("import_override_time");
    if (overrideTimestamp) {
      const overrideTime = parseInt(overrideTimestamp);
      const currentTime = new Date().getTime();
      const hoursSinceOverride = (currentTime - overrideTime) / (1000 * 60 * 60);
      
      // אם עברו פחות מ-48 שעות מאז הדריסה, מתעלמים מהחסימה
      if (hoursSinceOverride < 48) {
        return false;
      }
    }
    
    // בדיקה אם יש חסימת ייבוא גורפת
    const isBlocked = localStorage.getItem("data_import_blocked") === "true";
    
    // בדיקה אם חלף מספיק זמן מאז האיפוס האחרון (4 שעות במקום 8)
    const lastResetTimestamp = localStorage.getItem("last_import_reset");
    if (lastResetTimestamp) {
      const lastReset = parseInt(lastResetTimestamp);
      const currentTime = new Date().getTime();
      const hoursSinceReset = (currentTime - lastReset) / (1000 * 60 * 60);
      
      // אם עברו יותר מ-4 שעות מאז האיפוס, מסירים את החסימה
      if (hoursSinceReset > 4) {
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
        
        // מעלים את הסף ל-50,000 עסקאות במקום 25,000
        if (transactionsCount > 50000) {
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
    
    // רישום דריסת החסימה לטווח של 48 שעות במקום 24
    const currentTime = new Date().getTime();
    localStorage.setItem("import_override_time", currentTime.toString());
    
    toast.success("ייבוא נתונים הופעל מחדש לטווח של 48 שעות");
    setImportBlocked(false);
  }, []);

  return {
    resetAllStoredData,
    enableAutoIncomes,
    isImportBlocked,
    enableDataImport
  };
};
