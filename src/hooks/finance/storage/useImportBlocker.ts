
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { SYSTEM_CONSTANTS } from "./constants/systemConstants";

/**
 * הוק לניהול חסימת ייבוא נתונים
 * גרסה משופרת למניעת לולאות אינסופיות
 */
export const useImportBlocker = () => {
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  
  // בדיקה אחת בלבד בטעינה
  useEffect(() => {
    const blocked = checkIfImportBlocked();
    setIsBlocked(blocked);
    // אין תלויות - רק פעם אחת בטעינה
  }, []);
  
  /**
   * בדיקה האם ייבוא נתונים חסום
   */
  const checkIfImportBlocked = useCallback((): boolean => {
    try {
      // בדיקת חסימת ייבוא
      const blockedValue = localStorage.getItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED);
      const blocked = blockedValue === "true";
      
      // אם אין חסימה, מחזירים false מיד
      if (!blocked) {
        return false;
      }
      
      // אם יש חסימה, בודקים אם יש override פעיל
      const overrideTimeStr = localStorage.getItem(SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME);
      
      // אם אין override, החסימה בתוקף
      if (!overrideTimeStr) {
        return true;
      }
      
      // המרה למספר ובדיקת תקינות
      const overrideTime = parseInt(overrideTimeStr, 10);
      if (isNaN(overrideTime)) {
        return true;
      }
      
      // בדיקה אם ה-override עדיין בתוקף (48 שעות)
      const currentTime = Date.now();
      const timeDiffHours = (currentTime - overrideTime) / (1000 * 60 * 60);
      
      // אם ה-override פג תוקף, החסימה בתוקף
      return timeDiffHours > SYSTEM_CONSTANTS.OVERRIDE_HOURS;
    } catch (error) {
      console.error("שגיאה בבדיקת חסימת ייבוא:", error);
      return false; // במקרה של שגיאה, מניחים שאין חסימה
    }
  }, []);

  /**
   * בדיקת מצב חסימת ייבוא נוכחי - חוזרת לערך מקומי ולא קוראת לlocalstorage
   */
  const isImportBlocked = useCallback((): boolean => {
    return isBlocked;
  }, [isBlocked]);

  /**
   * הפעלת ייבוא נתונים מחדש (override)
   */
  const enableDataImport = useCallback(() => {
    try {
      // שמירת זמן ה-override
      const currentTime = Date.now();
      localStorage.setItem(SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME, currentTime.toString());
      
      // עדכון המצב המקומי
      setIsBlocked(false);
      
      // הצגת הודעת הצלחה
      toast.success(SYSTEM_CONSTANTS.MESSAGES.SUCCESS.IMPORT_ENABLED);
      
      return true;
    } catch (error) {
      console.error("שגיאה בהפעלת ייבוא נתונים:", error);
      toast.error("שגיאה בהפעלת ייבוא נתונים");
      return false;
    }
  }, []);

  /**
   * סימון חסימת ייבוא
   */
  const setImportBlocked = useCallback((block: boolean, reason?: string) => {
    try {
      if (block) {
        localStorage.setItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED, "true");
        console.warn("חסימת ייבוא נתונים הופעלה", reason ? `: ${reason}` : "");
      } else {
        localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED);
        localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME);
        console.log("חסימת ייבוא נתונים בוטלה");
      }
      
      // עדכון המצב המקומי
      setIsBlocked(block);
      
      return true;
    } catch (error) {
      console.error("שגיאה בעדכון חסימת ייבוא נתונים:", error);
      return false;
    }
  }, []);

  return {
    isImportBlocked,
    enableDataImport,
    setImportBlocked,
    checkIfImportBlocked
  };
};
