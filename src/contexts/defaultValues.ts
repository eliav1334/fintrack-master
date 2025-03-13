
import { CategoryType, FileImportFormat } from "@/types";
import { FinanceState } from "./types";

export const DEFAULT_CATEGORIES: CategoryType[] = [
  // קטגוריות הכנסה
  { id: "cat_income_1", name: "משכורת א", type: "income", color: "#34d399", icon: "ארנק" },
  { id: "cat_income_2", name: "משכורת ב", type: "income", color: "#34d399", icon: "ארנק" },
  { id: "cat_income_3", name: "הכנסה אחרת", type: "income", color: "#34d399", icon: "ארנק" },
  
  // קטגוריות דירה
  { id: "cat_apartment_1", name: "שכר דירה", type: "expense", color: "#60a5fa", icon: "בית" },
  { id: "cat_apartment_2", name: "משכנתא", type: "expense", color: "#60a5fa", icon: "בית" },
  { id: "cat_apartment_3", name: "ארנונה", type: "expense", color: "#60a5fa", icon: "בית" },
  { id: "cat_apartment_4", name: "מים וביוב", type: "expense", color: "#60a5fa", icon: "בית" },
  { id: "cat_apartment_5", name: "גז", type: "expense", color: "#60a5fa", icon: "בית" },
  { id: "cat_apartment_6", name: "חשמל", type: "expense", color: "#60a5fa", icon: "בית" },
  
  // קטגוריית דלק וחניה
  { id: "cat_transport_1", name: "דלק", type: "expense", color: "#f97316", icon: "רכב" },
  { id: "cat_transport_2", name: "תשלומי חניה", type: "expense", color: "#f97316", icon: "רכב" },
  { id: "cat_transport_3", name: "רחיצת מכונית וחניה", type: "expense", color: "#f97316", icon: "רכב" },
  { id: "cat_transport_4", name: "כביש אגרה", type: "expense", color: "#f97316", icon: "רכב" },
  
  // קטגוריית רכבים
  { id: "cat_car_1", name: "צמיגים", type: "expense", color: "#fbbf24", icon: "רכב" },
  { id: "cat_car_2", name: "תאונות", type: "expense", color: "#fbbf24", icon: "רכב" },
  { id: "cat_car_3", name: "טיפולים", type: "expense", color: "#fbbf24", icon: "רכב" },
  
  // קטגוריית מוסך
  { id: "cat_garage_1", name: "חידוש רישיון לרכב", type: "expense", color: "#fb7185", icon: "רכב" },
  
  // קטגוריית ביטוחים
  { id: "cat_insurance_1", name: "ביטוח חובה", type: "expense", color: "#a78bfa", icon: "מסמך" },
  { id: "cat_insurance_2", name: "ביטוח צד ג' / מקיף", type: "expense", color: "#a78bfa", icon: "מסמך" },
  
  // קטגוריית סלולאר/אינטרנט
  { id: "cat_comm_1", name: "סלקום TV/אינטרנט", type: "expense", color: "#22d3ee", icon: "טלפון" },
  { id: "cat_comm_2", name: "קו סלולאר - פלאפון", type: "expense", color: "#22d3ee", icon: "טלפון" },
  { id: "cat_comm_3", name: "נטספארק", type: "expense", color: "#22d3ee", icon: "טלפון" },
  
  // קטגוריית בנק
  { id: "cat_bank_1", name: "מכולת", type: "expense", color: "#f87171", icon: "ארנק" },
  { id: "cat_bank_2", name: "מטעמים", type: "expense", color: "#f87171", icon: "ארנק" },
  { id: "cat_bank_3", name: "הוצאת מזומן", type: "expense", color: "#f87171", icon: "ארנק" },
  { id: "cat_bank_4", name: "עמלות בנק", type: "expense", color: "#f87171", icon: "ארנק" },
  { id: "cat_bank_5", name: "חסכונות ספרים", type: "expense", color: "#f87171", icon: "ארנק" },
  
  // קטגוריית ילדים
  { id: "cat_kids_1", name: "מעונות", type: "expense", color: "#ec4899", icon: "ילדים" },
  { id: "cat_kids_2", name: "צהרון/מטפלת", type: "expense", color: "#ec4899", icon: "ילדים" },
  { id: "cat_kids_3", name: "ספרי לימוד/כתיבה", type: "expense", color: "#ec4899", icon: "ילדים" },
  { id: "cat_kids_4", name: "ציוד גן/משחק", type: "expense", color: "#ec4899", icon: "ילדים" },
  { id: "cat_kids_5", name: "אירועים", type: "expense", color: "#ec4899", icon: "ילדים" },
  
  // קטגוריית סה"כ
  { id: "cat_total_1", name: "סה\"כ", type: "expense", color: "#9ca3af", icon: "חישוב" },
  
  // קטגוריית ביטוחי בריאות
  { id: "cat_health_1", name: "ביטוח חיים", type: "expense", color: "#14b8a6", icon: "בריאות" },
  { id: "cat_health_2", name: "ביטוח בריאות", type: "expense", color: "#14b8a6", icon: "בריאות" },
  { id: "cat_health_3", name: "שירותי בריאות כללית", type: "expense", color: "#14b8a6", icon: "בריאות" },
  { id: "cat_health_4", name: "ביטוח דירה/רכוש", type: "expense", color: "#14b8a6", icon: "בריאות" },
  
  // קטגוריית תשלומים
  { id: "cat_payments_1", name: "ספיסלוק", type: "expense", color: "#8b5cf6", icon: "תשלום" },
  { id: "cat_payments_2", name: "תרופות", type: "expense", color: "#8b5cf6", icon: "תשלום" },
  { id: "cat_payments_3", name: "שיניים", type: "expense", color: "#8b5cf6", icon: "תשלום" },
  
  // קטגוריית מזון
  { id: "cat_food_1", name: "סופר", type: "expense", color: "#10b981", icon: "מזון" },
  { id: "cat_food_2", name: "מכולת", type: "expense", color: "#10b981", icon: "מזון" },
  { id: "cat_food_3", name: "מסעדות", type: "expense", color: "#10b981", icon: "מזון" },
  { id: "cat_food_4", name: "בית מלון", type: "expense", color: "#10b981", icon: "מזון" },
  
  // קטגוריית חסכון ירדים
  { id: "cat_savings_1", name: "הוצאת מזומן", type: "expense", color: "#6366f1", icon: "חיסכון" },
  { id: "cat_savings_2", name: "עמלות בנק", type: "expense", color: "#6366f1", icon: "חיסכון" },
  { id: "cat_savings_3", name: "ממתטרים אשראי", type: "expense", color: "#6366f1", icon: "חיסכון" },
  { id: "cat_savings_4", name: "תוכנית חיסכון", type: "expense", color: "#6366f1", icon: "חיסכון" },
  { id: "cat_savings_5", name: "חסכון ילדים", type: "expense", color: "#6366f1", icon: "חיסכון" },
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
