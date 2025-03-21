
import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";

// קבועי מערכת
const SYSTEM_CONSTANTS = {
  // הגבלות מערכת
  MAX_TRANSACTIONS: 50000,
  OVERRIDE_HOURS: 48,
  RESET_HOURS: 4,
  
  // מפתחות localStorage
  KEYS: {
    SKIP_AUTO_INCOMES: "skip_auto_incomes",
    PERMANENT_SKIP_AUTO_INCOMES: "permanent_skip_auto_incomes",
    RESET_IN_PROGRESS: "reset_in_progress",
    DATA_IMPORT_BLOCKED: "data_import_blocked",
    LAST_IMPORT_RESET: "last_import_reset",
    IMPORT_OVERRIDE_TIME: "import_override_time",
    FINANCE_STATE: "financeState"
  },
  
  // הודעות מערכת
  MESSAGES: {
    // הודעות הצלחה
    SUCCESS: {
      RESET_COMPLETED: "איפוס המערכת הושלם בהצלחה",
      BACKUP_CREATED: "גיבוי נוצר בהצלחה",
      AUTO_INCOMES_ENABLED: "הכנסות אוטומטיות הופעלו מחדש",
      IMPORT_ENABLED: "ייבוא נתונים הופעל מחדש לטווח של 48 שעות"
    },
    // הודעות שגיאה
    ERROR: {
      RESET_FAILED: "שגיאה באיפוס המערכת",
      DATA_VALIDATION: "שגיאה באימות הנתונים",
      TRANSACTION_COUNT: "כמות העסקאות חורגת מהמגבלה המותרת"
    },
    // הודעות לוג
    LOG: {
      RESET_START: "מבצע איפוס נתוני LocalStorage עם שמירת גיבויים",
      BACKUP_CREATED: "נוצר גיבוי אוטומטי לפני איפוס",
      RESET_COMPLETED: "איפוס LocalStorage הושלם בהצלחה, גיבויים נשמרו",
      ERROR: "שגיאה באיפוס LocalStorage"
    }
  }
};

/**
 * הוק לפונקציונליות איפוס מערכת
 */
export const useSystemReset = () => {
  const [importBlocked, setImportBlocked] = useState(false);

  // בדיקה האם ייבוא נתונים חסום בעת טעינת הרכיב
  useEffect(() => {
    setImportBlocked(isImportBlocked());
  }, []);

  /**
   * פונקציה לאימות נתונים מה-localStorage
   * @param data הנתונים לאימות
   * @returns האם הנתונים תקינים
   */
  const validateStoredData = (data: string | null): boolean => {
    if (!data) return false;
    
    try {
      const parsedData = JSON.parse(data);
      return (
        parsedData !== null && 
        typeof parsedData === 'object' && 
        (!parsedData.transactions || Array.isArray(parsedData.transactions))
      );
    } catch (error) {
      console.error("שגיאה באימות נתונים:", error);
      return false;
    }
  };

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
      setImportBlocked(true);
      toast.success(SYSTEM_CONSTANTS.MESSAGES.SUCCESS.RESET_COMPLETED);
      return true;
    } catch (error) {
      console.error(SYSTEM_CONSTANTS.MESSAGES.LOG.ERROR + ":", error);
      toast.error(SYSTEM_CONSTANTS.MESSAGES.ERROR.RESET_FAILED);
      return false;
    }
  }, []);

  /**
   * מאפשר הכנסות אוטומטיות (מבטל את הדילוג)
   */
  const enableAutoIncomes = useCallback(() => {
    localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.SKIP_AUTO_INCOMES);
    localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.PERMANENT_SKIP_AUTO_INCOMES);
    toast.success(SYSTEM_CONSTANTS.MESSAGES.SUCCESS.AUTO_INCOMES_ENABLED);
  }, []);
  
  /**
   * בודק אם יש הגבלת ייבוא נתונים
   */
  const isImportBlocked = useCallback(() => {
    // בדיקה אם משתמש הפעיל ידנית דריסת חסימה
    const overrideTimestamp = localStorage.getItem(SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME);
    if (overrideTimestamp) {
      try {
        const overrideTime = parseInt(overrideTimestamp);
        const currentTime = new Date().getTime();
        const hoursSinceOverride = (currentTime - overrideTime) / (1000 * 60 * 60);
        
        // אם עברו פחות מ-48 שעות מאז הדריסה, מתעלמים מהחסימה
        if (hoursSinceOverride < SYSTEM_CONSTANTS.OVERRIDE_HOURS) {
          return false;
        }
      } catch (error) {
        console.error("שגיאה בחישוב זמן דריסת חסימה:", error);
      }
    }
    
    // בדיקה אם יש חסימת ייבוא גורפת
    const isBlocked = localStorage.getItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED) === "true";
    
    // בדיקה אם חלף מספיק זמן מאז האיפוס האחרון
    const lastResetTimestamp = localStorage.getItem(SYSTEM_CONSTANTS.KEYS.LAST_IMPORT_RESET);
    if (lastResetTimestamp) {
      try {
        const lastReset = parseInt(lastResetTimestamp);
        const currentTime = new Date().getTime();
        const hoursSinceReset = (currentTime - lastReset) / (1000 * 60 * 60);
        
        // אם עברו יותר מהזמן המוגדר מאז האיפוס, מסירים את החסימה
        if (hoursSinceReset > SYSTEM_CONSTANTS.RESET_HOURS) {
          localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED);
          return false;
        }
      } catch (error) {
        console.error("שגיאה בחישוב זמן מאז איפוס:", error);
      }
    }
    
    // בדיקה אם יש יותר מדי עסקאות
    const currentData = localStorage.getItem(SYSTEM_CONSTANTS.KEYS.FINANCE_STATE);
    if (currentData) {
      try {
        const parsedData = JSON.parse(currentData);
        const transactionsCount = parsedData.transactions?.length || 0;
        
        // בדיקה לפי קבוע מערכת למספר המקסימלי של עסקאות
        if (transactionsCount > SYSTEM_CONSTANTS.MAX_TRANSACTIONS) {
          localStorage.setItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED, "true");
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
    localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED);
    localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.RESET_IN_PROGRESS);
    
    // רישום דריסת החסימה לטווח של 48 שעות
    const currentTime = new Date().getTime();
    localStorage.setItem(SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME, currentTime.toString());
    
    toast.success(SYSTEM_CONSTANTS.MESSAGES.SUCCESS.IMPORT_ENABLED);
    setImportBlocked(false);
  }, []);

  return {
    resetAllStoredData,
    enableAutoIncomes,
    isImportBlocked,
    enableDataImport,
    importBlocked
  };
};
