
import { useReducer, useEffect } from "react";
import { financeReducer } from "@/contexts/reducers";
import { initialState } from "@/contexts/defaultValues";
import { useDataLoading } from "./storage/useDataLoading";
import { useAutoIncomes } from "./storage/useAutoIncomes";
import { useDataPersistence } from "./storage/useDataPersistence";

/**
 * הוק לניהול מצב פיננסי עם שמירה ב-localStorage
 */
export const useFinanceState = () => {
  const [state, dispatch] = useReducer(financeReducer, initialState);
  
  // בדיקה אם יש איפוס מערכת בתהליך
  useEffect(() => {
    const isResetInProgress = localStorage.getItem("reset_in_progress") === "true";
    
    if (isResetInProgress) {
      // וידוא שהנתונים הם ריקים לאחר איפוס
      if (state.transactions.length > 0) {
        dispatch({ type: "RESET_STATE" });
      }
    }
  }, []);
  
  // טעינת נתונים מהאחסון המקומי
  const { isDataLoaded } = useDataLoading(dispatch);
  
  // ניהול הוספת הכנסות אוטומטיות (רק אם יש אישור מפורש)
  useAutoIncomes(isDataLoaded, state.transactions.length, dispatch);
  
  // שמירת נתונים לאחסון המקומי (רק אם זה לא במצב איפוס)
  useDataPersistence(state, isDataLoaded);

  return { state, dispatch };
};
