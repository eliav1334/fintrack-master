
import { useState } from "react";
import { toast } from "sonner";
import { useFinance } from "@/contexts/FinanceContext";
// Rename the imported hook to avoid naming conflict
import { useSystemReset as useSystemResetHook } from "@/hooks/finance/storage/useSystemReset";

export const useSystemReset = () => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { resetState, deleteAllIncomeTransactions } = useFinance();
  // Use the renamed import
  const { resetAllStoredData } = useSystemResetHook();

  // פונקציה לאיפוס מלא של המערכת
  const resetFullSystem = () => {
    try {
      setIsResetting(true);
      
      // מציג הודעת טעינה
      toast.loading("מאפס את המערכת...");
      
      // וידוא שאנחנו מסמנים לדלג על הוספת הכנסות אוטומטיות, כולל סימון קבוע
      localStorage.setItem("skip_auto_incomes", "true");
      localStorage.setItem("permanent_skip_auto_incomes", "true");
      localStorage.setItem("reset_in_progress", "true");
      
      // שלב 1: מחיקת כל הנתונים ב-localStorage
      const resetSuccess = resetAllStoredData();
      
      if (!resetSuccess) {
        throw new Error("שגיאה באיפוס נתוני LocalStorage");
      }
      
      // שלב 2: מחיקת כל עסקאות ההכנסה האוטומטיות
      deleteAllIncomeTransactions();
      
      // שלב 3: איפוס ה-state במערכת
      resetState();
      
      // שלב 4: הודעה למשתמש
      toast.success("המערכת אופסה בהצלחה", {
        description: "כל הנתונים נמחקו מהמטמון והמערכת. המערכת תתרענן כדי להשלים את האיפוס."
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
    resetFullSystem
  };
};
