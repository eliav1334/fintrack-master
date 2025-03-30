
import { FinanceState, FinanceAction } from "../types";

export const categoryReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case "ADD_CATEGORY": {
      const newCategory = action.payload;
      
      // אם יש מיפוי שמחכה לקטגוריה חדשה, עדכן את המיפוי
      const mappingsWithEmptyCategory = state.categoryMappings.filter(m => !m.categoryId);
      const updatedMappings = state.categoryMappings.map(mapping => 
        !mapping.categoryId ? { ...mapping, categoryId: newCategory.id } : mapping
      );
      
      return {
        ...state,
        categories: [...state.categories, newCategory],
        categoryMappings: mappingsWithEmptyCategory.length > 0 ? updatedMappings : state.categoryMappings
      };
    }
      
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((category) =>
          category.id === action.payload.id ? action.payload : category
        ),
      };
      
    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter(
          (category) => category.id !== action.payload
        ),
      };
      
    default:
      return state;
  }
};
