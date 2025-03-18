
import { Transaction } from "@/types";

/**
 * הוק עם פונקציות סינון להכנסות
 */
export const useIncomeFilters = () => {
  /**
   * בדיקה אם עסקה היא עסקת הכנסה חודשית
   */
  const isMonthlyIncome = (tx: Transaction): boolean => {
    return (
      tx.type === "income" && 
      tx.amount === 16000 && 
      tx.description === "משכורת חודשית קבועה"
    );
  };

  /**
   * ניקוי עסקאות הכנסה חודשיות מהמערך
   */
  const cleanMonthlyIncomes = (transactions: Transaction[]): Transaction[] => {
    return transactions.filter(tx => !isMonthlyIncome(tx));
  };

  return {
    isMonthlyIncome,
    cleanMonthlyIncomes
  };
};
