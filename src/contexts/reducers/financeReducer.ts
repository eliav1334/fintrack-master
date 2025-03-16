
import { FinanceState, FinanceAction } from "../types";
import { initialState } from "../defaultValues";
import { transactionReducer } from "./transactionReducer";
import { categoryReducer } from "./categoryReducer";
import { budgetReducer } from "./budgetReducer";
import { importFormatReducer } from "./importFormatReducer";
import { categoryMappingReducer } from "./categoryMappingReducer";
import { systemStateReducer } from "./systemStateReducer";

export const financeReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case "RESET_STATE":
      return systemStateReducer(state, action);

    case "ADD_TRANSACTION":
    case "UPDATE_TRANSACTION":
    case "DELETE_TRANSACTION":
    case "DELETE_ALL_INCOME_TRANSACTIONS":
    case "ADD_TRANSACTIONS":
      return transactionReducer(state, action);

    case "ADD_CATEGORY":
    case "UPDATE_CATEGORY":
    case "DELETE_CATEGORY":
      return categoryReducer(state, action);

    case "SET_BUDGET":
    case "DELETE_BUDGET":
      return budgetReducer(state, action);

    case "ADD_IMPORT_FORMAT":
    case "UPDATE_IMPORT_FORMAT":
    case "DELETE_IMPORT_FORMAT":
      return importFormatReducer(state, action);

    case "ADD_CATEGORY_MAPPING":
    case "UPDATE_CATEGORY_MAPPING":
    case "DELETE_CATEGORY_MAPPING":
    case "SET_CATEGORY_MAPPINGS":
      return categoryMappingReducer(state, action);

    case "SET_LOADING":
    case "SET_ERROR":
      return systemStateReducer(state, action);

    default:
      return state;
  }
};
