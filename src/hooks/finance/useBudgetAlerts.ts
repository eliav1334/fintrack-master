
import { Transaction, CategoryType, Budget } from "@/types";
import { useTransactionFilters } from "./useTransactionFilters";

export interface BudgetAlertItem {
  categoryId: string;
  categoryName: string;
  current: number;
  limit: number;
  percentage: number;
  type?: "income" | "expense";
}

export interface BalanceAlert {
  isNegative: boolean;
  income: number;
  expense: number;
  difference: number;
}

/**
 * הוק ליצירת התראות תקציב
 */
export const useBudgetAlerts = (
  transactions: Transaction[],
  categories: CategoryType[],
  budgets: Budget[],
  selectedDate: Date
) => {
  const { getMonthTransactions } = useTransactionFilters();

  // בדיקת התראות תקציב
  const checkBudgetAlerts = (): BudgetAlertItem[] => {
    const alerts: BudgetAlertItem[] = [];
    const monthTransactions = getMonthTransactions(transactions, selectedDate);
    
    // בדיקת חריגות תקציב לכל קטגוריה
    for (const budget of budgets) {
      // לוקח רק תקציבי הוצאות (לא הכנסות)
      const category = categories.find(c => c.id === budget.categoryId);
      if (!category || category.type !== 'expense') continue;
      
      const expenses = monthTransactions
        .filter((tx) => tx.type === "expense" && tx.categoryId === budget.categoryId)
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const budgetLimit = budget.amount;
      const percentage = (expenses / budgetLimit) * 100;
      
      if (percentage >= 85) {
        alerts.push({
          categoryId: budget.categoryId,
          categoryName: category.name,
          current: expenses,
          limit: budgetLimit,
          percentage,
          type: "expense" as const,
        });
      }
    }
    
    return alerts.sort((a, b) => b.percentage - a.percentage);
  };

  // בדיקת התראת מאזן
  const checkBalanceAlert = (): BalanceAlert | null => {
    const monthTransactions = getMonthTransactions(transactions, selectedDate);
    
    const income = monthTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const expense = monthTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const balance = income - expense;
    
    if (balance < 0) {
      return {
        isNegative: true,
        income: income,
        expense: expense,
        difference: balance
      };
    } else {
      return null;
    }
  };

  return {
    checkBudgetAlerts,
    checkBalanceAlert
  };
};
