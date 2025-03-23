
import { useEffect, useState } from "react";
import { FinanceAction } from "@/modules/core/finance/types";
import { toast } from "sonner";

/**
 * הוק לניהול הכנסות אוטומטיות
 */
export const useAutoIncomes = (
  isDataLoaded: boolean,
  transactionsCount: number,
  dispatch: React.Dispatch<FinanceAction>
) => {
  const [skipAutoIncomes, setSkipAutoIncomes] = useState(true);

  // בדיקה בטעינה אם יש לדלג על הוספת הכנסות אוטומטיות
  useEffect(() => {
    const shouldSkipAutoIncomes = localStorage.getItem("skip_auto_incomes") === "true";
    const permanentlySkipAutoIncomes = localStorage.getItem("permanent_skip_auto_incomes") === "true";
    
    // ברירת מחדל - לדלג על הוספת הכנסות אוטומטיות
    let shouldSkip = true;
    
    // אם המשתמש הפעיל במפורש את התכונה של הוספת הכנסות אוטומטיות
    const userEnabledAutoIncomes = localStorage.getItem("enable_auto_incomes") === "true";
    
    if (userEnabledAutoIncomes && !permanentlySkipAutoIncomes && !shouldSkipAutoIncomes) {
      shouldSkip = false;
    }
    
    // אם יש הגדרה קבועה לדלג על הכנסות אוטומטיות, נשמור אותה
    if (permanentlySkipAutoIncomes) {
      console.log("זוהתה הגדרה קבועה לדילוג על הכנסות אוטומטיות");
      shouldSkip = true;
    }
    
    if (shouldSkipAutoIncomes) {
      console.log("זוהה מצב דילוג על הכנסות אוטומטיות");
      localStorage.removeItem("skip_auto_incomes");
      shouldSkip = true;
    }
    
    setSkipAutoIncomes(shouldSkip);
  }, []);

  // טיפול בהוספת הכנסות חודשיות בהתבסס על מצב הטעינה
  useEffect(() => {
    // בודק אם יש הגדרת איפוס קבוע
    const permanentlySkipAutoIncomes = localStorage.getItem("permanent_skip_auto_incomes") === "true";
    
    if (isDataLoaded && !skipAutoIncomes && transactionsCount === 0 && !permanentlySkipAutoIncomes) {
      console.log("מוסיף הכנסות חודשיות קבועות");
      
      // במקום להשתמש בפונקציית הכנסות חודשיות מלאה, כאן נשתמש בגרסה פשוטה
      setTimeout(() => {
        // יצירת הכנסות חודשיות בסיסיות לדוגמה
        const dummyMonthlyIncomes = [
          {
            id: `income_${Date.now()}_1`,
            amount: 10000,
            date: new Date().toISOString(),
            description: "משכורת חודשית",
            type: "income",
            paymentMethod: "bank",
            categoryId: "salary"
          }
        ];
        
        if (dummyMonthlyIncomes.length > 0) {
          dispatch({ type: "ADD_TRANSACTIONS", payload: dummyMonthlyIncomes });
          toast.success(`נוספו ${dummyMonthlyIncomes.length} עסקאות הכנסה חודשית קבועה`);
        }
      }, 800);
    } else {
      console.log("דילוג על הוספת הכנסות אוטומטיות", {
        isDataLoaded,
        skipAutoIncomes,
        transactionsCount,
        permanentlySkipAutoIncomes
      });
    }
  }, [isDataLoaded, skipAutoIncomes, transactionsCount, dispatch]);

  return { skipAutoIncomes };
};
