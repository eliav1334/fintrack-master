
import { FinanceState, FinanceAction } from "../types";

export const categoryMappingReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case "ADD_CATEGORY_MAPPING": {
      // בדיקה אם כבר קיים מיפוי לתיאור זה
      const existingMappingIndex = state.categoryMappings.findIndex(
        mapping => mapping.description.toLowerCase() === action.payload.description.toLowerCase()
      );
      
      if (existingMappingIndex >= 0) {
        // עדכון המיפוי הקיים
        const updatedMappings = [...state.categoryMappings];
        updatedMappings[existingMappingIndex] = action.payload;
        return {
          ...state,
          categoryMappings: updatedMappings
        };
      } else {
        // הוספת מיפוי חדש
        return {
          ...state,
          categoryMappings: [...state.categoryMappings, action.payload]
        };
      }
    }
      
    case "UPDATE_CATEGORY_MAPPING":
      return {
        ...state,
        categoryMappings: state.categoryMappings.map(mapping =>
          mapping.description.toLowerCase() === action.payload.description.toLowerCase() ? action.payload : mapping
        )
      };
      
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
