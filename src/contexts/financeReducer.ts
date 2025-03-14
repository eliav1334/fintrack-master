
import { FinanceState, FinanceAction } from "./types";
import { initialState } from "./defaultValues";

export const financeReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case "RESET_STATE":
      // איפוס המערכת למצב התחלתי
      return { ...initialState };
    case "ADD_TRANSACTION":
      // עדכון שיוך קטגוריה אוטומטי אם אין קטגוריה
      let transaction = action.payload;
      if (!transaction.categoryId) {
        // חיפוש קטגוריה לפי תיאור
        const mapping = state.categoryMappings.find(
          m => transaction.description.includes(m.description)
        );
        if (mapping) {
          transaction = { ...transaction, categoryId: mapping.categoryId };
        }
      }
      
      return {
        ...state,
        transactions: [transaction, ...state.transactions],
      };
    case "UPDATE_TRANSACTION":
      // אם מעדכנים קטגוריה לעסקה, נשמור את המיפוי
      const updatedTransaction = action.payload;
      const existingTransaction = state.transactions.find(t => t.id === updatedTransaction.id);
      
      if (existingTransaction && 
          updatedTransaction.categoryId && 
          existingTransaction.categoryId !== updatedTransaction.categoryId) {
        // בדיקה אם אנחנו צריכים להוסיף מיפוי חדש
        const existingMapping = state.categoryMappings.find(
          m => m.description === updatedTransaction.description
        );
        
        if (!existingMapping && updatedTransaction.description) {
          // הוספת מיפוי חדש
          const newMapping = {
            description: updatedTransaction.description,
            categoryId: updatedTransaction.categoryId
          };
          
          return {
            ...state,
            transactions: state.transactions.map((transaction) =>
              transaction.id === updatedTransaction.id ? updatedTransaction : transaction
            ),
            categoryMappings: [...state.categoryMappings, newMapping]
          };
        }
      }
      
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
    case "DELETE_ALL_INCOME_TRANSACTIONS":
      return {
        ...state,
        transactions: state.transactions.filter(
          (transaction) => transaction.type !== "income"
        ),
      };
    case "ADD_TRANSACTIONS":
      // עדכון שיוך קטגוריות אוטומטי למספר עסקאות
      const enhancedTransactions = action.payload.map(transaction => {
        if (!transaction.categoryId) {
          // חיפוש קטגוריה לפי תיאור
          const mapping = state.categoryMappings.find(
            m => transaction.description.includes(m.description)
          );
          if (mapping) {
            return { ...transaction, categoryId: mapping.categoryId };
          }
        }
        return transaction;
      });
      
      return {
        ...state,
        transactions: [...enhancedTransactions, ...state.transactions],
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
    case "ADD_CATEGORY_MAPPING":
      // בדיקה אם כבר קיים מיפוי לתיאור זה
      const existingMappingIndex = state.categoryMappings.findIndex(
        mapping => mapping.description === action.payload.description
      );
      
      if (existingMappingIndex >= 0) {
        // עדכון המיפוי הקיים
        const updatedMappings = [...state.categoryMappings];
        updatedMappings[existingMappingIndex] = action.payload;
        return {
          ...state,
          categoryMappings: updatedMappings
        };
      } else {
        // הוספת מיפוי חדש
        return {
          ...state,
          categoryMappings: [...state.categoryMappings, action.payload]
        };
      }
    case "UPDATE_CATEGORY_MAPPING":
      return {
        ...state,
        categoryMappings: state.categoryMappings.map(mapping =>
          mapping.description === action.payload.description ? action.payload : mapping
        )
      };
    case "DELETE_CATEGORY_MAPPING":
      return {
        ...state,
        categoryMappings: state.categoryMappings.filter(
          mapping => mapping.description !== action.payload
        )
      };
    case "SET_CATEGORY_MAPPINGS":
      return {
        ...state,
        categoryMappings: action.payload
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
