
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { SYSTEM_CONSTANTS } from "./constants/systemConstants";

/**
 * הוק לניהול חסימת ייבוא נתונים
 */
export const useImportBlocker = () => {
  // לא שומרים מצב בהוק כדי למנוע בעיות סנכרון עם localStorage
  
  /**
   * בדיקה האם ייבוא נתונים חסום
   */
  const isImportBlocked = useCallback((): boolean => {
    try {
      // בדיקת חסימת ייבוא
      const blocked = localStorage.getItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED) === "true";
      
      // אם יש חסימה, בודקים אם יש override פעיל
      if (blocked) {
        const overrideTimeStr = localStorage.getItem(SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME);
        
        // אם אין override, החסימה בתוקף
        if (!overrideTimeStr) return true;
        
        // המרה למספר ובדיקת תקינות
        const overrideTime = parseInt(overrideTimeStr, 10);
        if (isNaN(overrideTime)) return true;
        
        // בדיקה אם ה-override עדיין בתוקף (48 שעות)
        const currentTime = Date.now();
        const timeDiffHours = (currentTime - overrideTime) / (1000 * 60 * 60);
        
        // אם ה-override פג תוקף, החסימה בתוקף
        return timeDiffHours > SYSTEM_CONSTANTS.OVERRIDE_HOURS;
      }
      
      return false;
    } catch (error) {
      console.error("שגיאה בבדיקת חסימת ייבוא:", error);
      return false; // במקרה של שגיאה, מניחים שאין חסימה
    }
  }, []);

  /**
   * הפעלת ייבוא נתונים מחדש (override)
   */
  const enableDataImport = useCallback(() => {
    try {
      // שמירת זמן ה-override
      const currentTime = Date.now();
      localStorage.setItem(SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME, currentTime.toString());
      
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
  const importBlocked = useCallback((reason?: string) => {
    try {
      localStorage.setItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED, "true");
      console.warn("חסימת ייבוא נתונים הופעלה", reason ? `: ${reason}` : "");
      return true;
    } catch (error) {
      console.error("שגיאה בחסימת ייבוא נתונים:", error);
      return false;
    }
  }, []);

  return {
    isImportBlocked,
    enableDataImport,
    importBlocked
  };
};
