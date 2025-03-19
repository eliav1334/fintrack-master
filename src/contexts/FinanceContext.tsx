
import { createContext, useContext } from "react";
import { FinanceState, FinanceContextType, FinanceActionCreators } from "./types";
import { useFinanceState } from "@/hooks/finance/useFinanceState";
import { useFinanceActions } from "@/hooks/finance/useFinanceActions";
// Import from the new location
import { financeReducer } from './reducers';

// Initial state with default values including at least one format
const initialState: FinanceState = {
  transactions: [],
  categories: [],
  budgets: [],
  isLoading: false,
  error: null,
  importFormats: [],
  categoryMappings: [],
};

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
