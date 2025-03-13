
import { useState, useEffect } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { startOfMonth, endOfMonth, format, subMonths, isSameMonth } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

export const useFinanceDashboard = (selectedDate: Date = new Date()) => {
  const { state } = useFinance();
  const { toast } = useToast();
  const [balanceAlert, setBalanceAlert] = useState<{
    isNegative: boolean;
    income: number;
    expense: number;
    difference: number;
  } | null>(null);

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

  // קבלת נתוני החודש הקודם
  const getPreviousMonthTransactions = () => {
    const previousMonth = subMonths(selectedDate, 1);
    const firstDay = startOfMonth(previousMonth);
    const lastDay = endOfMonth(previousMonth);

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
    const prevMonthTransactions = getPreviousMonthTransactions();
    
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

    // בדיקת התראת מאזן
    if (balance < 0) {
      setBalanceAlert({
        isNegative: true,
        income: income,
        expense: expense,
        difference: balance
      });
    } else {
      setBalanceAlert(null);
    }

    return {
      income,
      expense,
      balance,
      incomeChange,
      expenseChange,
      balanceChange
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
        description: `ההוצאות שלך (${formatCurrency(balanceAlert.expense)}) גבוהות מההכנסות (${formatCurrency(balanceAlert.income)}) בחודש זה.`,
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
