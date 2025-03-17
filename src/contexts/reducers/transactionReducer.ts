
import { FinanceState, FinanceAction } from "../types";

export const transactionReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case "ADD_TRANSACTION": {
      // עדכון שיוך קטגוריה אוטומטי אם אין קטגוריה
      let transaction = action.payload;
      if (!transaction.categoryId) {
        // חיפוש קטגוריה לפי תיאור
        const mapping = state.categoryMappings.find(
          m => transaction.description.toLowerCase().includes(m.description.toLowerCase())
        );
        if (mapping) {
          transaction = { ...transaction, categoryId: mapping.categoryId };
        }
      }
      
      return {
        ...state,
        transactions: [transaction, ...state.transactions],
      };
    }
      
    case "UPDATE_TRANSACTION": {
      // אם מעדכנים קטגוריה לעסקה, נשמור את המיפוי
      const updatedTransaction = action.payload;
      const existingTransaction = state.transactions.find(t => t.id === updatedTransaction.id);
      
      if (existingTransaction && 
          updatedTransaction.categoryId && 
          existingTransaction.categoryId !== updatedTransaction.categoryId) {
        // בדיקה אם אנחנו צריכים להוסיף מיפוי חדש
        const existingMapping = state.categoryMappings.find(
          m => m.description.toLowerCase() === updatedTransaction.description.toLowerCase()
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
    }
      
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
      
    case "ADD_TRANSACTIONS": {
      // עדכון שיוך קטגוריות אוטומטי למספר עסקאות
      const enhancedTransactions = action.payload.map(transaction => {
        if (!transaction.categoryId) {
          // חיפוש קטגוריה לפי תיאור
          const mapping = state.categoryMappings.find(
            m => transaction.description.toLowerCase().includes(m.description.toLowerCase())
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
    }

    case "AUTO_CATEGORIZE_TRANSACTIONS": {
      // עדכון שיוך קטגוריה אוטומטי לכל העסקאות עם תיאור מסוים
      const { description, categoryId } = action.payload;
      
      const updatedTransactions = state.transactions.map(transaction => {
        if (transaction.description.toLowerCase().includes(description.toLowerCase()) && 
            !transaction.categoryId) {
          return { ...transaction, categoryId };
        }
        return transaction;
      });
      
      return {
        ...state,
        transactions: updatedTransactions,
      };
    }
      
    default:
      return state;
  }
};
