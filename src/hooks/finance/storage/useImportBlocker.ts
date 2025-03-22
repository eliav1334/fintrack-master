
import { useState, useEffect, useCallback, useRef } from "react";
import { SYSTEM_CONSTANTS } from "./constants/systemConstants";

/**
 * הוק לניהול חסימת ייבוא נתונים עם סנכרון מלא ומניעת לופים
 */
export const useImportBlocker = () => {
  // שמירת המצב כ-state פנימי לאפשר רענון אוטומטי של הממשק
  const [blocked, setBlocked] = useState<boolean>(false);
  // מונע כפילות עדכונים
  const lastUpdateRef = useRef<number>(0);
  // דגל לבדיקה האם ההוק אותחל
  const isInitializedRef = useRef<boolean>(false);
  
  // בדיקת מצב חסימה עם קריאה ישירה ל-localStorage
  const checkImportBlockStatus = useCallback((): boolean => {
    // בדיקה של מצב חסימה
    const isBlocked = localStorage.getItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED) === "true";
    
    // אם יש דריסה זמנית, בודקים אם היא עדיין בתוקף
    if (isBlocked) {
      const overrideTimeStr = localStorage.getItem(SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME);
      if (overrideTimeStr) {
        const overrideTime = parseInt(overrideTimeStr, 10);
        const now = new Date().getTime();
        
        // אם הדריסה עדיין בתוקף, מחזירים false (לא חסום)
        if (!isNaN(overrideTime) && overrideTime > now) {
          return false;
        } else {
          // אם הדריסה פגה תוקף, מנקים אותה
          localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME);
        }
      }
    }
    
    return isBlocked;
  }, []);
  
  // פונקציה לעדכון המצב הפנימי - רק אם יש שינוי אמיתי וללא לופים
  const updateBlockedState = useCallback(() => {
    const isBlocked = checkImportBlockStatus();
    
    // מניעת עדכונים מיותרים שיגרמו לרינדור מיותר
    if (isBlocked !== blocked) {
      console.log("עדכון מצב חסימת ייבוא:", isBlocked);
      setBlocked(isBlocked);
    }
  }, [checkImportBlockStatus, blocked]);
  
  // טעינה ראשונית של המצב מה-localStorage והאזנה לשינויים
  useEffect(() => {
    // נריץ פעם אחת בטעינה - כדי לעדכן את המצב הפנימי לפי localStorage
    if (!isInitializedRef.current) {
      updateBlockedState();
      isInitializedRef.current = true;
    }
    
    // האזנה לשינויים דרך אירועי storage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED || 
          e.key === SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME || 
          e.key === null) {
        // מעדכנים את המצב הפנימי רק אם אירוע מגיע מחלון אחר
        // זה עוזר למנוע לופים
        updateBlockedState();
      }
    };
    
    // הוספת מאזין לשינויים בחלון הנוכחי
    window.addEventListener('storage', handleStorageChange);
    
    // ניקוי המאזין כאשר הקומפוננטה מתפרקת
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [updateBlockedState]);

  /**
   * מאפשר מחדש ייבוא נתונים (דריסה זמנית)
   */
  const enableDataImport = useCallback((): void => {
    try {
      console.log("מפעיל ייבוא נתונים מחדש");
      
      // מניעת כפילות עדכונים (הגנה מלופים)
      const now = new Date().getTime();
      if (now - lastUpdateRef.current < 1000) {
        console.log("דילוג על עדכון חוזר (פחות משנייה)");
        return;
      }
      lastUpdateRef.current = now;
      
      // הסרת חסימת הייבוא
      localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED);
      
      // הגדרת דריסה זמנית עם תוקף ברור
      const expiryTime = now + (SYSTEM_CONSTANTS.OVERRIDE_HOURS * 60 * 60 * 1000);
      localStorage.setItem(SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME, expiryTime.toString());
      
      // עדכון ה-state המקומי
      setBlocked(false);
      
      // הודעה לחלונות אחרים על השינוי - מבטיח שכל החלונות יקבלו את האירוע
      // בדיקה שה-storage זמין לפני הפעלת אירוע
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          // שימוש באירוע ספציפי במקום storage כללי
          const customEvent = new CustomEvent('import-blocker-update', {
            detail: { blocked: false, overrideTime: expiryTime }
          });
          window.dispatchEvent(customEvent);
        } catch (e) {
          console.error("שגיאה בשליחת אירוע storage:", e);
        }
      }
      
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
    // מניעת כפילות עדכונים (הגנה מלופים)
    const now = new Date().getTime();
    if (now - lastUpdateRef.current < 1000) {
      console.log("דילוג על עדכון חוזר (פחות משנייה)");
      return;
    }
    
    // אם המצב כבר זהה, לא עושים שינוי כדי למנוע לופים
    if (value === blocked) {
      console.log("דילוג על שינוי מצב חסימה - המצב כבר", value ? "חסום" : "פתוח");
      return;
    }
    
    console.log("שינוי מצב חסימת ייבוא ל:", value);
    lastUpdateRef.current = now;
    
    if (value) {
      localStorage.setItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED, "true");
      // מחיקת כל דריסה קיימת
      localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME);
    } else {
      localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED);
    }
    
    // עדכון ה-state המקומי
    setBlocked(value);
    
    // הודעה לחלונות אחרים על השינוי
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        // שימוש באירוע ספציפי במקום storage כללי
        const customEvent = new CustomEvent('import-blocker-update', {
          detail: { blocked: value }
        });
        window.dispatchEvent(customEvent);
      } catch (e) {
        console.error("שגיאה בשליחת אירוע:", e);
      }
    }
  }, [blocked]);

  return {
    isImportBlocked: blocked,          // האם הייבוא חסום כרגע
    checkImportBlockStatus,            // פונקציה לבדיקת המצב הנוכחי
    enableDataImport,                  // פונקציה להפעלת ייבוא מחדש
    setImportBlocked                   // פונקציה לקביעת מצב החסימה
  };
};
