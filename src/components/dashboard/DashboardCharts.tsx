
import React from "react";
import ChartCard from "./ChartCard";
import CashFlowChart from "./CashFlowChart";
import ExpensePieChart from "./ExpensePieChart";

interface DashboardChartsProps {
  timeData: { date: string; income: number; expense: number }[];
  categoryData: { name: string; value: number; color: string }[];
  formatCurrency: (value: number) => string;
}

const DashboardCharts = ({ timeData, categoryData, formatCurrency }: DashboardChartsProps) => {
  return (
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
  );
};

export default DashboardCharts;
