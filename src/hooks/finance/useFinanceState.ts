
import { useReducer, useEffect } from "react";
import { financeReducer } from "@/contexts/financeReducer";
import { initialState } from "@/contexts/defaultValues";
import { useMonthlyIncomes } from "./useMonthlyIncomes";
import { Budget, Transaction } from "@/types";
import { toast } from "sonner";

/**
 * Hook to manage finance state with localStorage persistence
 */
export const useFinanceState = () => {
  const [state, dispatch] = useReducer(financeReducer, initialState);
  const { addMonthlyIncomes, cleanMonthlyIncomes, resetAllStoredData } = useMonthlyIncomes();
  
  // איפוס נתונים - משתמשים בפונקציה להסרת הנתונים משמירה מקומית
  useEffect(() => {
    // מאפסים את כל הנתונים השמורים
    resetAllStoredData();
    
    // מאתחלים את המידע מההתחלה (לא טוענים מידע ישן)
    dispatch({ type: "RESET_STATE" });
    
    // הוספת הכנסות חודשיות קבועות לאחר איפוס
    setTimeout(() => {
      const monthlyIncomes = addMonthlyIncomes();
      dispatch({ type: "ADD_TRANSACTIONS", payload: monthlyIncomes });
      toast.success(`נוספו ${monthlyIncomes.length} עסקאות הכנסה חודשית קבועה`);
    }, 800);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "financeState",
      JSON.stringify({
        transactions: state.transactions,
        budgets: state.budgets,
        categoryMappings: state.categoryMappings
      })
    );
  }, [state.transactions, state.budgets, state.categoryMappings]);

  return { state, dispatch };
};
