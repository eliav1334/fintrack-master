
import { useState, useCallback } from "react";
import { SYSTEM_CONSTANTS } from "./constants/systemConstants";

/**
 * הוק לניהול חסימת ייבוא נתונים
 */
export const useImportBlocker = () => {
  // בדיקה האם ייבוא הנתונים חסום - שימוש ישיר ב-localStorage
  const isImportBlocked = useCallback((): boolean => {
    return localStorage.getItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED) === "true";
  }, []);
  
  /**
   * מאפשר מחדש ייבוא נתונים (מגדיר דריסה זמנית)
   */
  const enableDataImport = useCallback((): void => {
    try {
      // הסרת חסימת הייבוא
      localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED);
      
      // הגדרת דריסה זמנית
      const now = new Date().getTime();
      const expiryTime = now + (SYSTEM_CONSTANTS.OVERRIDE_HOURS * 60 * 60 * 1000);
      localStorage.setItem(SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME, expiryTime.toString());
      
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
  }, []);

  return {
    isImportBlocked,
    enableDataImport,
    setImportBlocked
  };
};
