
import { FinanceState, FinanceAction } from "../types";
import { initialState } from "../defaultValues";

export const systemStateReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case "RESET_STATE":
      // איפוס המערכת למצב התחלתי
      return { ...initialState };
      
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
      
    default:
      return state;
  }
};
