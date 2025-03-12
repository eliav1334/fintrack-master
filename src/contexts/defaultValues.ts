
import { CategoryType, FileImportFormat } from "@/types";
import { FinanceState } from "./types";

export const DEFAULT_CATEGORIES: CategoryType[] = [
  { id: "cat_1", name: "משכורת", type: "income", color: "#34d399" },
  { id: "cat_2", name: "השקעות", type: "income", color: "#a78bfa" },
  { id: "cat_3", name: "מזון", type: "expense", color: "#f87171" },
  { id: "cat_4", name: "דיור", type: "expense", color: "#60a5fa" },
  { id: "cat_5", name: "תחבורה", type: "expense", color: "#fbbf24" },
  { id: "cat_6", name: "בידור", type: "expense", color: "#ec4899" },
  { id: "cat_7", name: "בריאות", type: "expense", color: "#14b8a6" },
  { id: "cat_8", name: "חשבונות", type: "expense", color: "#8b5cf6" },
  { id: "cat_9", name: "אחר", type: "expense", color: "#9ca3af" },
];

export const DEFAULT_IMPORT_FORMATS: FileImportFormat[] = [
  {
    id: "format_1",
    name: "CSV כללי",
    mapping: {
      date: "תאריך",
      amount: "סכום",
      description: "תיאור",
      type: "סוג",
    },
    dateFormat: "YYYY-MM-DD",
    delimiter: ",",
    typeIdentifier: {
      column: "סוג",
      incomeValues: ["הכנסה", "זיכוי", "הפקדה"],
      expenseValues: ["הוצאה", "חיוב", "משיכה"],
    },
  },
];

export const initialState: FinanceState = {
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  budgets: [],
  importFormats: DEFAULT_IMPORT_FORMATS,
  isLoading: false,
  error: null,
};
