
import { FinanceState, FinanceAction } from "../types";
import { initialState } from "../defaultValues";

export const systemStateReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case "RESET_STATE":
      // איפוס המערכת למצב התחלתי
      // שמירת סימון באחסון המקומי שאנחנו במצב איפוס
      localStorage.setItem("reset_in_progress", "true");
      localStorage.setItem("skip_auto_incomes", "true");
      console.log("מבצע איפוס מערכת מלא");
      
      // כאן חשוב להחזיר את האובייקט החדש לגמרי ולא להשתמש במצב הקיים
      // יצירת עותק חדש לחלוטין של ה-initialState
      const resetState = JSON.parse(JSON.stringify(initialState));
      
      // וידוא שאין עסקאות במצב ההתחלתי לאחר איפוס
      resetState.transactions = [];
      
      return resetState;
      
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
