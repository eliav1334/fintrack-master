
import { Transaction, CategoryType } from "@/types";
import { useTransactionFilters } from "./useTransactionFilters";

/**
 * הוק לחישוב סטטיסטיקות פיננסיות
 */
export const useFinanceStats = (
  transactions: Transaction[],
  selectedDate: Date
) => {
  const { getMonthTransactions, getPreviousMonthTransactions } = useTransactionFilters();

  // חישוב נתוני סיכום
  const calculateStats = () => {
    const monthTransactions = getMonthTransactions(transactions, selectedDate);
    const prevMonthTransactions = getPreviousMonthTransactions(transactions, selectedDate);
    
    // חישוב נתוני החודש הנוכחי
    const income = monthTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const expense = monthTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const balance = income - expense;
    
    // חישוב נתוני החודש הקודם לשם השוואה
    const prevIncome = prevMonthTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const prevExpense = prevMonthTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const prevBalance = prevIncome - prevExpense;

    // חישוב אחוזי שינוי
    const incomeChange = prevIncome ? ((income - prevIncome) / prevIncome) * 100 : 0;
    const expenseChange = prevExpense ? ((expense - prevExpense) / prevExpense) * 100 : 0;
    const balanceChange = prevBalance ? ((balance - prevBalance) / prevBalance) * 100 : 0;

    return {
      income,
      expense,
      balance,
      incomeChange,
      expenseChange,
      balanceChange
    };
  };

  return {
    calculateStats
  };
};
