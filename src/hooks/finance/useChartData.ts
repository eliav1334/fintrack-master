
import { Transaction, CategoryType } from "@/types";
import { format } from "date-fns";
import { startOfMonth, endOfMonth } from "date-fns";
import { useTransactionFilters } from "./useTransactionFilters";

/**
 * Hook for generating chart data
 */
export const useChartData = (
  transactions: Transaction[],
  categories: CategoryType[],
  selectedDate: Date
) => {
  const { getMonthTransactions } = useTransactionFilters();

  // יצירת נתונים לגרף תזרים מזומנים
  const getCashFlowData = () => {
    // מייצר נתונים עבור החודש הנבחר
    const currentMonthStart = startOfMonth(selectedDate);
    const currentMonthEnd = endOfMonth(selectedDate);
    
    // יצירת מערך של כל התאריכים בחודש
    const daysInMonth = [];
    for (let day = new Date(currentMonthStart); day <= currentMonthEnd; day.setDate(day.getDate() + 1)) {
      daysInMonth.push(format(new Date(day), "yyyy-MM-dd"));
    }
    
    // מיפוי תזרים לכל יום בחודש
    const dailyData = daysInMonth.map((dateStr) => {
      const dayTransactions = transactions.filter(
        (tx) => tx.date === dateStr
      );
      
      const income = dayTransactions
        .filter((tx) => tx.type === "income")
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const expense = dayTransactions
        .filter((tx) => tx.type === "expense")
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      return {
        date: dateStr,
        income,
        expense,
      };
    });
    
    return dailyData;
  };

  // יצירת נתונים לגרף הוצאות לפי קטגוריה
  const getCategoryData = () => {
    const monthTransactions = getMonthTransactions(transactions, selectedDate);
    const expensesByCategory: Record<string, number> = {};
    
    // חישוב הוצאות לפי קטגוריה
    monthTransactions
      .filter((tx) => tx.type === "expense")
      .forEach((tx) => {
        if (tx.categoryId) {
          if (!expensesByCategory[tx.categoryId]) {
            expensesByCategory[tx.categoryId] = 0;
          }
          expensesByCategory[tx.categoryId] += tx.amount;
        }
      });
    
    // יצירת נתונים לגרף עוגה
    const colors = [
      "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
      "#FF9F40", "#8AC54B", "#F49AC2", "#82BAEF", "#FFD98E"
    ];
    
    const categoryData = Object.keys(expensesByCategory).map((categoryId, index) => {
      const category = categories.find((cat) => cat.id === categoryId);
      return {
        name: category?.name || "לא מוגדר",
        value: expensesByCategory[categoryId],
        color: colors[index % colors.length],
      };
    }).sort((a, b) => b.value - a.value); // סידור לפי ערך יורד
    
    return categoryData;
  };

  return {
    getCashFlowData,
    getCategoryData
  };
};
