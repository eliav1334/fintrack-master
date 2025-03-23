
import { useMemo } from "react";
import { FinanceState } from "../types";

/**
 * הוק לחישוב נתונים סטטיסטיים פיננסיים
 */
export const useFinanceStats = (state: FinanceState) => {
  // חישוב סטטיסטיקות פיננסיות
  const stats = useMemo(() => {
    const transactions = state.transactions || [];
    
    // סכום של כל ההכנסות
    const totalIncome = transactions
      .filter(tx => tx.type === "income")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    
    // סכום של כל ההוצאות
    const totalExpenses = transactions
      .filter(tx => tx.type === "expense")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    
    // מאזן
    const balance = totalIncome - totalExpenses;
    
    // תקציב חודשי
    const currentMonth = new Date().getMonth() + 1; 
    const currentYear = new Date().getFullYear();
    
    const currentMonthBudget = state.budgets.find(
      b => (b.month !== undefined && b.month === currentMonth) && 
           (b.year !== undefined && b.year === currentYear)
    );
    
    // עסקאות החודש הנוכחי
    const currentMonthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() + 1 === currentMonth && 
             txDate.getFullYear() === currentYear;
    });
    
    // הכנסות והוצאות החודש
    const currentMonthIncome = currentMonthTransactions
      .filter(tx => tx.type === "income")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    
    const currentMonthExpenses = currentMonthTransactions
      .filter(tx => tx.type === "expense")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    
    return {
      totalIncome,
      totalExpenses,
      balance,
      currentMonthBudget,
      currentMonthIncome,
      currentMonthExpenses,
      transactionsCount: transactions.length,
      categoriesCount: state.categories.length,
      budgetsCount: state.budgets.length
    };
  }, [state.transactions, state.budgets, state.categories]);

  return stats;
};
