
import { useState, useEffect } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type PeriodStats = {
  income: number;
  expense: number;
  balance: number;
  incomeChange: number;
  expenseChange: number;
  balanceChange: number;
};

export const useFinanceDashboard = () => {
  const { state } = useFinance();
  const { toast } = useToast();
  const [stats, setStats] = useState<PeriodStats>({
    income: 0,
    expense: 0,
    balance: 0,
    incomeChange: 0,
    expenseChange: 0,
    balanceChange: 0,
  });
  const [timeData, setTimeData] = useState<{ date: string; income: number; expense: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [budgetAlerts, setBudgetAlerts] = useState<{ categoryName: string; current: number; limit: number; percentage: number; type?: "income" | "expense" }[]>([]);
  const [balanceAlert, setBalanceAlert] = useState<{ isNegative: boolean; income: number; expense: number; difference: number } | null>(null);
  const [notifiedBudgets, setNotifiedBudgets] = useState<Set<string>>(new Set());
  const [notifiedNegativeBalance, setNotifiedNegativeBalance] = useState<boolean>(false);

  useEffect(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // חישוב העסקאות של החודש הנוכחי
    const currentMonthTransactions = state.transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    // חישוב העסקאות של החודש הקודם
    const lastMonthTransactions = state.transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === lastMonth && txDate.getFullYear() === lastMonthYear;
    });

    // חישוב הנתונים לחודש הנוכחי
    const currentIncome = currentMonthTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const currentExpense = currentMonthTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const currentBalance = currentIncome - currentExpense;

    // חישוב הנתונים לחודש הקודם
    const lastIncome = lastMonthTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const lastExpense = lastMonthTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const lastBalance = lastIncome - lastExpense;

    // חישוב אחוזי השינוי
    const calculateChange = (current: number, last: number) => {
      if (last === 0) return current > 0 ? 100 : 0;
      return ((current - last) / last) * 100;
    };

    setStats({
      income: currentIncome,
      expense: currentExpense,
      balance: currentBalance,
      incomeChange: calculateChange(currentIncome, lastIncome),
      expenseChange: calculateChange(currentExpense, lastExpense),
      balanceChange: calculateChange(currentBalance, lastBalance),
    });

    // בדיקה אם המאזן שלילי והגדרת התראה
    if (currentIncome > 0 && currentExpense > 0) {
      const isNegative = currentBalance < 0;
      if (isNegative) {
        setBalanceAlert({
          isNegative,
          income: currentIncome,
          expense: currentExpense,
          difference: Math.abs(currentBalance),
        });
        
        // הצגת התראה על מאזן שלילי (רק פעם אחת)
        if (!notifiedNegativeBalance) {
          toast({
            title: "התראת מאזן שלילי",
            description: `ההוצאות (${new Intl.NumberFormat("he-IL", {
              style: "currency",
              currency: "ILS",
            }).format(currentExpense)}) גבוהות מההכנסות (${new Intl.NumberFormat("he-IL", {
              style: "currency",
              currency: "ILS",
            }).format(currentIncome)}) בחודש הנוכחי`,
            variant: "destructive",
          });
          setNotifiedNegativeBalance(true);
        }
      } else {
        setBalanceAlert(null);
      }
    } else {
      setBalanceAlert(null);
    }

    // יצירת נתונים לגרף של 30 הימים האחרונים
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const timeSeriesData: Record<string, { income: number; expense: number }> = {};
    
    // אתחול עם ערכים אפסיים לכל התאריכים
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = format(date, "MM/dd");
      timeSeriesData[dateStr] = { income: 0, expense: 0 };
    }
    
    // מילוי נתוני העסקאות בפועל
    state.transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      if (txDate >= last30Days) {
        const dateStr = format(txDate, "MM/dd");
        if (timeSeriesData[dateStr]) {
          if (tx.type === "income") {
            timeSeriesData[dateStr].income += tx.amount;
          } else {
            timeSeriesData[dateStr].expense += tx.amount;
          }
        }
      }
    });
    
    // המרה למערך עבור הגרף
    const timeDataArray = Object.keys(timeSeriesData).map((date) => ({
      date,
      income: timeSeriesData[date].income,
      expense: timeSeriesData[date].expense,
    }));
    
    // מיון לפי תאריך
    timeDataArray.sort((a, b) => {
      const [monthA, dayA] = a.date.split("/").map(Number);
      const [monthB, dayB] = b.date.split("/").map(Number);
      if (monthA !== monthB) return monthA - monthB;
      return dayA - dayB;
    });
    
    setTimeData(timeDataArray);

    // יצירת נתוני קטגוריות להוצאות
    const categoryTotals: Record<string, number> = {};
    currentMonthTransactions
      .filter((tx) => tx.type === "expense")
      .forEach((tx) => {
        if (!categoryTotals[tx.categoryId]) {
          categoryTotals[tx.categoryId] = 0;
        }
        categoryTotals[tx.categoryId] += tx.amount;
      });

    const categoryChartData = Object.keys(categoryTotals).map((categoryId) => {
      const category = state.categories.find((cat) => cat.id === categoryId);
      return {
        name: category?.name || "לא מקוטלג",
        value: categoryTotals[categoryId],
        color: category?.color || "#9ca3af",
      };
    });

    setCategoryData(categoryChartData);

    // בדיקת התראות תקציב
    const alerts: { categoryName: string; current: number; limit: number; percentage: number; type?: "income" | "expense" }[] = [];
    
    state.budgets.forEach((budget) => {
      const category = state.categories.find((cat) => cat.id === budget.categoryId);
      if (!category) return;
      
      const currentSpent = currentMonthTransactions
        .filter((tx) => tx.categoryId === budget.categoryId)
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const percentage = (currentSpent / budget.amount) * 100;
      
      if (percentage > 80) {
        alerts.push({
          categoryName: category.name,
          current: currentSpent,
          limit: budget.amount,
          percentage,
          type: category.type
        });
      }
    });
    
    setBudgetAlerts(alerts);

    // הצגת הודעת התראה עבור חריגות תקציב קריטיות - רק פעם אחת עבור כל תקציב
    alerts.forEach((alert) => {
      if (alert.percentage > 100 && !notifiedBudgets.has(alert.categoryName)) {
        toast({
          title: "התראת תקציב",
          description: `השתמשת ב-${alert.percentage.toFixed(0)}% מהתקציב שלך בקטגוריית ${alert.categoryName}`,
          variant: "destructive",
        });
        
        // שמירת התקציבים שכבר הוצגה עליהם התראה
        setNotifiedBudgets(prev => {
          const newSet = new Set(prev);
          newSet.add(alert.categoryName);
          return newSet;
        });
      }
    });
  }, [state.transactions, state.categories, state.budgets, toast, notifiedBudgets, notifiedNegativeBalance]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
    }).format(value);
  };

  return {
    stats,
    timeData,
    categoryData,
    budgetAlerts,
    balanceAlert,
    formatCurrency
  };
};
