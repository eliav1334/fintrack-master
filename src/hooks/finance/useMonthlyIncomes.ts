
import { Transaction } from "@/types";
import { useSystemReset } from "./storage/useSystemReset";
import { useIncomeTransactions } from "./income/useIncomeTransactions";
import { useIncomeFilters } from "./income/useIncomeFilters";

/**
 * הוק לניהול עסקאות הכנסה חודשיות
 * משלב את כל הפונקציונליות הקשורה לניהול הכנסות
 */
export const useMonthlyIncomes = () => {
  const { resetAllStoredData, enableAutoIncomes, isImportBlocked, enableDataImport } = useSystemReset();
  const { addMonthlyIncomes } = useIncomeTransactions();
  const { isMonthlyIncome, cleanMonthlyIncomes } = useIncomeFilters();

  return {
    addMonthlyIncomes,
    cleanMonthlyIncomes,
    isMonthlyIncome,
    resetAllStoredData,
    enableAutoIncomes,
    isImportBlocked,
    enableDataImport
  };
};
