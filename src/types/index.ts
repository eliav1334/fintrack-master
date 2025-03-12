
export type TransactionType = 'income' | 'expense';

export type CategoryType = {
  id: string;
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
  budget?: number;
};

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  categoryId: string;
  paymentMethod?: string;
  notes?: string;
};

export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
};

export type FileImportFormat = {
  id: string;
  name: string;
  mapping: {
    amount: string;
    date: string;
    description: string;
    type?: string;
    category?: string;
  };
  dateFormat: string;
  delimiter?: string;
  typeIdentifier?: {
    column: string;
    incomeValues: string[];
    expenseValues: string[];
  };
};

export type ReportType = 'income' | 'expense' | 'balance' | 'category' | 'trend';
export type ChartType = 'pie' | 'bar' | 'line' | 'area';

export type ReportConfig = {
  type: ReportType;
  chartType: ChartType;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate?: string;
  endDate?: string;
  categoryIds?: string[];
};
