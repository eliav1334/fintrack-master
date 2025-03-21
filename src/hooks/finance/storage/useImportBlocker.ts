
import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";
import { SYSTEM_CONSTANTS } from "./constants/systemConstants";

/**
 * הוק לניהול חסימת ייבוא נתונים
 */
export const useImportBlocker = () => {
  const [importBlocked, setImportBlocked] = useState(false);

  // בדיקה האם ייבוא נתונים חסום בעת טעינת הרכיב
  useEffect(() => {
    const checkIfBlocked = () => {
      const blocked = isImportBlocked();
      setImportBlocked(blocked);
    };
    
    checkIfBlocked();
    // נריץ את הבדיקה פעם אחת בלבד בטעינה
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * בודק אם יש הגבלת ייבוא נתונים
   */
  const isImportBlocked = useCallback(() => {
    try {
      // בדיקה אם משתמש הפעיל ידנית דריסת חסימה
      const overrideTimestamp = localStorage.getItem(SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME);
      if (overrideTimestamp) {
        const overrideTime = parseInt(overrideTimestamp);
        if (!isNaN(overrideTime)) {
          const currentTime = new Date().getTime();
          const hoursSinceOverride = (currentTime - overrideTime) / (1000 * 60 * 60);
          
          // אם עברו פחות מ-48 שעות מאז הדריסה, מתעלמים מהחסימה
          if (hoursSinceOverride < SYSTEM_CONSTANTS.OVERRIDE_HOURS) {
            return false;
          }
        }
      }
      
      // בדיקה אם יש חסימת ייבוא גורפת
      const isBlocked = localStorage.getItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED) === "true";
      
      // בדיקה אם חלף מספיק זמן מאז האיפוס האחרון
      const lastResetTimestamp = localStorage.getItem(SYSTEM_CONSTANTS.KEYS.LAST_IMPORT_RESET);
      if (lastResetTimestamp) {
        const lastReset = parseInt(lastResetTimestamp);
        if (!isNaN(lastReset)) {
          const currentTime = new Date().getTime();
          const hoursSinceReset = (currentTime - lastReset) / (1000 * 60 * 60);
          
          // אם עברו יותר מהזמן המוגדר מאז האיפוס, מסירים את החסימה
          if (hoursSinceReset > SYSTEM_CONSTANTS.RESET_HOURS) {
            localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED);
            return false;
          }
        }
      }
      
      // בדיקה אם יש יותר מדי עסקאות
      const currentData = localStorage.getItem(SYSTEM_CONSTANTS.KEYS.FINANCE_STATE);
      if (currentData) {
        try {
          const parsedData = JSON.parse(currentData);
          if (parsedData && parsedData.transactions) {
            const transactionsCount = parsedData.transactions.length || 0;
            
            // בדיקה לפי קבוע מערכת למספר המקסימלי של עסקאות
            if (transactionsCount > SYSTEM_CONSTANTS.MAX_TRANSACTIONS) {
              localStorage.setItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED, "true");
              return true;
            }
          }
        } catch (error) {
          console.error("שגיאה בבדיקת מספר עסקאות:", error);
        }
      }
      
      return isBlocked;
    } catch (error) {
      console.error("שגיאה בבדיקת חסימת ייבוא:", error);
      return false;
    }
  }, []);
  
  /**
   * מאפשר ייבוא נתונים (מסיר חסימה)
   */
  const enableDataImport = useCallback(() => {
    localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED);
    localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.RESET_IN_PROGRESS);
    
    // רישום דריסת החסימה לטווח של 48 שעות
    const currentTime = new Date().getTime();
    localStorage.setItem(SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME, currentTime.toString());
    
    toast.success(SYSTEM_CONSTANTS.MESSAGES.SUCCESS.IMPORT_ENABLED);
    setImportBlocked(false);
  }, []);

  return {
    isImportBlocked,
    enableDataImport,
    importBlocked
  };
};
