
import { FinanceState, FinanceAction } from "../types";

export const categoryMappingReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case "ADD_CATEGORY_MAPPING": {
      // בדיקה אם כבר קיים מיפוי לתיאור זה
      const existingMappingIndex = state.categoryMappings.findIndex(
        mapping => mapping.description.toLowerCase() === action.payload.description.toLowerCase()
      );
      
      const mapping = action.payload;
      let updatedMappings;
      
      if (existingMappingIndex >= 0) {
        // עדכון המיפוי הקיים
        updatedMappings = [...state.categoryMappings];
        updatedMappings[existingMappingIndex] = mapping;
      } else {
        // הוספת מיפוי חדש
        updatedMappings = [...state.categoryMappings, mapping];
      }
      
      // עדכון עסקאות קיימות עם תיאור תואם שאין להן קטגוריה
      const updatedTransactions = state.transactions.map(transaction => {
        if (transaction.description.toLowerCase().includes(mapping.description.toLowerCase()) && 
            !transaction.categoryId) {
          return { ...transaction, categoryId: mapping.categoryId };
        }
        return transaction;
      });
      
      return {
        ...state,
        categoryMappings: updatedMappings,
        transactions: updatedTransactions
      };
    }
      
    case "UPDATE_CATEGORY_MAPPING": {
      const updatedMappings = state.categoryMappings.map(mapping =>
        mapping.description.toLowerCase() === action.payload.description.toLowerCase() 
          ? action.payload 
          : mapping
      );
      
      // עדכון עסקאות קיימות עם התיאור החדש
      const updatedTransactions = state.transactions.map(transaction => {
        if (transaction.description.toLowerCase().includes(action.payload.description.toLowerCase())) {
          return { ...transaction, categoryId: action.payload.categoryId };
        }
        return transaction;
      });
      
      return {
        ...state,
        categoryMappings: updatedMappings,
        transactions: updatedTransactions
      };
    }
      
    case "DELETE_CATEGORY_MAPPING":
      return {
        ...state,
        categoryMappings: state.categoryMappings.filter(
          mapping => mapping.description.toLowerCase() !== action.payload.toLowerCase()
        )
      };
      
    case "SET_CATEGORY_MAPPINGS":
      return {
        ...state,
        categoryMappings: action.payload
      };
      
    default:
      return state;
  }
};
