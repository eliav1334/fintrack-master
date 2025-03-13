import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "@/contexts/FinanceContext";
import { Transaction } from "@/types";
import { format } from "date-fns";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownCircle, ArrowUpCircle, ChevronRight, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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

  useEffect(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Calculate current month transactions
    const currentMonthTransactions = state.transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    // Calculate last month transactions
    const lastMonthTransactions = state.transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === lastMonth && txDate.getFullYear() === lastMonthYear;
    });

    // Calculate current month stats
    const currentIncome = currentMonthTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const currentExpense = currentMonthTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const currentBalance = currentIncome - currentExpense;

    // Calculate last month stats
    const lastIncome = lastMonthTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const lastExpense = lastMonthTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const lastBalance = lastIncome - lastExpense;

    // Calculate change percentages
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

    // Generate time series data for the last 30 days
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const timeSeriesData: Record<string, { income: number; expense: number }> = {};
    
    // Initialize with zero values for all dates
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = format(date, "MM/dd");
      timeSeriesData[dateStr] = { income: 0, expense: 0 };
    }
    
    // Fill in actual transaction data
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
    
    // Convert to array for chart
    const timeDataArray = Object.keys(timeSeriesData).map((date) => ({
      date,
      income: timeSeriesData[date].income,
      expense: timeSeriesData[date].expense,
    }));
    
    // Sort by date
    timeDataArray.sort((a, b) => {
      const [monthA, dayA] = a.date.split("/").map(Number);
      const [monthB, dayB] = b.date.split("/").map(Number);
      if (monthA !== monthB) return monthA - monthB;
      return dayA - dayB;
    });
    
    setTimeData(timeDataArray);

    // Generate category data
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
        name: category?.name || "Uncategorized",
        value: categoryTotals[categoryId],
        color: category?.color || "#9ca3af",
      };
    });

    setCategoryData(categoryChartData);

    // Check budget alerts
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

    // Show alert toast for critical budget alerts
    alerts.forEach((alert) => {
      if (alert.percentage > 90) {
        toast({
          title: "Budget Alert",
          description: `You've used ${alert.percentage.toFixed(0)}% of your ${alert.categoryName} budget`,
          variant: "destructive",
        });
      }
    });
  }, [state.transactions, state.categories, state.budgets, toast]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
    }).format(value);
  };

  return (
    <div className="animate-fade-in p-6 space-y-6">
      <h1 className="text-3xl font-semibold mb-6">Financial Overview</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="finance-card finance-card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span>Income</span>
              <ArrowUpCircle className="h-5 w-5 text-finance-income" />
            </CardTitle>
            <CardDescription>Current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.income)}</div>
            <div className="flex items-center mt-2 text-sm">
              {stats.incomeChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-finance-income mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-finance-expense mr-1" />
              )}
              <span className={stats.incomeChange > 0 ? "text-finance-income" : "text-finance-expense"}>
                {stats.incomeChange.toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="finance-card finance-card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span>Expenses</span>
              <ArrowDownCircle className="h-5 w-5 text-finance-expense" />
            </CardTitle>
            <CardDescription>Current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.expense)}</div>
            <div className="flex items-center mt-2 text-sm">
              {stats.expenseChange < 0 ? (
                <TrendingDown className="h-4 w-4 text-finance-income mr-1" />
              ) : (
                <TrendingUp className="h-4 w-4 text-finance-expense mr-1" />
              )}
              <span className={stats.expenseChange < 0 ? "text-finance-income" : "text-finance-expense"}>
                {Math.abs(stats.expenseChange).toFixed(1)}% {stats.expenseChange < 0 ? "less" : "more"} than last month
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="finance-card finance-card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span>Balance</span>
              <DollarSign className="h-5 w-5 text-finance-budget" />
            </CardTitle>
            <CardDescription>Current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", stats.balance < 0 ? "text-finance-expense" : "")}>
              {formatCurrency(stats.balance)}
            </div>
            <div className="flex items-center mt-2 text-sm">
              {stats.balanceChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-finance-income mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-finance-expense mr-1" />
              )}
              <span className={stats.balanceChange > 0 ? "text-finance-income" : "text-finance-expense"}>
                {stats.balanceChange.toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="finance-card">
          <CardHeader>
            <CardTitle>Monthly Cash Flow</CardTitle>
            <CardDescription>Income vs. Expenses over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stackId="1" 
                  stroke="#34d399" 
                  fill="#34d399" 
                  fillOpacity={0.6} 
                  animationDuration={1000}
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stackId="2" 
                  stroke="#f87171" 
                  fill="#f87171" 
                  fillOpacity={0.6}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="finance-card">
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Current month expenses by category</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  labelLine={false}
                  animationDuration={1000}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    return percent > 0.05 ? (
                      <text
                        x={x}
                        y={y}
                        fill="#888888"
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        fontSize="12"
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    ) : null;
                  }}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <Card className="finance-card mt-6 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-amber-700 dark:text-amber-400">Budget Alerts</CardTitle>
            <CardDescription>Categories that are approaching or exceeding budget limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetAlerts.map((alert, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{alert.categoryName}</p>
                    <div className="text-sm text-slate-500">
                      {formatCurrency(alert.current)} of {formatCurrency(alert.limit)}
                    </div>
                  </div>
                  <div className={cn(
                    "text-white px-2 py-1 rounded-full text-sm font-medium",
                    alert.percentage > 100 
                      ? "bg-finance-expense" 
                      : alert.percentage > 90 
                        ? "bg-amber-500" 
                        : "bg-amber-400"
                  )}>
                    {alert.percentage.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
