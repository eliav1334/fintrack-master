
import { useState, useEffect, useCallback } from "react";
import { SYSTEM_CONSTANTS } from "./constants/systemConstants";

/**
 * הוק לניהול חסימת ייבוא נתונים עם סנכרון מלא
 */
export const useImportBlocker = () => {
  // שמירת המצב כ-state פנימי לאפשר רענון אוטומטי של הממשק
  const [blocked, setBlocked] = useState<boolean>(false);
  
  // בדיקת מצב חסימה עם קריאה ישירה ל-localStorage
  const checkImportBlockStatus = useCallback((): boolean => {
    return localStorage.getItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED) === "true";
  }, []);
  
  // טעינה ראשונית של המצב מה-localStorage
  useEffect(() => {
    setBlocked(checkImportBlockStatus());
  }, [checkImportBlockStatus]);

  /**
   * מאפשר מחדש ייבוא נתונים (דריסה זמנית)
   */
  const enableDataImport = useCallback((): void => {
    try {
      // הסרת חסימת הייבוא
      localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED);
      
      // הגדרת דריסה זמנית
      const now = new Date().getTime();
      const expiryTime = now + (SYSTEM_CONSTANTS.OVERRIDE_HOURS * 60 * 60 * 1000);
      localStorage.setItem(SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME, expiryTime.toString());
      
      // עדכון ה-state המקומי
      setBlocked(false);
      
      console.log("ייבוא נתונים הופעל מחדש, תוקף:", new Date(expiryTime).toLocaleString());
    } catch (error) {
      console.error("שגיאה בהפעלת ייבוא נתונים:", error);
      throw new Error("שגיאה בהפעלת ייבוא נתונים");
    }
  }, []);
  
  /**
   * קביעת מצב חסימת ייבוא
   */
  const setImportBlocked = useCallback((value: boolean): void => {
    if (value) {
      localStorage.setItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED, "true");
    } else {
      localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED);
    }
    
    // עדכון ה-state המקומי
    setBlocked(value);
  }, []);

  return {
    isImportBlocked: blocked,          // גישה ל-state המקומי
    checkImportBlockStatus,            // פונקציה לבדיקת המצב הנוכחי
    enableDataImport,                  // פונקציה להפעלת ייבוא מחדש
    setImportBlocked                   // פונקציה לקביעת מצב החסימה
  };
};
