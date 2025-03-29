export type TransactionType = 'income' | 'expense' | 'הכנסה' | 'הוצאה'

export type TransactionStatus = 'pending' | 'completed' | 'cancelled' | 'ממתין' | 'הושלם' | 'בוטל'

export type TransactionCategory =
  | 'housing'
  | 'food'
  | 'transportation'
  | 'utilities'
  | 'healthcare'
  | 'entertainment'
  | 'other'
  | 'דיור'
  | 'מזון'
  | 'תחבורה'
  | 'חשבונות'
  | 'בריאות'
  | 'בידור'

export interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  type: TransactionType
  category: TransactionCategory
  status: TransactionStatus
}

export type ImportedTransaction = Omit<Transaction, 'id'>

export interface CategorySummary {
  category: TransactionCategory
  amount: number
  percentage: number
}

export interface MonthlyComparison {
  incomeChange: number
  expenseChange: number
}

export interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  balance: number
  monthlyComparison: MonthlyComparison
  largestExpenseCategory: CategorySummary
  expensesByCategory: CategorySummary[]
}

export interface Budget {
  id: string;
  category: TransactionCategory;
  amount: number;
  period: 'monthly' | 'yearly';
  currentSpent: number;
}
