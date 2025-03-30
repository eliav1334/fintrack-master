
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
      
      // מניעת כפילויות - נשמור רשימה של עסקאות קיימות וחדשות מסוננות
      const existingTransactionMap = new Map();
      const transactionKeys = new Set();
      
      // יצירת מפה של כל העסקאות הקיימות
      state.transactions.forEach(tx => {
        const key = `${tx.date}_${tx.amount}_${tx.description}_${tx.type}`;
        existingTransactionMap.set(key, true);
        
        // שמירת מפתחות מורחבים אם יש מידע נוסף
        if (tx.transactionCode) {
          existingTransactionMap.set(`${key}_${tx.transactionCode}`, true);
        }
        if (tx.cardNumber) {
          existingTransactionMap.set(`${key}_${tx.cardNumber}`, true);
        }
        if (tx.isInstallment && tx.installmentDetails) {
          existingTransactionMap.set(
            `${key}_${tx.installmentDetails.installmentNumber}_${tx.installmentDetails.totalInstallments}`,
            true
          );
        }
      });
      
      // סינון עסקאות חדשות שאינן כפולות
      const uniqueNewTransactions = action.payload.filter(newTx => {
        // יצירת מפתח בסיסי
        const key = `${newTx.date}_${newTx.amount}_${newTx.description}_${newTx.type}`;
        
        // בדיקה אם העסקה כבר קיימת בנתונים הקיימים
        if (existingTransactionMap.has(key)) {
          console.log("דילוג על עסקה כפולה:", newTx.description);
          return false;
        }
        
        // בדיקת מפתחות מורחבים
        if (newTx.transactionCode && existingTransactionMap.has(`${key}_${newTx.transactionCode}`)) {
          console.log("דילוג על עסקה כפולה (לפי קוד עסקה):", newTx.description);
          return false;
        }
        
        if (newTx.cardNumber && existingTransactionMap.has(`${key}_${newTx.cardNumber}`)) {
          console.log("דילוג על עסקה כפולה (לפי מספר כרטיס):", newTx.description);
          return false;
        }
        
        if (newTx.isInstallment && newTx.installmentDetails) {
          const installmentKey = `${key}_${newTx.installmentDetails.installmentNumber}_${newTx.installmentDetails.totalInstallments}`;
          if (existingTransactionMap.has(installmentKey)) {
            console.log("דילוג על עסקה כפולה (לפי פרטי תשלומים):", newTx.description);
            return false;
          }
        }
        
        // בדיקה לכפילויות בין העסקאות החדשות עצמן
        if (transactionKeys.has(key)) {
          console.log("דילוג על עסקה כפולה בין העסקאות החדשות:", newTx.description);
          return false;
        }
        
        // שמירת המפתח לבדיקת כפילויות בין העסקאות החדשות
        transactionKeys.add(key);
        
        // העסקה ייחודית
        return true;
      });
      
      console.log(`מוסיף ${uniqueNewTransactions.length} עסקאות חדשות ייחודיות מתוך ${action.payload.length} שהתקבלו`);
      
      if (uniqueNewTransactions.length === 0) {
        console.log("אין עסקאות חדשות להוספה");
        return state;
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
