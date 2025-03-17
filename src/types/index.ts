export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: TransactionType;
  categoryId: string;
  notes?: string;
  cardNumber?: string;
  isInstallment?: boolean;
  installmentDetails?: InstallmentDetails;
  transactionCode?: string;
  businessCategory?: string;
  businessIdentifier?: string;
  originalAmount?: number;
  isElectricityBill?: boolean;
  mainMeterReading?: {
    current: number;
    previous: number;
    date: string;
  };
  secondaryMeterReading?: {
    current: number;
    previous: number;
    date: string;
  };
  electricityRate?: number;
  vatRate?: number;
  sheetName?: string;
  createdAt?: string;
}

export interface CategoryType {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  startDate: string;
  endDate?: string;
  period?: "daily" | "weekly" | "monthly" | "yearly";
}

export interface InstallmentDetails {
  installmentNumber: number;
  totalInstallments: number;
  originalTransactionDate?: string;
  totalAmount?: number;
  currentInstallment?: number;
  remainingAmount?: number;
  installmentDate?: string;
}

export interface FinanceState {
  transactions: Transaction[];
  categories: CategoryType[];
  budgets: Budget[];
  importFormats: FileImportFormat[];
  categoryMappings: CategoryMapping[];
  isLoading: boolean;
  error: string | null;
}

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
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_IMPORT_FORMAT"; payload: FileImportFormat }
  | { type: "UPDATE_IMPORT_FORMAT"; payload: FileImportFormat }
  | { type: "DELETE_IMPORT_FORMAT"; payload: string }
  | { type: "ADD_CATEGORY_MAPPING"; payload: CategoryMapping }
  | { type: "UPDATE_CATEGORY_MAPPING"; payload: CategoryMapping }
  | { type: "DELETE_CATEGORY_MAPPING"; payload: string }
  | { type: "SET_CATEGORY_MAPPINGS"; payload: CategoryMapping[] }
  | { type: "DELETE_ALL_INCOME_TRANSACTIONS" }
  | { type: "RESET_STATE" };

export interface FinanceContextType {
  state: FinanceState;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addTransactions: (transactions: Transaction[]) => void;
  addCategory: (category: CategoryType) => void;
  updateCategory: (category: CategoryType) => void;
  deleteCategory: (id: string) => void;
  setBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  addImportFormat: (format: FileImportFormat) => void;
  updateImportFormat: (format: FileImportFormat) => void;
  deleteImportFormat: (id: string) => void;
  addCategoryMapping: (mapping: CategoryMapping) => void;
  updateCategoryMapping: (mapping: CategoryMapping) => void;
  deleteCategoryMapping: (description: string) => void;
  setCategoryMappings: (mappings: CategoryMapping[]) => void;
  deleteAllIncomeTransactions: () => void;
  resetState: () => void;
}

export interface FinanceActionCreators {
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addTransactions: (transactions: Transaction[]) => void;
  addCategory: (category: CategoryType) => void;
  updateCategory: (category: CategoryType) => void;
  deleteCategory: (id: string) => void;
  setBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  addImportFormat: (format: FileImportFormat) => void;
  updateImportFormat: (format: FileImportFormat) => void;
  deleteImportFormat: (id: string) => void;
  addCategoryMapping: (mapping: CategoryMapping) => void;
  updateCategoryMapping: (mapping: CategoryMapping) => void;
  deleteCategoryMapping: (description: string) => void;
  setCategoryMappings: (mappings: CategoryMapping[]) => void;
  deleteAllIncomeTransactions: () => void;
  resetState: () => void;
}

export interface CategoryMapping {
  description: string;
  categoryId: string;
}

export interface FileImportFormat {
  id: string;
  name: string;
  mapping: {
    date: string;
    amount: string;
    description: string;
    type?: string;
    category?: string;
    cardNumber?: string;
    totalAmount?: string;
    installmentNumber?: string;
    totalInstallments?: string;
    originalTransactionDate?: string;
    chargeDate?: string;
    transactionCode?: string;
    businessCategory?: string;
    businessIdentifier?: string;
  };
  dateFormat?: string;
  delimiter?: string;
  skipEmptyRows?: boolean;
  headerRowIndex?: number;
  sheetSupport?: boolean;
  sheetSelection?: {
    type: "all" | "specific" | "select";
    names?: string[];
  };
  typeIdentifier?: {
    column: string;
    incomeValues: string[];
    expenseValues: string[];
    creditCardLogic?: boolean;
  };
  installmentIdentifier?: {
    pattern: string;
    installmentPattern?: string;
    totalInstallmentsPattern?: string;
  };
  creditCardFormat?: boolean;
}
