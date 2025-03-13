
import { useState, useEffect } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { startOfMonth, endOfMonth, format, subMonths, isSameMonth } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

export const useFinanceDashboard = (selectedDate: Date = new Date()) => {
  const { state } = useFinance();
  const { toast } = useToast();
  const [balanceAlert, setBalanceAlert] = useState<{ income: number; expenses: number; balance: number } | null>(null);

  // פונקציה לפורמט סכומים כמטבע
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
    }).format(value);
  };

  // קבלת נתוני החודש הנבחר
  const getMonthTransactions = () => {
    const firstDay = startOfMonth(selectedDate);
    const lastDay = endOfMonth(selectedDate);

    return state.transactions.filter(
      (tx) => {
        const txDate = new Date(tx.date);
        return txDate >= firstDay && txDate <= lastDay;
      }
    );
  };

  // חישוב נתוני סיכום
  const calculateStats = () => {
    const monthTransactions = getMonthTransactions();
    
    const income = monthTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const expenses = monthTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const balance = income - expenses;
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    // בדיקת התראת מאזן
    if (balance < 0) {
      setBalanceAlert({ income, expenses, balance });
    } else {
      setBalanceAlert(null);
    }

    return {
      income,
      expenses,
      balance,
      savingsRate,
    };
  };

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
      const dayTransactions = state.transactions.filter(
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
    const monthTransactions = getMonthTransactions();
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
      const category = state.categories.find((cat) => cat.id === categoryId);
      return {
        name: category?.name || "לא מוגדר",
        value: expensesByCategory[categoryId],
        color: colors[index % colors.length],
      };
    }).sort((a, b) => b.value - a.value); // סידור לפי ערך יורד
    
    return categoryData;
  };

  // בדיקת התראות תקציב
  const checkBudgetAlerts = () => {
    const alerts = [];
    const monthTransactions = getMonthTransactions();
    
    // בדיקת חריגות תקציב לכל קטגוריה
    for (const budget of state.budgets) {
      // לוקח רק תקציבי הוצאות (לא הכנסות)
      const category = state.categories.find(c => c.id === budget.categoryId);
      if (!category || category.type !== 'expense') continue;
      
      const expenses = monthTransactions
        .filter((tx) => tx.type === "expense" && tx.categoryId === budget.categoryId)
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const budgetLimit = budget.amount;
      const percentage = (expenses / budgetLimit) * 100;
      
      if (percentage >= 85) {
        alerts.push({
          categoryId: budget.categoryId,
          spent: expenses,
          limit: budgetLimit,
          percentage,
        });
      }
    }
    
    return alerts.sort((a, b) => b.percentage - a.percentage);
  };

  // חישוב נתונים פעם אחת
  const stats = calculateStats();
  const timeData = getCashFlowData();
  const categoryData = getCategoryData();
  const budgetAlerts = checkBudgetAlerts();

  // הצגת התראה כשיש חריגה במאזן
  useEffect(() => {
    if (balanceAlert && isSameMonth(selectedDate, new Date())) {
      toast({
        title: "התראת מאזן שלילי!",
        description: `ההוצאות שלך (${formatCurrency(balanceAlert.expenses)}) גבוהות מההכנסות (${formatCurrency(balanceAlert.income)}) בחודש זה.`,
        variant: "destructive",
      });
    }
  }, [balanceAlert, toast, selectedDate]);

  return {
    stats,
    timeData,
    categoryData,
    budgetAlerts,
    balanceAlert,
    formatCurrency,
  };
};
