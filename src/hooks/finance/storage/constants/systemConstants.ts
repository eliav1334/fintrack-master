
/**
 * קבועי מערכת לניהול המערכת
 */
export const SYSTEM_CONSTANTS = {
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
