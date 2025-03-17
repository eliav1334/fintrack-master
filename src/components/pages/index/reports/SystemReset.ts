
import { useState } from "react";
import { toast } from "sonner";
import { useFinance } from "@/contexts/FinanceContext";
import { useMonthlyIncomes } from "@/hooks/finance/useMonthlyIncomes";

export const useSystemReset = () => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { resetState } = useFinance();
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
      
      // שלב 2: איפוס ה-state במערכת
      resetState();
      
      // שלב 3: הודעה למשתמש
      toast.success("המערכת אופסה בהצלחה", {
        description: "כל הנתונים נמחקו. האפליקציה תתרענן עם נתונים ראשוניים בלבד."
      });
      
      // רענון הדף לאחר האיפוס
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
