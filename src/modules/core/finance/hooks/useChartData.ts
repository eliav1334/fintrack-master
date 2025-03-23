
import { useMemo } from "react";
import { Transaction } from "../types";

/**
 * הוק ליצירת נתונים עבור תרשימים
 */
export const useChartData = (transactions: Transaction[]) => {
  // נתונים לתרשים עוגה של הוצאות לפי קטגוריה
  const expensesByCategory = useMemo(() => {
    const expenseTransactions = transactions.filter(tx => tx.type === "expense");
    
    // קיבוץ הוצאות לפי קטגוריה
    const categoryTotals: Record<string, number> = {};
    
    expenseTransactions.forEach(tx => {
      const categoryId = tx.categoryId || "ללא קטגוריה";
      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = 0;
      }
      categoryTotals[categoryId] += Number(tx.amount);
    });
    
    // המרה למערך לתצוגה בתרשים
    const chartData = Object.entries(categoryTotals).map(([categoryId, amount]) => ({
      id: categoryId,
      value: amount,
      label: categoryId
    }));
    
    return chartData;
  }, [transactions]);

  // נתונים לתרשים הכנסות והוצאות לפי חודשים
  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number; expenses: number }> = {};
    
    // יצירת 12 חודשים אחרונים
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      months[monthKey] = { income: 0, expenses: 0 };
    }
    
    // מיון עסקאות לפי חודשים
    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      const monthKey = `${txDate.getFullYear()}-${txDate.getMonth() + 1}`;
      
      // דילוג על עסקאות מחוץ לטווח 12 חודשים
      if (!months[monthKey]) {
        return;
      }
      
      if (tx.type === "income") {
        months[monthKey].income += Number(tx.amount);
      } else if (tx.type === "expense") {
        months[monthKey].expenses += Number(tx.amount);
      }
    });
    
    // המרה למערך מסודר לפי תאריך
    const sortedMonths = Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, data]) => {
        const [year, month] = monthKey.split("-").map(Number);
        const monthName = new Date(year, month - 1, 1).toLocaleString("he", { month: "short" });
        
        return {
          name: `${monthName} ${year}`,
          הכנסות: data.income,
          הוצאות: data.expenses,
          מאזן: data.income - data.expenses
        };
      });
    
    return sortedMonths;
  }, [transactions]);

  return {
    expensesByCategory,
    monthlyData
  };
};
