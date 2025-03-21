
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useFinance } from "@/contexts/FinanceContext";
import { useSystemReset as useSystemResetHook } from "@/hooks/finance/storage/useSystemReset";

export const useSystemReset = () => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isImportBlocked, setIsImportBlocked] = useState(false);
  const { resetState, deleteAllIncomeTransactions } = useFinance();
  const { resetAllStoredData, enableDataImport, isImportBlocked: checkIfImportBlocked } = useSystemResetHook();

  // בדיקה האם ייבוא הנתונים חסום - פעם אחת בעת טעינת הקומפוננטה
  useEffect(() => {
    const blocked = checkIfImportBlocked();
    setIsImportBlocked(blocked);
    // אין תלויות - פעם אחת בטעינה בלבד
  }, []);

  // פונקציה להפעלת ייבוא נתונים מחדש
  const handleEnableDataImport = () => {
    try {
      enableDataImport();
      toast.success("ייבוא נתונים הופעל מחדש ל-48 שעות");
      setIsImportBlocked(false);
    } catch (error) {
      console.error("שגיאה בהפעלת ייבוא נתונים:", error);
      toast.error("שגיאה בהפעלת ייבוא נתונים");
    }
  };

  // פונקציה לאיפוס מלא של המערכת אך עם שמירת גיבויים
  const resetFullSystem = () => {
    try {
      setIsResetting(true);
      
      // מציג הודעת טעינה
      toast.loading("מאפס את המערכת...");
      
      // וידוא שאנחנו מסמנים לדלג על הוספת הכנסות אוטומטיות, כולל סימון קבוע
      localStorage.setItem("skip_auto_incomes", "true");
      localStorage.setItem("permanent_skip_auto_incomes", "true");
      localStorage.setItem("reset_in_progress", "true");
      
      // שלב 1: מחיקת נתונים ב-localStorage עם שמירת גיבויים
      // ללא חסימת ייבוא אוטומטית
      const resetSuccess = resetAllStoredData({ 
        keepBackups: true,
        blockImport: false
      });
      
      if (!resetSuccess) {
        throw new Error("שגיאה באיפוס נתוני LocalStorage");
      }
      
      // שלב 2: מחיקת כל עסקאות ההכנסה האוטומטיות
      deleteAllIncomeTransactions();
      
      // שלב 3: איפוס ה-state במערכת
      resetState();
      
      // שלב 4: הודעה למשתמש
      toast.success("המערכת אופסה בהצלחה", {
        description: "הנתונים נמחקו אך הגיבויים נשמרו. המערכת תתרענן כדי להשלים את האיפוס."
      });
      
      // רענון הדף לאחר האיפוס להבטחת איפוס מלא
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
      setShowResetDialog(false);
    } catch (error) {
      console.error("שגיאה באיפוס המערכת:", error);
      toast.error("שגיאה באיפוס המערכת", {
        description: "לא ניתן היה לאפס את המערכת. נסה שוב או פנה לתמיכה טכנית."
      });
    } finally {
      setIsResetting(false);
      toast.dismiss();
    }
  };

  return {
    showResetDialog,
    setShowResetDialog,
    isResetting,
    resetFullSystem,
    enableDataImport: handleEnableDataImport,
    isImportBlocked
  };
};
