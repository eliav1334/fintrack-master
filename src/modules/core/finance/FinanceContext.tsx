
import { createContext, useContext, useEffect } from "react";
import { FinanceState, FinanceContextType, FinanceActionCreators } from "./types";
import { useFinanceState } from "./hooks/useFinanceState";
import { useFinanceActions } from "./hooks/useFinanceActions";
import { financeReducer } from './reducers';
import { initialState } from './defaultValues';

// Create a context with a default value
const FinanceContext = createContext<FinanceContextType>({
  state: initialState,
  addTransaction: () => {},
  updateTransaction: () => {},
  deleteTransaction: () => {},
  addTransactions: () => {},
  addCategory: () => ({ id: "", name: "", type: "expense", color: "", icon: "" }),
  updateCategory: () => {},
  deleteCategory: () => {},
  setBudget: () => {},
  deleteBudget: () => {},
  addImportFormat: () => {},
  updateImportFormat: () => {},
  deleteImportFormat: () => {},
  addCategoryMapping: () => {},
  updateCategoryMapping: () => {},
  deleteCategoryMapping: () => {},
  setCategoryMappings: () => {},
  deleteAllIncomeTransactions: () => {},
  resetState: () => {},
  autoCategorizeTransactions: () => {},
});

// Create a provider component
export const FinanceProvider = ({ children }: { children: React.ReactNode }) => {
  const { state, dispatch } = useFinanceState();
  const actions: FinanceActionCreators = useFinanceActions(dispatch);

  // בדיקה האם ייבוא נתונים חסום והצגת מידע בקונסול
  useEffect(() => {
    const isBlocked = localStorage.getItem("data_import_blocked") === "true";
    const resetInProgress = localStorage.getItem("reset_in_progress") === "true";
    
    console.log("FinanceProvider - מצב המערכת:", {
      transactionsCount: state.transactions.length,
      categoriesCount: state.categories.length,
      budgetsCount: state.budgets.length,
      importFormatsCount: state.importFormats.length,
      isImportBlocked: isBlocked,
      isResetInProgress: resetInProgress
    });
    
    if (isBlocked) {
      console.warn("שים לב: ייבוא נתונים חסום במערכת");
    }
    
    if (resetInProgress) {
      console.warn("שים לב: איפוס מערכת בתהליך");
    }
  }, [state]);

  // Debug: Log state when provider renders
  console.log("FinanceProvider state:", state);
  console.log("Import formats in state:", state.importFormats);

  return (
    <FinanceContext.Provider value={{ state, ...actions }}>
      {children}
    </FinanceContext.Provider>
  );
};

// Create a custom hook to use the context
export const useFinance = () => {
  return useContext(FinanceContext);
};
