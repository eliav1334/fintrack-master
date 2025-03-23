
import { useMemo } from "react";
import { Transaction, Budget } from "../types";

/**
 * הוק להתראות על חריגה מתקציב
 */
export const useBudgetAlerts = (
  transactions: Transaction[], 
  budgets: Budget[]
) => {
  // חישוב התראות תקציב
  const budgetAlerts = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // תקציב לחודש הנוכחי
    const currentBudget = budgets.find(
      budget => budget.month === currentMonth && budget.year === currentYear
    );
    
    if (!currentBudget) {
      return {
        alerts: [],
        hasOverspentCategories: false,
        totalOverspent: 0
      };
    }
    
    // עסקאות החודש הנוכחי
    const currentMonthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() + 1 === currentMonth && 
             txDate.getFullYear() === currentYear && 
             tx.type === "expense";
    });
    
    // הוצאות לפי קטגוריה
    const expensesByCategory: Record<string, number> = {};
    
    currentMonthTransactions.forEach(tx => {
      const categoryId = tx.categoryId || "ללא קטגוריה";
      
      if (!expensesByCategory[categoryId]) {
        expensesByCategory[categoryId] = 0;
      }
      
      expensesByCategory[categoryId] += Number(tx.amount);
    });
    
    // קטגוריות שחרגו מהתקציב
    const alerts = [];
    let totalOverspent = 0;
    
    // בדיקת חריגות תקציב
    for (const [categoryId, amount] of Object.entries(expensesByCategory)) {
      // תקציב לקטגוריה זו
      const categoryBudget = currentBudget.categories?.find(
        catBudget => catBudget.categoryId === categoryId
      );
      
      if (categoryBudget && amount > categoryBudget.limit) {
        const overspentAmount = amount - categoryBudget.limit;
        totalOverspent += overspentAmount;
        
        alerts.push({
          categoryId,
          budgetLimit: categoryBudget.limit,
          currentSpent: amount,
          overspentAmount,
          percentOverspent: Math.round((overspentAmount / categoryBudget.limit) * 100)
        });
      }
    }
    
    return {
      alerts: alerts.sort((a, b) => b.overspentAmount - a.overspentAmount),
      hasOverspentCategories: alerts.length > 0,
      totalOverspent
    };
  }, [transactions, budgets]);

  return budgetAlerts;
};
