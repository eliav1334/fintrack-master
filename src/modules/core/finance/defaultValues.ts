
import { FinanceState } from './types';

// ערכי ברירת מחדל של המערכת
export const initialState: FinanceState = {
  transactions: [],
  categories: [],
  budgets: [],
  isLoading: false,
  error: null,
  importFormats: [],
  categoryMappings: [],
};
