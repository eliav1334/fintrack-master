
import { useState } from "react";
import { toast } from "sonner";
import { useFinance } from "@/contexts/FinanceContext";
import { useMonthlyIncomes } from "@/hooks/finance/useMonthlyIncomes";

export const useSystemReset = () => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { resetState, deleteAllIncomeTransactions } = useFinance();
  const { resetAllStoredData } = useMonthlyIncomes();

  // פונקציה לאיפוס מלא של המערכת
  const resetFullSystem = () => {
    try {
      setIsResetting(true);
      
      // מציג הודעת טעינה
      toast.loading("מאפס את המערכת...");
      
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
        description: "כל הנתונים נמחקו. האפליקציה תתרענן כדי להשלים את האיפוס."
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
