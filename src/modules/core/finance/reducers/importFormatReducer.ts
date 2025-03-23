
import { FinanceState, FinanceAction } from "../types";

export const importFormatReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case "ADD_IMPORT_FORMAT":
      // Log the new format being added
      console.log("Adding new import format:", action.payload);
      
      // Ensure we're not adding a duplicate format
      const formatExists = state.importFormats.some(
        format => format.name === action.payload.name
      );
      
      if (formatExists) {
        console.warn("Import format with this name already exists:", action.payload.name);
        return state;
      }
      
      return {
        ...state,
        importFormats: [...state.importFormats, action.payload],
      };
      
    case "UPDATE_IMPORT_FORMAT":
      console.log("Updating import format:", action.payload);
      return {
        ...state,
        importFormats: state.importFormats.map((format) =>
          format.id === action.payload.id ? action.payload : format
        ),
      };
      
    case "DELETE_IMPORT_FORMAT":
      console.log("Deleting import format with ID:", action.payload);
      return {
        ...state,
        importFormats: state.importFormats.filter(
          (format) => format.id !== action.payload
        ),
      };
      
    default:
      return state;
  }
};
