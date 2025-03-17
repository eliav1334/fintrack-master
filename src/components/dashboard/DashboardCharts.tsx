
import React from "react";
import ChartCard from "./ChartCard";
import CashFlowChart from "./CashFlowChart";
import ExpensePieChart from "./ExpensePieChart";
import { useFinance } from "@/contexts/FinanceContext";

interface DashboardChartsProps {
  timeData: { date: string; income: number; expense: number }[];
  categoryData: { name: string; value: number; color: string }[];
  formatCurrency: (value: number) => string;
  stats: {
    income: number;
    expense: number;
    balance: number;
    incomeChange: number;
    expenseChange: number;
    balanceChange: number;
  };
}

const DashboardCharts = ({ timeData, categoryData, formatCurrency, stats }: DashboardChartsProps) => {
  const { state } = useFinance();
  
  // חישוב נתוני חיסכון
  const savings = stats.income - stats.expense;
  const savingsData = [
    { name: "חיסכון נטו", value: savings, color: "#3b82f6" },
  ];
  
  // קבוצות קטגוריות להכנסות (אם יש כאלה)
  const incomeCategories = state.categories.filter(cat => cat.type === "income");
  const incomeData = incomeCategories.length > 0 
    ? incomeCategories.map((cat, index) => {
        // מחשב את סך ההכנסות בקטגוריה זו
        const categoryTransactions = state.transactions.filter(
          tx => tx.type === "income" && tx.categoryId === cat.id
        );
        
        const categoryTotal = categoryTransactions.reduce(
          (sum, tx) => sum + tx.amount, 0
        );
        
        const colors = ["#34d399", "#10b981", "#059669", "#047857", "#065f46"];
        
        return {
          name: cat.name,
          value: categoryTotal,
          color: colors[index % colors.length]
        };
      }).filter(item => item.value > 0)
    : [{ name: "הכנסה כללית", value: stats.income, color: "#34d399" }];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      <ChartCard
        title="פילוח הכנסות"
        description="הכנסות בחודש הנוכחי לפי קטגוריה"
      >
        <ExpensePieChart 
          data={incomeData} 
          formatCurrency={formatCurrency} 
          title="הכנסות"
          totalAmount={stats.income}
          changePercentage={stats.incomeChange}
        />
      </ChartCard>

      <ChartCard
        title="פילוח הוצאות"
        description="הוצאות בחודש הנוכחי לפי קטגוריה"
      >
        <ExpensePieChart 
          data={categoryData} 
          formatCurrency={formatCurrency} 
          title="הוצאות"
          totalAmount={stats.expense}
          changePercentage={stats.expenseChange}
        />
      </ChartCard>
      
      <ChartCard
        title="חיסכון והשקעה"
        description="הפרש בין הכנסות להוצאות בחודש הנוכחי"
      >
        <ExpensePieChart 
          data={savingsData} 
          formatCurrency={formatCurrency} 
          title="חיסכון"
          totalAmount={savings}
          changePercentage={stats.balanceChange}
        />
      </ChartCard>
      
      <ChartCard
        className="lg:col-span-3"
        title="תזרים מזומנים חודשי"
        description="הכנסות מול הוצאות ב-30 הימים האחרונים"
      >
        <CashFlowChart data={timeData} formatCurrency={formatCurrency} />
      </ChartCard>
    </div>
  );
};

export default DashboardCharts;
