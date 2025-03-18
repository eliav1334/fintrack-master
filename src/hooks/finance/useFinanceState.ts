
import { useReducer } from "react";
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
  
  // טעינת נתונים מהאחסון המקומי
  const { isDataLoaded } = useDataLoading(dispatch);
  
  // ניהול הוספת הכנסות אוטומטיות
  useAutoIncomes(isDataLoaded, state.transactions.length, dispatch);
  
  // שמירת נתונים לאחסון המקומי
  useDataPersistence(state, isDataLoaded);

  return { state, dispatch };
};
