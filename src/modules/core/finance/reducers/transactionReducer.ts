
import { FinanceState, FinanceAction } from "../types";

export const transactionReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
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
        transactions: [...state.transactions, ...action.payload],
      };
      
    case "DELETE_ALL_INCOME_TRANSACTIONS":
      return {
        ...state,
        transactions: state.transactions.filter(
          (transaction) => transaction.type !== "income"
        ),
      };
      
    default:
      return state;
  }
};
