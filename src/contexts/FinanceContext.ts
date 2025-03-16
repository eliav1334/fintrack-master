import { createContext, useContext } from "react";
import { FinanceState, FinanceContextType, FinanceActionCreators } from "./types";
import { useFinanceState } from "@/hooks/finance/useFinanceState";
import { useFinanceActions } from "@/hooks/finance/useFinanceActions";
// Import from the new location
import { financeReducer } from './reducers';

// Create a context with a default value
const FinanceContext = createContext<FinanceContextType>({
  state: {
    transactions: [],
    categories: [],
    budgets: [],
    isLoading: false,
    error: null,
    importFormats: [],
    categoryMappings: [],
  },
  addTransaction: () => {},
  updateTransaction: () => {},
  deleteTransaction: () => {},
  addTransactions: () => {},
  addCategory: () => {},
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
});

// Create a provider component
export const FinanceProvider = ({ children }: { children: React.ReactNode }) => {
  const { state, dispatch } = useFinanceState();
  const actions: FinanceActionCreators = useFinanceActions(dispatch);

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
