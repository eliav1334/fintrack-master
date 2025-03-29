import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Transaction,
  ImportedTransaction,
  FinancialSummary,
  TransactionCategory,
  TransactionType,
  TransactionStatus
} from '@/types/finance'
import { generateId } from '@/utils/generateId'

const categoryTranslations: Record<string, string> = {
  'income': 'הכנסה',
  'housing': 'דיור',
  'food': 'מזון',
  'transportation': 'תחבורה',
  'utilities': 'חשבונות',
  'healthcare': 'בריאות',
  'entertainment': 'בידור',
  'other': 'אחר'
}

const normalizeTransactionType = (type: string): TransactionType => {
  if (type === 'הכנסה' || type === 'income') return 'income'
  return 'expense'
}

const normalizeTransactionCategory = (category: string): TransactionCategory => {
  const normalized = category.toLowerCase().trim()
  if (Object.keys(categoryTranslations).includes(normalized)) {
    return normalized as TransactionCategory
  }
  // נסה למצוא תרגום הפוך
  const reversedCategory = Object.entries(categoryTranslations)
    .find(([_, value]) => value === normalized)?.[0]
  
  if (reversedCategory) {
    return reversedCategory as TransactionCategory
  }
  
  return 'other'
}

const normalizeTransactionStatus = (status: string): TransactionStatus => {
  const normalized = status.toLowerCase().trim()
  switch (normalized) {
    case 'pending':
    case 'ממתין':
      return 'pending'
    case 'cancelled':
    case 'בוטל':
      return 'cancelled'
    default:
      return 'completed'
  }
}

interface FinanceStore {
  transactions: Transaction[]
  summary: FinancialSummary | null
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  importTransactions: (transactions: ImportedTransaction[]) => void
  calculateSummary: () => void
  exportData: () => string
  importData: (data: string) => void
  resetStore: () => void
}

interface CategorySummaryTemp {
  category: TransactionCategory
  amount: number
  percentage: number
}

const storeCreator = (set: any, get: any): FinanceStore => ({
  transactions: [],
  summary: null,

  addTransaction: (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: generateId('transaction'),
      category: normalizeTransactionCategory(transaction.category),
      type: normalizeTransactionType(transaction.type),
      status: normalizeTransactionStatus(transaction.status)
    }
    set((state: FinanceStore) => ({
      transactions: [...state.transactions, newTransaction]
    }))
    get().calculateSummary()
  },

  updateTransaction: (id: string, transaction: Partial<Transaction>) => {
    set((state: FinanceStore) => ({
      transactions: state.transactions.map((t) =>
        t.id === id
          ? {
              ...t,
              ...transaction,
              category: transaction.category ? normalizeTransactionCategory(transaction.category) : t.category,
              type: transaction.type ? normalizeTransactionType(transaction.type) : t.type,
              status: transaction.status ? normalizeTransactionStatus(transaction.status) : t.status
            }
          : t
      )
    }))
    get().calculateSummary()
  },

  deleteTransaction: (id: string) => {
    set((state: FinanceStore) => ({
      transactions: state.transactions.filter((t) => t.id !== id)
    }))
    get().calculateSummary()
  },

  importTransactions: (transactions: ImportedTransaction[]) => {
    const newTransactions = transactions
      .filter(t => t.description && t.amount !== 0)
      .map((transaction) => ({
        ...transaction,
        id: generateId('transaction'),
        category: normalizeTransactionCategory(transaction.category),
        type: normalizeTransactionType(transaction.type),
        status: normalizeTransactionStatus(transaction.status)
      }))
    set((state: FinanceStore) => ({
      transactions: [...state.transactions, ...newTransactions]
    }))
    get().calculateSummary()
  },

  calculateSummary: () => {
    const { transactions } = get()
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const currentMonthTransactions = transactions.filter((t: Transaction) => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    const lastMonthTransactions = transactions.filter((t: Transaction) => {
      const date = new Date(t.date)
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
    })

    const calculateTotals = (txs: Transaction[]) => {
      return txs.reduce(
        (acc, t) => ({
          income: acc.income + (t.type === 'income' ? t.amount : 0),
          expenses: acc.expenses + (t.type === 'expense' ? t.amount : 0)
        }),
        { income: 0, expenses: 0 }
      )
    }

    const currentTotals = calculateTotals(currentMonthTransactions)
    const lastTotals = calculateTotals(lastMonthTransactions)

    const expensesByCategory = currentMonthTransactions
      .filter((t: Transaction) => t.type === 'expense')
      .reduce((acc: Record<string, number>, t: Transaction) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

    const values = Object.values(expensesByCategory)
    const totalExpenses: number = values.reduce((sum: number, val) => sum + (typeof val === 'number' ? val : 0), 0)

    const categorySummaries = Object.entries(expensesByCategory)
      .map(([category, amount]) => ({
        category: normalizeTransactionCategory(category),
        amount: typeof amount === 'number' ? amount : 0,
        percentage: totalExpenses > 0 ? ((typeof amount === 'number' ? amount : 0) / totalExpenses) * 100 : 0
      }))

    const largestExpenseCategory = categorySummaries.reduce(
      (max, current) => (current.amount > max.amount ? current : max),
      { category: 'other' as TransactionCategory, amount: 0, percentage: 0 }
    )

    set({
      summary: {
        totalIncome: currentTotals.income,
        totalExpenses: currentTotals.expenses,
        balance: currentTotals.income - currentTotals.expenses,
        monthlyComparison: {
          incomeChange:
            lastTotals.income === 0
              ? 0
              : ((currentTotals.income - lastTotals.income) / lastTotals.income) * 100,
          expenseChange:
            lastTotals.expenses === 0
              ? 0
              : ((currentTotals.expenses - lastTotals.expenses) / lastTotals.expenses) * 100
        },
        largestExpenseCategory,
        expensesByCategory: categorySummaries
      }
    })
  },

  exportData: () => {
    return JSON.stringify({
      transactions: get().transactions
    })
  },

  importData: (data: string) => {
    try {
      const parsed = JSON.parse(data)
      if (parsed.transactions) {
        set({ transactions: [] }) // נקה את העסקאות הקיימות
        get().importTransactions(parsed.transactions)
      }
    } catch (error) {
      console.error('Error importing data:', error)
    }
  },

  resetStore: () => {
    set({
      transactions: [],
      summary: null
    })
  }
})

export const useFinanceStore = create<FinanceStore>()(
  persist(storeCreator, {
    name: 'finance-store',
    version: 1,
    storage: {
      getItem: (name) => {
        try {
          const data = localStorage.getItem(name)
          if (data) {
            const parsed = JSON.parse(data)
            if (parsed.state) {
              parsed.state.transactions = []
              parsed.state.summary = null
            }
            return parsed
          }
        } catch (error) {
          console.error('Error getting data from storage:', error)
        }
        return null
      },
      setItem: (name, value) => {
        try {
          localStorage.setItem(name, JSON.stringify(value))
        } catch (error) {
          console.error('Error setting data to storage:', error)
        }
      },
      removeItem: (name) => {
        try {
          localStorage.removeItem(name)
        } catch (error) {
          console.error('Error removing data from storage:', error)
        }
      }
    }
  })
) 