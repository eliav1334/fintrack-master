import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Transaction,
  ImportedTransaction,
  FinancialSummary,
  TransactionCategory,
  TransactionType,
  TransactionStatus,
  Budget
} from '@/types/finance'
import { generateId } from '@/utils/generateId'

const normalizeTransactionCategory = (category: string): TransactionCategory => {
  const normalized = category.trim()
  const validCategories: TransactionCategory[] = [
    'דיור', 'מזון', 'תחבורה', 'חשבונות', 'בריאות', 'בידור',
    'קניות', 'חינוך', 'חסכונות', 'ביגוד והנעלה', 'משכורת',
    'פרילנס', 'השקעות', 'אחר'
  ]

  if (validCategories.includes(normalized as TransactionCategory)) {
    return normalized as TransactionCategory
  }

  return 'אחר'
}

interface FinanceStore {
  transactions: Transaction[]
  budgets: Budget[]
  summary: FinancialSummary | null
  currentPage: number
  itemsPerPage: number

  // Transactions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  importTransactions: (transactions: ImportedTransaction[]) => void

  // Budgets
  addBudget: (budget: Omit<Budget, 'id'>) => void
  updateBudget: (id: string, budget: Partial<Budget>) => void
  deleteBudget: (id: string) => void

  // Summary & Pagination
  calculateSummary: () => void
  setCurrentPage: (page: number) => void

  // Data management
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
  budgets: [],
  summary: null,
  currentPage: 1,
  itemsPerPage: 15,

  addTransaction: (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: generateId('transaction'),
      category: normalizeTransactionCategory(transaction.category),
      createdAt: new Date().toISOString()
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
              category: transaction.category ? normalizeTransactionCategory(transaction.category) : t.category
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
      .filter(t => t.amount !== undefined && t.date)
      .map((transaction) => ({
        ...transaction,
        id: generateId('transaction'),
        category: normalizeTransactionCategory(transaction.category || 'אחר'),
        type: transaction.type || 'expense',
        status: transaction.status || 'completed',
        description: transaction.description || transaction.businessName || 'ללא תיאור',
        createdAt: new Date().toISOString()
      }))

    console.log('Importing transactions:', newTransactions)

    set((state: FinanceStore) => {
      const updatedTransactions = [...state.transactions, ...newTransactions]
      console.log('Updated transactions:', updatedTransactions)
      return {
        transactions: updatedTransactions
      }
    })

    setTimeout(() => {
      get().calculateSummary()
      console.log('Summary after import:', get().summary)
    }, 0)
  },

  // Budget management
  addBudget: (budget: Omit<Budget, 'id'>) => {
    const newBudget = {
      ...budget,
      id: generateId('budget'),
      currentSpent: 0
    }
    set((state: FinanceStore) => ({
      budgets: [...state.budgets, newBudget]
    }))
  },

  updateBudget: (id: string, budget: Partial<Budget>) => {
    set((state: FinanceStore) => ({
      budgets: state.budgets.map((b) =>
        b.id === id ? { ...b, ...budget } : b
      )
    }))
  },

  deleteBudget: (id: string) => {
    set((state: FinanceStore) => ({
      budgets: state.budgets.filter((b) => b.id !== id)
    }))
  },

  // Pagination
  setCurrentPage: (page: number) => {
    set({ currentPage: page })
  },

  calculateSummary: () => {
    const { transactions } = get()
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    // אם אין עסקאות, נאפס את הסיכום
    if (transactions.length === 0) {
      set({
        summary: {
          totalIncome: 0,
          totalExpenses: 0,
          balance: 0,
          monthlyComparison: {
            incomeChange: 0,
            expenseChange: 0
          },
          largestExpenseCategory: {
            category: 'אחר',
            amount: 0,
            percentage: 0
          },
          expensesByCategory: []
        }
      })
      return
    }

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
      { category: 'אחר' as TransactionCategory, amount: 0, percentage: 0 }
    )

    const newSummary = {
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

    // בדיקה אם הסיכום השתנה
    const currentSummary = get().summary
    if (JSON.stringify(currentSummary) !== JSON.stringify(newSummary)) {
      set({ summary: newSummary })
    }
  },

  exportData: () => {
    const { transactions, budgets } = get()
    return JSON.stringify({
      transactions,
      budgets,
      exportDate: new Date().toISOString()
    })
  },

  importData: (data: string) => {
    try {
      const parsed = JSON.parse(data)
      if (parsed.transactions) {
        set({
          transactions: [],
          budgets: []
        })
        get().importTransactions(parsed.transactions)
        if (parsed.budgets) {
          set({ budgets: parsed.budgets })
        }
      }
    } catch (error) {
      console.error('Error importing data:', error)
    }
  },

  resetStore: () => {
    set({
      transactions: [],
      budgets: [],
      summary: null,
      currentPage: 1
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
            return JSON.parse(data)
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