
import { FinanceState, FinanceAction } from "../types";
import { initialState } from "../defaultValues";

export const systemStateReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case "RESET_STATE":
      // איפוס המערכת למצב התחלתי
      // כאן חשוב להחזיר את האובייקט החדש לגמרי ולא להשתמש במצב הקיים
      return JSON.parse(JSON.stringify(initialState));
      
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
      
    case "AUTO_CATEGORIZE_TRANSACTIONS":
      // טיפול בבקשה לקטגוריזציה אוטומטית של עסקאות
      const { description, categoryId } = action.payload;
      const updatedTransactions = state.transactions.map(transaction => {
        // בודק אם התיאור של העסקה מכיל את התיאור שמבקשים לקטגרז
        if (transaction.description.toLowerCase().includes(description.toLowerCase()) && 
            !transaction.categoryId) {
          return { ...transaction, categoryId };
        }
        return transaction;
      });
      
      return {
        ...state,
        transactions: updatedTransactions
      };
      
    default:
      return state;
  }
};
