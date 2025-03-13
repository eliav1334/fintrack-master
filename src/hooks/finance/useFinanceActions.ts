
import { Transaction, CategoryType, Budget, FileImportFormat } from "@/types";
import { CategoryMapping } from "@/contexts/types";
import { generateId } from "@/utils/generateId";

/**
 * Hook for finance action creators
 */
export const useFinanceActions = (dispatch: React.Dispatch<any>) => {
  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId("tx"),
    };
    dispatch({ type: "ADD_TRANSACTION", payload: newTransaction });
  };

  const updateTransaction = (transaction: Transaction) => {
    dispatch({ type: "UPDATE_TRANSACTION", payload: transaction });
  };

  const deleteTransaction = (id: string) => {
    dispatch({ type: "DELETE_TRANSACTION", payload: id });
  };

  const addTransactions = (transactions: Omit<Transaction, "id">[]) => {
    const newTransactions: Transaction[] = transactions.map((transaction) => ({
      ...transaction,
      id: generateId("tx"),
    }));
    dispatch({ type: "ADD_TRANSACTIONS", payload: newTransactions });
  };

  const addCategory = (category: Omit<CategoryType, "id">) => {
    const newCategory: CategoryType = {
      ...category,
      id: generateId("cat"),
    };
    dispatch({ type: "ADD_CATEGORY", payload: newCategory });
  };

  const updateCategory = (category: CategoryType) => {
    dispatch({ type: "UPDATE_CATEGORY", payload: category });
  };

  const deleteCategory = (id: string) => {
    dispatch({ type: "DELETE_CATEGORY", payload: id });
  };

  const setBudget = (budget: Omit<Budget, "id">) => {
    const newBudget: Budget = {
      ...budget,
      id: generateId("budget"),
      startDate: new Date().toISOString(),
    };
    dispatch({ type: "SET_BUDGET", payload: newBudget });
  };

  const deleteBudget = (id: string) => {
    dispatch({ type: "DELETE_BUDGET", payload: id });
  };

  const addImportFormat = (format: Omit<FileImportFormat, "id">) => {
    const newFormat: FileImportFormat = {
      ...format,
      id: generateId("format"),
    };
    dispatch({ type: "ADD_IMPORT_FORMAT", payload: newFormat });
  };

  const updateImportFormat = (format: FileImportFormat) => {
    dispatch({ type: "UPDATE_IMPORT_FORMAT", payload: format });
  };

  const deleteImportFormat = (id: string) => {
    dispatch({ type: "DELETE_IMPORT_FORMAT", payload: id });
  };
  
  // New functions for managing category mappings
  const addCategoryMapping = (mapping: Omit<CategoryMapping, "id">) => {
    dispatch({ type: "ADD_CATEGORY_MAPPING", payload: mapping });
  };
  
  const updateCategoryMapping = (mapping: CategoryMapping) => {
    dispatch({ type: "UPDATE_CATEGORY_MAPPING", payload: mapping });
  };
  
  const deleteCategoryMapping = (description: string) => {
    dispatch({ type: "DELETE_CATEGORY_MAPPING", payload: description });
  };

  return {
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addTransactions,
    addCategory,
    updateCategory,
    deleteCategory,
    setBudget,
    deleteBudget,
    addImportFormat,
    updateImportFormat,
    deleteImportFormat,
    addCategoryMapping,
    updateCategoryMapping,
    deleteCategoryMapping
  };
};
