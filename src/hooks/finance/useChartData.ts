
import { Transaction, CategoryType } from "@/types";
import { format } from "date-fns";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { useTransactionFilters } from "./useTransactionFilters";

/**
 * הוק ליצירת נתוני גרף
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
        } else {
          // עסקאות ללא קטגוריה - ניצור קטגוריה "אחר"
          if (!expensesByCategory["other"]) {
            expensesByCategory["other"] = 0;
          }
          expensesByCategory["other"] += tx.amount;
        }
      });
    
    // יצירת נתונים לגרף עוגה - צבעים מותאמים לעיצוב החדש
    const colors = [
      "#f87171", "#ef4444", "#dc2626", "#b91c1c", "#991b1b", 
      "#fb923c", "#f97316", "#ea580c", "#c2410c", "#9a3412",
      "#a855f7", "#9333ea", "#7e22ce", "#6b21a8", "#581c87"
    ];
    
    const categoryData = Object.keys(expensesByCategory).map((categoryId, index) => {
      // מצא את הקטגוריה המתאימה או השתמש ב"אחר" אם אין קטגוריה
      const category = categoryId === "other" 
        ? { name: "אחר", id: "other" } 
        : categories.find((cat) => cat.id === categoryId) || { name: "לא מוגדר", id: categoryId };
      
      return {
        name: category.name,
        value: expensesByCategory[categoryId],
        color: colors[index % colors.length],
      };
    }).sort((a, b) => b.value - a.value); // סידור לפי ערך יורד
    
    return categoryData;
  };

  // יצירת נתונים לגרף הכנסות לפי קטגוריה
  const getIncomeData = () => {
    const monthTransactions = getMonthTransactions(transactions, selectedDate);
    const incomesByCategory: Record<string, number> = {};
    
    // חישוב הכנסות לפי קטגוריה
    monthTransactions
      .filter((tx) => tx.type === "income")
      .forEach((tx) => {
        if (tx.categoryId) {
          if (!incomesByCategory[tx.categoryId]) {
            incomesByCategory[tx.categoryId] = 0;
          }
          incomesByCategory[tx.categoryId] += tx.amount;
        } else {
          // הכנסות ללא קטגוריה - ניצור קטגוריה "אחר"
          if (!incomesByCategory["other"]) {
            incomesByCategory["other"] = 0;
          }
          incomesByCategory["other"] += tx.amount;
        }
      });
    
    // יצירת נתונים לגרף עוגה - צבעים ירוקים
    const colors = [
      "#34d399", "#10b981", "#059669", "#047857", "#065f46", 
      "#4ade80", "#22c55e", "#16a34a", "#15803d", "#166534"
    ];
    
    const incomeData = Object.keys(incomesByCategory).map((categoryId, index) => {
      // מצא את הקטגוריה המתאימה או השתמש ב"אחר" אם אין קטגוריה
      const category = categoryId === "other" 
        ? { name: "אחר", id: "other" } 
        : categories.find((cat) => cat.id === categoryId) || { name: "לא מוגדר", id: categoryId };
      
      return {
        name: category.name,
        value: incomesByCategory[categoryId],
        color: colors[index % colors.length],
      };
    }).sort((a, b) => b.value - a.value); // סידור לפי ערך יורד
    
    return incomeData;
  };

  return {
    getCashFlowData,
    getCategoryData,
    getIncomeData
  };
};
