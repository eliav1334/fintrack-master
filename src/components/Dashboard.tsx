
import React from "react";
import { useFinanceDashboard } from "@/hooks/useFinanceDashboard";
import DashboardSummaryCards from "./dashboard/DashboardSummaryCards";
import DashboardCharts from "./dashboard/DashboardCharts";
import BudgetAlertCard from "./dashboard/BudgetAlertCard";

const Dashboard = () => {
  const {
    stats,
    timeData,
    categoryData,
    budgetAlerts,
    balanceAlert,
    formatCurrency
  } = useFinanceDashboard();

  return (
    <div className="animate-fade-in p-6 space-y-6">
      <h1 className="text-3xl font-semibold mb-6">סקירה פיננסית</h1>
      
      {/* כרטיסי סיכום */}
      <DashboardSummaryCards stats={stats} formatCurrency={formatCurrency} />

      {/* גרפים */}
      <DashboardCharts 
        timeData={timeData}
        categoryData={categoryData}
        formatCurrency={formatCurrency}
      />

      {/* התראות תקציב */}
      <BudgetAlertCard 
        alerts={budgetAlerts} 
        balanceAlert={balanceAlert || undefined} 
        formatCurrency={formatCurrency} 
      />
    </div>
  );
};

export default Dashboard;
