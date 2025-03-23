
import { useState } from "react";
import { useFinance } from "@/modules/core/finance/FinanceContext";
import { useLocalStorage } from "@/modules/features/storage/useLocalStorage";

/**
 * הוק לניהול ניקוי נתונים במערכת
 */
export const useCleanupManager = () => {
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const { state, addTransactions } = useFinance();
  const { removeDuplicateTransactions, archiveOldTransactions } = useLocalStorage();
  
  /**
   * ביצוע ניקוי אוטומטי של נתונים ללא הצגת ממשק משתמש
   */
  const performAutoCleanup = () => {
    const transactions = [...state.transactions];
    
    // הסרת כפילויות
    const uniqueTransactions = removeDuplicateTransactions(transactions);
    
    // עדכון המערכת רק אם היו שינויים
    if (uniqueTransactions.length < transactions.length) {
      // נודיע לקונסול בלבד ללא הודעה למשתמש
      console.log(`ניקוי אוטומטי: הוסרו ${transactions.length - uniqueTransactions.length} עסקאות כפולות`);
      
      // עדכון ה-state
      addTransactions(uniqueTransactions);
      return true;
    }
    
    return false;
  };
  
  /**
   * בדיקה אם יש לבצע ניקוי
   */
  const shouldPerformCleanup = () => {
    // אם יש יותר מ-5000 עסקאות, נמליץ לנקות
    return state.transactions.length > 5000;
  };
  
  return {
    showCleanupDialog,
    setShowCleanupDialog,
    performAutoCleanup,
    shouldPerformCleanup
  };
};
