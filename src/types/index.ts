
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: "income" | "expense";
  categoryId: string;
  notes?: string;
  cardNumber?: string;
  createdAt?: string; // זמן יצירת/ייבוא העסקה
  // שדות לחישוב חשמל
  isElectricityBill?: boolean;
  mainMeterReading?: {
    current: number;
    previous: number;
    date: string;
  };
  secondaryMeterReading?: {
    current: number;
    previous: number;
    date: string;
  };
  electricityRate?: number;
  vatRate?: number;
  // שדות לתשלומים
  isInstallment?: boolean;
  installmentDetails?: {
    totalAmount: number;
    currentInstallment: number;
    totalInstallments: number;
    installmentNumber?: number; // מספר התשלום הנוכחי
    installmentDate?: string; // תאריך חיוב התשלום
    originalTransactionDate?: string; // תאריך העסקה המקורית
    remainingAmount?: number; // סכום שנותר לתשלום
  };
  // שדות נוספים לכרטיסי אשראי
  originalAmount?: number; // סכום מקורי לפני פיצול לתשלומים
  transactionCode?: string; // קוד עסקה ייחודי מחברת האשראי
  businessIdentifier?: string; // מזהה בית עסק
  businessCategory?: string; // קטגוריית בית עסק
}

// הוספת TransactionType כטיפוס נפרד
export type TransactionType = "income" | "expense";

export interface CategoryType {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string;
}

export interface FileImportFormat {
  id: string;
  name: string;
  mapping: {
    date: string;
    amount: string;
    description: string;
    type?: string;
    category?: string;
    cardNumber?: string;
    // שדות נוספים למיפוי קבצי כרטיסי אשראי
    totalAmount?: string; // סכום עסקה כולל
    installmentAmount?: string; // סכום תשלום בודד
    installmentNumber?: string; // מספר תשלום נוכחי
    totalInstallments?: string; // סך תשלומים
    businessCategory?: string; // קטגוריית בית עסק
    originalTransactionDate?: string; // תאריך עסקה מקורי
    chargeDate?: string; // תאריך חיוב
    transactionCode?: string; // קוד עסקה
    businessIdentifier?: string; // מזהה בית עסק
    currencyCode?: string; // קוד מטבע
  };
  dateFormat: string;
  delimiter?: string;
  typeIdentifier: {
    column: string;
    incomeValues: string[];
    expenseValues: string[];
  };
  skipEmptyRows?: boolean;
  headerRowIndex?: number;
  // שדות חדשים לתמיכה בגליונות מרובים
  sheetSupport?: boolean; // האם יש תמיכה בגליונות מרובים
  sheetSelection?: {
    type: "all" | "specific" | "named"; // סוג בחירת גליונות
    names?: string[]; // שמות גליונות ספציפיים
    skipEmpty?: boolean; // דלג על גליונות ריקים
  };
  // זיהוי תשלומים
  installmentIdentifier?: {
    enabled: boolean;
    pattern: string[]; // תבניות טקסט לזיהוי תשלומים
    totalField?: string; // שדה סכום כולל
    numberField?: string; // שדה מספר תשלום
    countField?: string; // שדה מספר תשלומים כולל
  };
}
