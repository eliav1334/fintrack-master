
import { FinanceState, FinanceAction } from "../types";

export const transactionReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case "ADD_TRANSACTION":
      // שיפור בדיקת עסקאות כפולות
      const isDuplicateTransaction = state.transactions.some(tx => 
        tx.date === action.payload.date && 
        Math.abs(tx.amount - action.payload.amount) < 0.01 && // השוואה עם טווח סבירות קטן 
        tx.description === action.payload.description &&
        tx.type === action.payload.type
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
        console.log("ניסיון להוסיף מערך עסקאות ריק או לא תקין");
        return state;
      }
      
      // שיפור סינון עסקאות כפולות
      const uniqueNewTransactions = action.payload.filter(newTx => {
        const isDuplicate = state.transactions.some(existingTx => 
          existingTx.date === newTx.date && 
          Math.abs(existingTx.amount - newTx.amount) < 0.01 && // השוואה עם טווח סבירות קטן
          existingTx.description === newTx.description &&
          existingTx.type === newTx.type
        );
        
        if (isDuplicate) {
          console.log("זיהוי עסקה כפולה בייבוא:", newTx);
        }
        
        return !isDuplicate;
      });
      
      console.log(`הוספת ${uniqueNewTransactions.length} עסקאות חדשות (מתוך ${action.payload.length} שנקלטו)`);
      
      if (uniqueNewTransactions.length === 0) {
        return state; // אם אין עסקאות חדשות, מחזירים את המצב הנוכחי ללא שינוי
      }
      
      // מניעת כפילות בין עסקאות שמיובאות באותה פעולה
      const seenTransactions = new Map();
      const trulyUniqueTransactions = uniqueNewTransactions.filter(tx => {
        const key = `${tx.date}_${tx.amount}_${tx.description}_${tx.type}`;
        if (seenTransactions.has(key)) {
          console.log("זיהוי כפילות בין עסקאות חדשות:", tx);
          return false;
        }
        seenTransactions.set(key, true);
        return true;
      });
      
      console.log(`הוספת ${trulyUniqueTransactions.length} עסקאות חדשות לאחר סינון סופי`);
      
      return {
        ...state,
        transactions: [...state.transactions, ...trulyUniqueTransactions],
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
