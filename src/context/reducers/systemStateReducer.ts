
import { FinanceState, FinanceAction } from "../types";
import { initialState } from "../defaultValues";

export const systemStateReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case "RESET_STATE":
      // איפוס המערכת למצב התחלתי
      // סימון מפורש שאנחנו במצב איפוס ושיש לדלג על הוספת הכנסות אוטומטיות
      localStorage.setItem("reset_in_progress", "true");
      localStorage.setItem("skip_auto_incomes", "true");
      localStorage.setItem("permanent_skip_auto_incomes", "true");
      
      // מחיקת הנתונים מ-localStorage
      const itemsToKeep = ["permanent_skip_auto_incomes", "reset_in_progress", "skip_auto_incomes"];
      
      // שמירת המצב הנוכחי של פריטים שרוצים לשמור
      const preservedItems: Record<string, string | null> = {};
      itemsToKeep.forEach(key => {
        preservedItems[key] = localStorage.getItem(key);
      });
      
      // ניקוי כל הנתונים מ-localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !itemsToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      }
      
      // שחזור הפריטים שרצינו לשמור
      Object.entries(preservedItems).forEach(([key, value]) => {
        if (value) {
          localStorage.setItem(key, value);
        }
      });
      
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
