
import { CategoryType, Transaction, Budget, FileImportFormat } from "@/types";

export type CategoryMapping = {
  description: string;
  categoryId: string;
};

export type FinanceState = {
  transactions: Transaction[];
  categories: CategoryType[];
  budgets: Budget[];
  importFormats: FileImportFormat[];
  categoryMappings: CategoryMapping[];
  isLoading: boolean;
  error: string | null;
};

export type FinanceAction =
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "UPDATE_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "ADD_TRANSACTIONS"; payload: Transaction[] }
  | { type: "ADD_CATEGORY"; payload: CategoryType }
  | { type: "UPDATE_CATEGORY"; payload: CategoryType }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "SET_BUDGET"; payload: Budget }
  | { type: "DELETE_BUDGET"; payload: string }
  | { type: "ADD_IMPORT_FORMAT"; payload: FileImportFormat }
  | { type: "UPDATE_IMPORT_FORMAT"; payload: FileImportFormat }
  | { type: "DELETE_IMPORT_FORMAT"; payload: string }
  | { type: "ADD_CATEGORY_MAPPING"; payload: CategoryMapping }
  | { type: "UPDATE_CATEGORY_MAPPING"; payload: CategoryMapping }
  | { type: "DELETE_CATEGORY_MAPPING"; payload: string }
  | { type: "SET_CATEGORY_MAPPINGS"; payload: CategoryMapping[] }
  | { type: "DELETE_ALL_INCOME_TRANSACTIONS" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

export type FinanceContextType = {
  state: FinanceState;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addTransactions: (transactions: Omit<Transaction, "id">[]) => void;
  addCategory: (category: Omit<CategoryType, "id">) => void;
  updateCategory: (category: CategoryType) => void;
  deleteCategory: (id: string) => void;
  setBudget: (budget: Omit<Budget, "id">) => void;
  deleteBudget: (id: string) => void;
  addImportFormat: (format: Omit<FileImportFormat, "id">) => void;
  updateImportFormat: (format: FileImportFormat) => void;
  deleteImportFormat: (id: string) => void;
  addCategoryMapping: (mapping: Omit<CategoryMapping, "id">) => void;
  updateCategoryMapping: (mapping: CategoryMapping) => void;
  deleteCategoryMapping: (description: string) => void;
  deleteAllIncomeTransactions: () => void;
};
