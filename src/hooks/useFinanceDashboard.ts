
import { useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { useCurrencyFormatter } from "./finance/useCurrencyFormatter";
import { useTransactionFilters } from "./finance/useTransactionFilters";
import { useFinanceStats } from "./finance/useFinanceStats";
import { useChartData } from "./finance/useChartData";
import { useBudgetAlerts } from "./finance/useBudgetAlerts";

/**
 * Combined hook for the finance dashboard
 */
export const useFinanceDashboard = (selectedDate: Date) => {
  const { state } = useFinance();
  const { formatCurrency } = useCurrencyFormatter();
  const { getMonthTransactions } = useTransactionFilters();
  const { calculateStats } = useFinanceStats(state.transactions, selectedDate);
  const { calculateTimeData, calculateCategoryData } = useChartData(state.transactions, state.categories, selectedDate);
  const { calculateBudgetAlerts, calculateBalanceAlert } = useBudgetAlerts(state.budgets, state.categories, state.transactions, selectedDate);

  // מחשב נתונים סטטיסטיים
  const stats = useMemo(() => calculateStats(), [calculateStats]);

  // מחשב נתוני גרפים
  const timeData = useMemo(() => calculateTimeData(), [calculateTimeData]);
  const categoryData = useMemo(() => calculateCategoryData(), [calculateCategoryData]);

  // מחשב התראות תקציב
  const budgetAlerts = useMemo(() => calculateBudgetAlerts(), [calculateBudgetAlerts]);
  const balanceAlert = useMemo(() => calculateBalanceAlert(stats), [calculateBalanceAlert, stats]);

  return {
    stats,
    timeData,
    categoryData,
    budgetAlerts,
    balanceAlert,
    formatCurrency
  };
};
