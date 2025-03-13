
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
  {
    id: "format_2",
    name: "אקסל בנק ישראלי",
    mapping: {
      date: "תאריך ערך",
      amount: "סכום",
      description: "תיאור",
      type: "סוג פעולה",
    },
    dateFormat: "DD/MM/YYYY",
    delimiter: ",",
    typeIdentifier: {
      column: "סוג פעולה",
      incomeValues: ["זיכוי", "הפקדה", "העברה", "משכורת"],
      expenseValues: ["חיוב", "משיכה", "תשלום", "עמלה"],
    },
  },
  {
    id: "format_3",
    name: "חשבון עו\"ש - פורמט אוטומטי",
    mapping: {
      date: "תאריך",
      amount: "סכום חובה",
      description: "תיאור",
    },
    dateFormat: "DD/MM/YYYY",
    delimiter: ",",
    typeIdentifier: {
      column: "סכום חובה",
      incomeValues: ["0"],
      expenseValues: ["סכום"],
    },
  },
  {
    id: "format_4",
    name: "אקסל בנק לאומי",
    mapping: {
      date: "תאריך",
      amount: "סכום",
      description: "תיאור",
    },
    dateFormat: "DD/MM/YYYY",
    delimiter: ",",
    typeIdentifier: {
      column: "amount",
      incomeValues: [],
      expenseValues: [],
    },
  },
  {
    id: "format_5",
    name: "אקסל בנק הפועלים",
    mapping: {
      date: "תאריך",
      amount: "סכום",
      description: "תיאור פעולה",
    },
    dateFormat: "DD/MM/YYYY",
    delimiter: ",",
    typeIdentifier: {
      column: "אסמכתא",
      incomeValues: ["זכות", "הפקדה"],
      expenseValues: ["חובה", "משיכה"],
    },
  },
  {
    id: "format_6",
    name: "כרטיס אשראי ישראלי",
    mapping: {
      date: "תאריך עסקה",
      amount: "סכום חיוב",
      description: "שם בית העסק",
    },
    dateFormat: "DD-MM-YYYY",
    delimiter: ",",
    typeIdentifier: {
      column: "amount",
      incomeValues: [],
      expenseValues: [],
    },
  },
  {
    id: "format_7",
    name: "כרטיס אשראי - שורות ריקות",
    mapping: {
      date: "תאריך",
      amount: "סכום",
      description: "פירוט",
    },
    dateFormat: "DD/MM/YYYY",
    delimiter: ",",
    typeIdentifier: {
      column: "amount",
      incomeValues: [],
      expenseValues: [],
    },
    skipEmptyRows: true,
    headerRowIndex: 2,
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
