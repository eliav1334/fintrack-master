export type TransactionType = 'הכנסה' | 'הוצאה'

export type TransactionStatus = 'הושלם' | 'ממתין' | 'בוטל'

export type TransactionCategory =
  | 'דיור'
  | 'מזון'
  | 'תחבורה'
  | 'חשבונות'
  | 'בריאות'
  | 'בידור'
  | 'קניות'
  | 'חינוך'
  | 'חסכונות'
  | 'אחר'

export interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  type: TransactionType
  category: TransactionCategory
  status: TransactionStatus
  notes?: string
  createdAt?: string
  businessName?: string
  transactionType?: string
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

export interface BudgetException {
  category: TransactionCategory
  amount: number
}

export interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  balance: number
  monthlyComparison: MonthlyComparison
  largestExpenseCategory: CategorySummary
  expensesByCategory: CategorySummary[]
  budgetExceptions?: BudgetException[]
}

export interface Budget {
  id: string;
  category: TransactionCategory;
  amount: number;
  period: 'monthly' | 'yearly';
  currentSpent: number;
}
