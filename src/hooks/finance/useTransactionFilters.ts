
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Transaction } from "@/types";

/**
 * הוק לסינון עסקאות לפי תאריך
 */
export const useTransactionFilters = () => {
  // קבלת נתוני החודש הנבחר
  const getMonthTransactions = (transactions: Transaction[], selectedDate: Date) => {
    const firstDay = startOfMonth(selectedDate);
    const lastDay = endOfMonth(selectedDate);

    return transactions.filter(
      (tx) => {
        const txDate = new Date(tx.date);
        return txDate >= firstDay && txDate <= lastDay;
      }
    );
  };

  // קבלת נתוני החודש הקודם
  const getPreviousMonthTransactions = (transactions: Transaction[], selectedDate: Date) => {
    const previousMonth = subMonths(selectedDate, 1);
    const firstDay = startOfMonth(previousMonth);
    const lastDay = endOfMonth(previousMonth);

    return transactions.filter(
      (tx) => {
        const txDate = new Date(tx.date);
        return txDate >= firstDay && txDate <= lastDay;
      }
    );
  };

  return {
    getMonthTransactions,
    getPreviousMonthTransactions
  };
};
