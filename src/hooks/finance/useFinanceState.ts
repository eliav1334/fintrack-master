
import { useReducer, useEffect } from "react";
import { financeReducer } from "@/contexts/financeReducer";
import { initialState } from "@/contexts/defaultValues";
import { useMonthlyIncomes } from "./useMonthlyIncomes";
import { Budget, Transaction } from "@/types";
import { toast } from "sonner";

/**
 * הוק לניהול מצב פיננסי עם שמירה ב-localStorage
 */
export const useFinanceState = () => {
  const [state, dispatch] = useReducer(financeReducer, initialState);
  const { addMonthlyIncomes, cleanMonthlyIncomes, resetAllStoredData } = useMonthlyIncomes();
  
  // טעינת נתונים מ-localStorage בעת האתחול
  useEffect(() => {
    // ניסיון לטעון נתונים שמורים
    const savedData = localStorage.getItem("financeState");
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // עדכון ה-state עם הנתונים השמורים
        if (parsedData.transactions) {
          dispatch({ type: "ADD_TRANSACTIONS", payload: parsedData.transactions });
        }
        if (parsedData.budgets) {
          parsedData.budgets.forEach((budget: Budget) => {
            dispatch({ type: "SET_BUDGET", payload: budget });
          });
        }
        if (parsedData.categoryMappings) {
          dispatch({ type: "SET_CATEGORY_MAPPINGS", payload: parsedData.categoryMappings });
        }
        
        console.log("נטענו נתונים מהאחסון המקומי:", parsedData);
      } catch (error) {
        console.error("שגיאה בטעינת נתונים מהאחסון המקומי:", error);
        resetAllStoredData();
      }
    } else {
      // אם אין נתונים שמורים, יצירת הכנסות חודשיות קבועות
      console.log("אין נתונים שמורים, מוסיף הכנסות חודשיות קבועות");
      setTimeout(() => {
        const monthlyIncomes = addMonthlyIncomes();
        dispatch({ type: "ADD_TRANSACTIONS", payload: monthlyIncomes });
        toast.success(`נוספו ${monthlyIncomes.length} עסקאות הכנסה חודשית קבועה`);
      }, 800);
    }
  }, []);

  // שמירת נתונים ב-localStorage בכל שינוי
  useEffect(() => {
    try {
      localStorage.setItem(
        "financeState",
        JSON.stringify({
          transactions: state.transactions,
          budgets: state.budgets,
          categoryMappings: state.categoryMappings
        })
      );
    } catch (error) {
      console.error("שגיאה בשמירת נתונים לאחסון מקומי:", error);
      toast.error("שגיאה בשמירת נתונים");
    }
  }, [state.transactions, state.budgets, state.categoryMappings]);

  return { state, dispatch };
};
