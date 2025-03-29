import { FileImportFormat } from "@/types";

export interface FileFormat {
  id: string;
  name: string;
  description: string;
  dateFormat: string;
  dateColumns: string[];
  requiredColumns: string[];
  optionalColumns: string[];
}

export const FILE_FORMATS: FileFormat[] = [
  {
    id: 'max',
    name: 'כרטיס מקס',
    description: 'פורמט ייצוא של כרטיס אשראי מקס',
    dateFormat: 'dd/MM/yyyy',
    dateColumns: ['תאריך עסקה', 'תאריך חיוב'],
    requiredColumns: ['תאריך עסקה', 'שם בית עסק', 'סכום חיוב'],
    optionalColumns: ['תאריך חיוב', 'קטגוריה', 'הערות']
  },
  {
    id: 'isracard',
    name: 'ישראכרט',
    description: 'פורמט ייצוא של כרטיס אשראי ישראכרט',
    dateFormat: 'yyyy-MM-dd',
    dateColumns: ['תאריך', 'תאריך חיוב'],
    requiredColumns: ['תאריך', 'שם בית עסק', 'סכום לחיוב'],
    optionalColumns: ['תאריך חיוב', 'קטגוריה', 'הערות']
  },
  {
    id: 'cal',
    name: 'כאל',
    description: 'פורמט ייצוא של כרטיס אשראי כאל',
    dateFormat: 'dd/MM/yy',
    dateColumns: ['תאריך', 'תאריך חיוב'],
    requiredColumns: ['תאריך', 'שם בית עסק', 'סכום עסקה'],
    optionalColumns: ['תאריך חיוב', 'קטגוריה', 'הערות']
  }
];

export const DEFAULT_IMPORT_FORMATS: FileImportFormat[] = [
  {
    id: "format_1",
    name: "פורמט כללי",
    mapping: {
      date: "תאריך",
      amount: "סכום",
      description: "תיאור",
      type: "סוג",
      cardNumber: "מספר כרטיס"
    },
    dateFormat: "DD/MM/YYYY",
    delimiter: ",",
    typeIdentifier: {
      column: "סוג",
      incomeValues: ["הכנסה", "זיכוי", "העברה"],
      expenseValues: ["הוצאה", "חיוב", "משיכה"]
    }
  },
  {
    id: "format_2",
    name: "פורמט בנק הפועלים",
    mapping: {
      date: "תאריך ערך",
      amount: "סכום",
      description: "תיאור פעולה",
      type: "סוג פעולה",
      cardNumber: "מספר כרטיס"
    },
    dateFormat: "DD/MM/YYYY",
    delimiter: ",",
    typeIdentifier: {
      column: "סוג פעולה",
      incomeValues: ["זכות", "העברה נכנסת"],
      expenseValues: ["חובה", "העברה יוצאת"]
    }
  },
  {
    id: "format_3",
    name: "פורמט כרטיס אשראי",
    mapping: {
      date: "תאריך עסקה",
      amount: "סכום חיוב",
      description: "שם בית עסק",
      cardNumber: "מספר כרטיס"
    },
    dateFormat: "DD/MM/YYYY",
    delimiter: ",",
    typeIdentifier: {
      column: "סוג עסקה",
      incomeValues: ["זיכוי", "החזר"],
      expenseValues: ["חיוב", "רכישה"]
    },
    creditCardFormat: true
  }
];

export const ALLOWED_CARD_NUMBERS = ["1515", "0691"];
export const BLOCKED_CARD_NUMBERS = ["2623"];

export const validateCardNumber = (cardNumber: string): boolean => {
  if (!cardNumber) return false;
  return ALLOWED_CARD_NUMBERS.includes(cardNumber) && !BLOCKED_CARD_NUMBERS.includes(cardNumber);
};

export const getFormatById = (id: string): FileFormat | undefined => {
  return FILE_FORMATS.find(format => format.id === id);
};

export const validateRequiredColumns = (headers: string[], format: FileFormat): boolean => {
  return format.requiredColumns.every(col => headers.includes(col));
};

export const validateFileFormat = (headers: string[], format: FileImportFormat): boolean => {
  const requiredFields = Object.values(format.mapping).filter(Boolean);
  return requiredFields.every(field => headers.includes(field));
}; 