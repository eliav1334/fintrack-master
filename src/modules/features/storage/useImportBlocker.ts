
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

/**
 * הוק לניהול חסימות ייבוא נתונים
 */
export const useImportBlocker = () => {
  const [isImportBlocked, setIsImportBlocked] = useState(false);

  // קבועי מערכת
  const IMPORT_OVERRIDE_HOURS = 48; // מספר שעות לדריסת חסימה
  
  // בדיקת מצב חסימת ייבוא בטעינה
  useEffect(() => {
    const checkImportBlockStatus = () => {
      const isBlocked = localStorage.getItem("data_import_blocked") === "true";
      
      // בדיקת דריסה
      const overrideTimeStr = localStorage.getItem("import_override_time");
      let isOverrideActive = false;
      
      if (overrideTimeStr) {
        try {
          const overrideTime = parseInt(overrideTimeStr, 10);
          const now = Date.now();
          
          // בדיקה אם הדריסה עדיין בתוקף (48 שעות)
          if (now - overrideTime <= IMPORT_OVERRIDE_HOURS * 60 * 60 * 1000) {
            isOverrideActive = true;
          } else {
            // הדריסה פגה תוקף
            localStorage.removeItem("import_override_time");
          }
        } catch (error) {
          console.error("שגיאה בבדיקת תוקף דריסת חסימת ייבוא:", error);
          localStorage.removeItem("import_override_time");
        }
      }
      
      // קביעת מצב חסימה
      setIsImportBlocked(isBlocked && !isOverrideActive);
    };
    
    // בדיקה ראשונית
    checkImportBlockStatus();
    
    // הגדרת בדיקה תקופתית (כל 5 שניות)
    const intervalId = setInterval(checkImportBlockStatus, 5000);
    
    // ניקוי בסגירה
    return () => clearInterval(intervalId);
  }, []);

  // פונקציה להפעלת ייבוא נתונים למרות חסימה
  const enableDataImport = useCallback(() => {
    try {
      // שמירת זמן הפעלת הדריסה
      const now = Date.now();
      localStorage.setItem("import_override_time", now.toString());
      
      // עדכון מצב חסימה
      setIsImportBlocked(false);
      
      console.log("ייבוא נתונים הופעל למרות חסימה");
      toast.success("ייבוא נתונים הופעל זמנית", {
        description: `ניתן לייבא נתונים למשך ${IMPORT_OVERRIDE_HOURS} שעות הקרובות`
      });
      
      return true;
    } catch (error) {
      console.error("שגיאה בהפעלת ייבוא נתונים:", error);
      toast.error("שגיאה בהפעלת ייבוא נתונים", {
        description: "לא ניתן היה להפעיל את ייבוא הנתונים. נסה שוב."
      });
      
      return false;
    }
  }, []);

  // פונקציה לחסימה מיידית של ייבוא נתונים
  const blockDataImport = useCallback(() => {
    try {
      // חסימת ייבוא
      localStorage.setItem("data_import_blocked", "true");
      
      // מחיקת כל דריסה קיימת
      localStorage.removeItem("import_override_time");
      
      // עדכון מצב חסימה
      setIsImportBlocked(true);
      
      console.log("ייבוא נתונים נחסם באופן מיידי");
      toast.info("ייבוא נתונים נחסם", {
        description: "לא ניתן לייבא נתונים חדשים עד שיתבצע ניקוי או איפוס"
      });
      
      return true;
    } catch (error) {
      console.error("שגיאה בחסימת ייבוא נתונים:", error);
      
      return false;
    }
  }, []);

  return {
    isImportBlocked,
    enableDataImport,
    blockDataImport
  };
};
