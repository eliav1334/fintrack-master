
import React, { useEffect, useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { format } from "date-fns";
import { ArrowDownCircle, ArrowUpCircle, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SummaryCard from "./dashboard/SummaryCard";
import ChartCard from "./dashboard/ChartCard";
import CashFlowChart from "./dashboard/CashFlowChart";
import ExpensePieChart from "./dashboard/ExpensePieChart";
import BudgetAlertCard from "./dashboard/BudgetAlertCard";

type PeriodStats = {
  income: number;
  expense: number;
  balance: number;
  incomeChange: number;
  expenseChange: number;
  balanceChange: number;
};

const Dashboard = () => {
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
  const [budgetAlerts, setBudgetAlerts] = useState<{ categoryName: string; current: number; limit: number; percentage: number }[]>([]);
  const [notifiedBudgets, setNotifiedBudgets] = useState<Set<string>>(new Set());

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
    const alerts: { categoryName: string; current: number; limit: number; percentage: number }[] = [];
    
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
  }, [state.transactions, state.categories, state.budgets, toast, notifiedBudgets]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
    }).format(value);
  };

  return (
    <div className="animate-fade-in p-6 space-y-6">
      <h1 className="text-3xl font-semibold mb-6">סקירה פיננסית</h1>
      
      {/* כרטיסי סיכום */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="הכנסות"
          description="חודש נוכחי"
          icon={<ArrowUpCircle className="h-5 w-5 text-finance-income" />}
          value={formatCurrency(stats.income)}
          changeDirection={stats.incomeChange > 0 ? "up" : "down"}
          changeValue={`${stats.incomeChange.toFixed(1)}% מהחודש הקודם`}
          iconComponent={
            stats.incomeChange > 0 ? (
              <TrendingUp className="h-4 w-4 text-finance-income ml-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-finance-expense ml-1" />
            )
          }
        />
        
        <SummaryCard
          title="הוצאות"
          description="חודש נוכחי"
          icon={<ArrowDownCircle className="h-5 w-5 text-finance-expense" />}
          value={formatCurrency(stats.expense)}
          changeDirection={stats.expenseChange < 0 ? "up" : "down"}
          changeValue={`${Math.abs(stats.expenseChange).toFixed(1)}% ${
            stats.expenseChange < 0 ? "פחות" : "יותר"
          } מהחודש הקודם`}
          iconComponent={
            stats.expenseChange < 0 ? (
              <TrendingDown className="h-4 w-4 text-finance-income ml-1" />
            ) : (
              <TrendingUp className="h-4 w-4 text-finance-expense ml-1" />
            )
          }
        />
        
        <SummaryCard
          title="מאזן"
          description="חודש נוכחי"
          icon={<DollarSign className="h-5 w-5 text-finance-budget" />}
          value={formatCurrency(stats.balance)}
          changeDirection={stats.balanceChange > 0 ? "up" : "down"}
          changeValue={`${stats.balanceChange.toFixed(1)}% מהחודש הקודם`}
          iconComponent={
            stats.balanceChange > 0 ? (
              <TrendingUp className="h-4 w-4 text-finance-income ml-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-finance-expense ml-1" />
            )
          }
        />
      </div>

      {/* גרפים */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ChartCard
          title="תזרים מזומנים חודשי"
          description="הכנסות מול הוצאות ב-30 הימים האחרונים"
        >
          <CashFlowChart data={timeData} formatCurrency={formatCurrency} />
        </ChartCard>

        <ChartCard
          title="קטגוריות הוצאות"
          description="הוצאות החודש הנוכחי לפי קטגוריה"
        >
          <ExpensePieChart data={categoryData} formatCurrency={formatCurrency} />
        </ChartCard>
      </div>

      {/* התראות תקציב */}
      {budgetAlerts.length > 0 && (
        <BudgetAlertCard alerts={budgetAlerts} formatCurrency={formatCurrency} />
      )}
    </div>
  );
};

export default Dashboard;
