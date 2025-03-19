
import { FinanceState, FinanceAction } from "../types";

export const transactionReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case "ADD_TRANSACTION":
      // בדיקה אם העסקה כבר קיימת
      const isDuplicateTransaction = state.transactions.some(tx => 
        tx.date === action.payload.date && 
        tx.amount === action.payload.amount && 
        tx.description === action.payload.description
      );
      
      if (isDuplicateTransaction) {
        console.log("דילוג על הוספת עסקה כפולה:", action.payload);
        return state; // אם העסקה כבר קיימת, מחזירים את המצב הנוכחי ללא שינוי
      }
      
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
      if (!Array.isArray(action.payload) || action.payload.length === 0) {
        return state;
      }
      
      // סינון עסקאות כפולות לפני הוספה
      const uniqueNewTransactions = action.payload.filter(newTx => {
        return !state.transactions.some(existingTx => 
          existingTx.date === newTx.date && 
          existingTx.amount === newTx.amount && 
          existingTx.description === newTx.description
        );
      });
      
      console.log(`הוספת ${uniqueNewTransactions.length} עסקאות חדשות (מתוך ${action.payload.length} שנקלטו)`);
      
      if (uniqueNewTransactions.length === 0) {
        return state; // אם אין עסקאות חדשות, מחזירים את המצב הנוכחי ללא שינוי
      }
      
      return {
        ...state,
        transactions: [...state.transactions, ...uniqueNewTransactions],
      };
    
    case "DELETE_ALL_INCOME_TRANSACTIONS":
      return {
        ...state,
        transactions: state.transactions.filter(tx => tx.type !== "income" || !tx.description.includes("משכורת חודשית קבועה"))
      };
      
    default:
      return state;
  }
};
