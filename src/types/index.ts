
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
}

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
  };
  dateFormat: string;
  delimiter?: string;
  typeIdentifier: {
    column: string;
    incomeValues: string[];
    expenseValues: string[];
  };
}
