
import { useEffect, useState } from "react";
import { useMonthlyIncomes } from "../useMonthlyIncomes";
import { FinanceAction } from "@/contexts/types";

/**
 * הוק לניהול הכנסות אוטומטיות
 */
export const useAutoIncomes = (
  isDataLoaded: boolean,
  transactionsCount: number,
  dispatch: React.Dispatch<FinanceAction>
) => {
  const [skipAutoIncomes, setSkipAutoIncomes] = useState(false);
  const { addMonthlyIncomes } = useMonthlyIncomes();

  // בדיקה בטעינה אם יש לדלג על הוספת הכנסות אוטומטיות
  useEffect(() => {
    const shouldSkipAutoIncomes = localStorage.getItem("skip_auto_incomes") === "true";
    const permanentlySkipAutoIncomes = localStorage.getItem("permanent_skip_auto_incomes") === "true";
    
    // אם יש הגדרה קבועה לדלג על הכנסות אוטומטיות, נשמור אותה
    if (permanentlySkipAutoIncomes) {
      console.log("זוהתה הגדרה קבועה לדילוג על הכנסות אוטומטיות");
      setSkipAutoIncomes(true);
    }
    
    if (shouldSkipAutoIncomes) {
      console.log("זוהה מצב דילוג על הכנסות אוטומטיות");
      localStorage.removeItem("skip_auto_incomes");
      setSkipAutoIncomes(true);
    }
  }, []);

  // טיפול בהוספת הכנסות חודשיות בהתבסס על מצב הטעינה
  useEffect(() => {
    // בודק אם יש הגדרת איפוס קבוע
    const permanentlySkipAutoIncomes = localStorage.getItem("permanent_skip_auto_incomes") === "true";
    
    if (isDataLoaded && !skipAutoIncomes && transactionsCount === 0 && !permanentlySkipAutoIncomes) {
      console.log("מוסיף הכנסות חודשיות קבועות");
      setTimeout(() => {
        const monthlyIncomes = addMonthlyIncomes();
        dispatch({ type: "ADD_TRANSACTIONS", payload: monthlyIncomes });
        if (monthlyIncomes.length > 0) {
          import("sonner").then(({ toast }) => {
            toast.success(`נוספו ${monthlyIncomes.length} עסקאות הכנסה חודשית קבועה`);
          });
        }
      }, 800);
    }
  }, [isDataLoaded, skipAutoIncomes, transactionsCount, dispatch, addMonthlyIncomes]);

  return { skipAutoIncomes };
};
