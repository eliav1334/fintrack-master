
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
  const { addMonthlyIncomes, cleanMonthlyIncomes } = useMonthlyIncomes();

  // Load data from localStorage on first render
  useEffect(() => {
    const savedState = localStorage.getItem("financeState");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Clean all fixed monthly income transactions before loading
        const cleanedTransactions = parsedState.transactions ? 
          cleanMonthlyIncomes(parsedState.transactions) : [];
        
        // Load cleaned transactions
        if (cleanedTransactions.length > 0) {
          dispatch({ type: "ADD_TRANSACTIONS", payload: cleanedTransactions });
        }
        
        if (parsedState.budgets) {
          parsedState.budgets.forEach((budget: Budget) => {
            dispatch({ type: "SET_BUDGET", payload: budget });
          });
        }
        if (parsedState.categoryMappings) {
          dispatch({ 
            type: "SET_CATEGORY_MAPPINGS", 
            payload: parsedState.categoryMappings 
          });
        }
      } catch (error) {
        console.error("שגיאה בטעינת נתונים מהאחסון המקומי:", error);
      }
    }
    
    // Add monthly incomes after data loading (only once)
    const checkTimeout = setTimeout(() => {
      // Since we reset all fixed incomes, add them back in an organized way
      const monthlyIncomes = addMonthlyIncomes();
      dispatch({ type: "ADD_TRANSACTIONS", payload: monthlyIncomes });
      console.log(`נוספו ${monthlyIncomes.length} עסקאות הכנסה חודשית קבועה`);
      toast.success(`נוספו ${monthlyIncomes.length} עסקאות הכנסה חודשית קבועה`);
    }, 800);
    
    return () => clearTimeout(checkTimeout);
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
