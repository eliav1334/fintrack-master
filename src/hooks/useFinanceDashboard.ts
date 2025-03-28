
import { useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { useCurrencyFormatter } from "./finance/useCurrencyFormatter";
import { useTransactionFilters } from "./finance/useTransactionFilters";
import { useFinanceStats } from "./finance/useFinanceStats";
import { useChartData } from "./finance/useChartData";
import { useBudgetAlerts } from "./finance/useBudgetAlerts";

/**
 * הוק משולב לדשבורד הפיננסי
 */
export const useFinanceDashboard = (selectedDate: Date) => {
  const { state } = useFinance();
  const { formatCurrency } = useCurrencyFormatter();
  const { getMonthTransactions } = useTransactionFilters();
  const { calculateStats } = useFinanceStats(state.transactions, selectedDate);
  const { getCashFlowData, getCategoryData, getIncomeData } = useChartData(state.transactions, state.categories, selectedDate);
  
  // סדר הפרמטרים תואם להגדרת useBudgetAlerts
  const { checkBudgetAlerts, checkBalanceAlert } = useBudgetAlerts(
    state.transactions,
    state.categories,
    state.budgets,
    selectedDate
  );

  // מחשב נתונים סטטיסטיים
  const stats = useMemo(() => calculateStats(), [calculateStats]);

  // מחשב נתוני גרפים
  const timeData = useMemo(() => getCashFlowData(), [getCashFlowData]);
  const categoryData = useMemo(() => getCategoryData(), [getCategoryData]);
  const incomeData = useMemo(() => getIncomeData(), [getIncomeData]);

  // מחשב התראות תקציב
  const budgetAlerts = useMemo(() => checkBudgetAlerts(), [checkBudgetAlerts]);
  const balanceAlert = useMemo(() => checkBalanceAlert(), [checkBalanceAlert]);

  return {
    stats,
    timeData,
    categoryData,
    incomeData,
    budgetAlerts,
    balanceAlert,
    formatCurrency
  };
};
