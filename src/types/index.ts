
export type CategoryType = {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string; // הוספת שדה אייקון
};

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: "income" | "expense";
  categoryId: string;
  notes?: string;
  cardNumber?: string;
};

// הוספת טיפוס עבור סוגי עסקאות - חסר היה ייבוא ב-Dashboard וב-TransactionForm
export type TransactionType = "income" | "expense";

export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  startDate: string;
  period: "daily" | "weekly" | "monthly" | "yearly"; // הוספת שדה תקופה
};

export type FileImportFormat = {
  id: string;
  name: string;
  mapping: {
    date: string;
    amount: string;
    description: string;
    type?: string;
    category?: string;
    cardNumber?: string;
  };
  dateFormat: string;
  delimiter?: string;
  typeIdentifier: {
    column: string;
    incomeValues: string[];
    expenseValues: string[];
  };
  skipEmptyRows?: boolean; // הוספת שדה דילוג על שורות ריקות
  headerRowIndex?: number; // הוספת שדה אינדקס שורת כותרת
};
