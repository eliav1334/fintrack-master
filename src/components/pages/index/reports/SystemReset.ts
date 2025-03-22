
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useFinance } from "@/contexts/FinanceContext";
import { useSystemReset as useSystemResetHook } from "@/hooks/finance/storage/useSystemReset";
import { useImportBlocker } from "@/hooks/finance/storage/useImportBlocker";

export const useSystemReset = () => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { resetState, deleteAllIncomeTransactions } = useFinance();
  const { resetAllStoredData } = useSystemResetHook();
  const { enableDataImport, isImportBlocked } = useImportBlocker();

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
    isImportBlocked,
    enableDataImport
  };
};
