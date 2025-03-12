
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Transaction, CategoryType, Budget, FileImportFormat } from "@/types";

// קטגוריות ברירת מחדל
const DEFAULT_CATEGORIES: CategoryType[] = [
  { id: "cat_1", name: "משכורת", type: "income", color: "#34d399" },
  { id: "cat_2", name: "השקעות", type: "income", color: "#a78bfa" },
  { id: "cat_3", name: "מזון", type: "expense", color: "#f87171" },
  { id: "cat_4", name: "דיור", type: "expense", color: "#60a5fa" },
  { id: "cat_5", name: "תחבורה", type: "expense", color: "#fbbf24" },
  { id: "cat_6", name: "בידור", type: "expense", color: "#ec4899" },
  { id: "cat_7", name: "בריאות", type: "expense", color: "#14b8a6" },
  { id: "cat_8", name: "חשבונות", type: "expense", color: "#8b5cf6" },
  { id: "cat_9", name: "אחר", type: "expense", color: "#9ca3af" },
];

// פורמטי ייבוא ברירת מחדל
const DEFAULT_IMPORT_FORMATS: FileImportFormat[] = [
  {
    id: "format_1",
    name: "CSV כללי",
    mapping: {
      date: "תאריך",
      amount: "סכום",
      description: "תיאור",
      type: "סוג",
    },
    dateFormat: "YYYY-MM-DD",
    delimiter: ",",
    typeIdentifier: {
      column: "סוג",
      incomeValues: ["הכנסה", "זיכוי", "הפקדה"],
      expenseValues: ["הוצאה", "חיוב", "משיכה"],
    },
  },
];

type FinanceState = {
  transactions: Transaction[];
  categories: CategoryType[];
  budgets: Budget[];
  importFormats: FileImportFormat[];
  isLoading: boolean;
  error: string | null;
};

type FinanceAction =
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
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: FinanceState = {
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  budgets: [],
  importFormats: DEFAULT_IMPORT_FORMATS,
  isLoading: false,
  error: null,
};

const financeReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload.id ? action.payload : transaction
        ),
      };
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter(
          (transaction) => transaction.id !== action.payload
        ),
      };
    case "ADD_TRANSACTIONS":
      return {
        ...state,
        transactions: [...action.payload, ...state.transactions],
      };
    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((category) =>
          category.id === action.payload.id ? action.payload : category
        ),
      };
    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter(
          (category) => category.id !== action.payload
        ),
      };
    case "SET_BUDGET":
      const existingBudgetIndex = state.budgets.findIndex(
        (budget) => budget.id === action.payload.id
      );
      if (existingBudgetIndex >= 0) {
        const updatedBudgets = [...state.budgets];
        updatedBudgets[existingBudgetIndex] = action.payload;
        return {
          ...state,
          budgets: updatedBudgets,
        };
      } else {
        return {
          ...state,
          budgets: [...state.budgets, action.payload],
        };
      }
    case "DELETE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.filter((budget) => budget.id !== action.payload),
      };
    case "ADD_IMPORT_FORMAT":
      return {
        ...state,
        importFormats: [...state.importFormats, action.payload],
      };
    case "UPDATE_IMPORT_FORMAT":
      return {
        ...state,
        importFormats: state.importFormats.map((format) =>
          format.id === action.payload.id ? action.payload : format
        ),
      };
    case "DELETE_IMPORT_FORMAT":
      return {
        ...state,
        importFormats: state.importFormats.filter(
          (format) => format.id !== action.payload
        ),
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

type FinanceContextType = {
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
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  // טעינת נתונים מהאחסון המקומי בעת הרינדור הראשוני
  useEffect(() => {
    const savedState = localStorage.getItem("financeState");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.transactions) {
          dispatch({ type: "ADD_TRANSACTIONS", payload: parsedState.transactions });
        }
        if (parsedState.budgets) {
          parsedState.budgets.forEach((budget: Budget) => {
            dispatch({ type: "SET_BUDGET", payload: budget });
          });
        }
      } catch (error) {
        console.error("שגיאה בטעינת נתונים מהאחסון המקומי:", error);
      }
    }
  }, []);

  // שמירת נתונים באחסון המקומי בכל פעם שהם משתנים
  useEffect(() => {
    localStorage.setItem(
      "financeState",
      JSON.stringify({
        transactions: state.transactions,
        budgets: state.budgets,
      })
    );
  }, [state.transactions, state.budgets]);

  // יצירת מזהה ייחודי
  const generateId = (prefix: string): string => {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  };

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

  return (
    <FinanceContext.Provider
      value={{
        state,
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
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance חייב להיות בתוך FinanceProvider");
  }
  return context;
};
