
import { FinanceState, FinanceAction } from "./types";

export const financeReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
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
