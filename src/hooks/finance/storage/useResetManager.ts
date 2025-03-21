
import { useCallback } from "react";
import { toast } from "sonner";
import { SYSTEM_CONSTANTS } from "./constants/systemConstants";
import { validateStoredData } from "./dataValidation";

/**
 * הוק לניהול איפוס המערכת
 */
export const useResetManager = () => {
  /**
   * איפוס מידע באחסון המקומי - עם אפשרות לשמירת גיבויים
   */
  const resetAllStoredData = useCallback((options: { keepBackups?: boolean; blockImport?: boolean } = { keepBackups: true }) => {
    try {
      console.log(SYSTEM_CONSTANTS.MESSAGES.LOG.RESET_START + ":", options);
      
      // מוודא שיש דילוג על הוספת הכנסות אוטומטיות
      localStorage.setItem(SYSTEM_CONSTANTS.KEYS.SKIP_AUTO_INCOMES, "true");
      localStorage.setItem(SYSTEM_CONSTANTS.KEYS.PERMANENT_SKIP_AUTO_INCOMES, "true");
      
      // סימון שאיפוס בתהליך (למניעת טעינת נתונים חדשים)
      localStorage.setItem(SYSTEM_CONSTANTS.KEYS.RESET_IN_PROGRESS, "true");
      
      // במקום לחסום ייבוא נתונים באופן מיידי, נגדיר את מגבלת הזמן
      const currentTime = new Date().getTime();
      localStorage.setItem(SYSTEM_CONSTANTS.KEYS.LAST_IMPORT_RESET, currentTime.toString());
      
      // חסימת ייבוא רק אם המשתמש לא ביקש אחרת
      if (options.blockImport !== false) {
        localStorage.setItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED, "true");
      }
      
      // מחיקה של מפתחות ספציפיים תוך שמירת גיבויים
      const keysToKeep = [
        SYSTEM_CONSTANTS.KEYS.SKIP_AUTO_INCOMES, 
        SYSTEM_CONSTANTS.KEYS.PERMANENT_SKIP_AUTO_INCOMES, 
        SYSTEM_CONSTANTS.KEYS.RESET_IN_PROGRESS, 
        SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED, 
        SYSTEM_CONSTANTS.KEYS.LAST_IMPORT_RESET
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
      const currentData = localStorage.getItem(SYSTEM_CONSTANTS.KEYS.FINANCE_STATE);
      if (currentData && validateStoredData(currentData)) {
        const resetBackupKey = `financeState_reset_backup_${currentTime}`;
        localStorage.setItem(resetBackupKey, currentData);
        console.log(SYSTEM_CONSTANTS.MESSAGES.LOG.BACKUP_CREATED + ":", resetBackupKey);
      }
      
      // מחיקת מפתחות ספציפיים
      localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.FINANCE_STATE);
      
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
      
      console.log(SYSTEM_CONSTANTS.MESSAGES.LOG.RESET_COMPLETED);
      toast.success(SYSTEM_CONSTANTS.MESSAGES.SUCCESS.RESET_COMPLETED);
      return true;
    } catch (error) {
      console.error(SYSTEM_CONSTANTS.MESSAGES.LOG.ERROR + ":", error);
      toast.error(SYSTEM_CONSTANTS.MESSAGES.ERROR.RESET_FAILED);
      return false;
    }
  }, []);

  return {
    resetAllStoredData
  };
};
