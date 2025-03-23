
import { FinanceState, FinanceAction } from "../types";

export const budgetReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case "SET_BUDGET": {
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
    }
      
    case "DELETE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.filter((budget) => budget.id !== action.payload),
      };
      
    default:
      return state;
  }
};
