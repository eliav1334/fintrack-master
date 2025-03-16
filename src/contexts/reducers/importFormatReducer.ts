
import { FinanceState, FinanceAction } from "../types";

export const importFormatReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case "ADD_IMPORT_FORMAT":
      return {
        ...state,
        importFormats: [...state.importFormats, action.payload],
      };
      
    case "UPDATE_IMPORT_FORMAT":
      return {
        ...state,
        importFormats: state.importFormats.map((format) =>
          format.id === action.payload.id ? action.payload : format
        ),
      };
      
    case "DELETE_IMPORT_FORMAT":
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
