
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useFinance } from "@/modules/core/finance/FinanceContext";
import { useImportBlocker } from "./useImportBlocker";

/**
 * הוק ייעודי לאיפוס המערכת
 */
export const useSystemReset = () => {
  // state לניהול הדיאלוג ומצב האיפוס
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { resetState, deleteAllIncomeTransactions } = useFinance();
  const { enableDataImport, isImportBlocked } = useImportBlocker();

  /**
   * איפוס כל הנתונים השמורים ב-localStorage
   */
  const resetAllStoredData = ({ 
    keepBackups = true, 
    blockImport = true 
  } = {}) => {
    try {
      // שמירת גיבוי לפני האיפוס
      const currentData = localStorage.getItem("financeState");
      if (currentData && keepBackups) {
        const timestamp = new Date().toISOString();
        localStorage.setItem(`financeState_backup_${timestamp}`, currentData);
      }

      // מחיקת מאפייני המערכת
      const localStorageKeys = [
        "financeState",
        "skip_auto_incomes",
        "lastImportDate",
        "skip_auto_incomes_from",
        "last_seen_reset_warning",
        "temp_import_data"
      ];

      // אם רוצים לחסום ייבוא - שמים דגל לחסימה
      if (blockImport) {
        localStorage.setItem("data_import_blocked", "true");
      } else {
        localStorage.removeItem("data_import_blocked");
      }

      // שימור נתוני קטגוריות וגיבויים אוטומטיים
      const categories = localStorage.getItem("categories");
      const mappings = localStorage.getItem("categoryMappings");

      // מחיקת נתונים ספציפיים
      localStorageKeys.forEach(key => localStorage.removeItem(key));

      // שחזור קטגוריות אם היו
      if (categories) {
        localStorage.setItem("categories", categories);
      }

      if (mappings) {
        localStorage.setItem("categoryMappings", mappings);
      }

      return true;
    } catch (error) {
      console.error("שגיאה באיפוס נתוני localStorage:", error);
      return false;
    }
  };

  // פונקציה לאיפוס מלא של המערכת אך עם שמירת גיבויים
  const resetFullSystem = () => {
    try {
      // סימון מצב איפוס
      setIsResetting(true);
      
      // מציג הודעת טעינה
      toast.loading("מאפס את המערכת...");
      
      // וידוא שאנחנו מסמנים לדלג על הוספת הכנסות אוטומטיות
      localStorage.setItem("skip_auto_incomes", "true");
      localStorage.setItem("permanent_skip_auto_incomes", "true");
      localStorage.setItem("reset_in_progress", "true");
      
      // אנחנו מסירים את חסימת הייבוא כחלק מהאיפוס
      localStorage.removeItem("data_import_blocked");
      
      // שלב 1: מחיקת נתונים ב-localStorage עם שמירת גיבויים
      // ללא חסימת ייבוא אוטומטית
      const resetSuccess = resetAllStoredData({ 
        keepBackups: true,
        blockImport: false // חשוב - לא חוסמים ייבוא באיפוס
      });
      
      if (!resetSuccess) {
        throw new Error("שגיאה באיפוס נתוני LocalStorage");
      }
      
      // שלב 2: מחיקת כל עסקאות ההכנסה האוטומטיות
      deleteAllIncomeTransactions();
      
      // שלב 3: איפוס ה-state במערכת
      resetState();
      
      // מפעילים ייבוא נתונים מחדש אוטומטית
      try {
        // שימוש בפונקציה המשופרת להפעלת ייבוא נתונים
        enableDataImport();
        console.log("SystemReset - import enabled as part of reset");
      } catch (err) {
        console.error("שגיאה בהפעלת ייבוא נתונים כחלק מאיפוס:", err);
      }
      
      // שלב 4: הודעה למשתמש
      toast.success("המערכת אופסה בהצלחה", {
        description: "הנתונים נמחקו אך הגיבויים נשמרו. המערכת תתרענן כדי להשלים את האיפוס."
      });
      
      // רענון הדף לאחר האיפוס להבטחת איפוס מלא
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
      // סגירת הדיאלוג
      setShowResetDialog(false);
    } catch (error) {
      console.error("שגיאה באיפוס המערכת:", error);
      toast.error("שגיאה באיפוס המערכת", {
        description: "לא ניתן היה לאפס את המערכת. נסה שוב או פנה לתמיכה טכנית."
      });
    } finally {
      // סיום מצב האיפוס וסגירת הודעת הטעינה
      setIsResetting(false);
      toast.dismiss();
    }
  };

  return {
    showResetDialog,
    setShowResetDialog,
    isResetting,
    resetFullSystem,
    resetAllStoredData,
    isImportBlocked,
    enableDataImport
  };
};
