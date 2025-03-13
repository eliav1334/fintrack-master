
import { generateId } from "@/utils/generateId";
import { Transaction } from "@/types";
import { format, parseISO } from "date-fns";

/**
 * Hook to handle monthly income transactions
 */
export const useMonthlyIncomes = () => {
  // חיפוש האם ישנם נתוני localStorage להסרה (לצורך איפוס)
  const resetAllStoredData = () => {
    // הסרת כל הנתונים השמורים ב-localStorage
    localStorage.removeItem("financeState");
    return true;
  };

  /**
   * Creates fixed monthly income transactions for the last 7 months
   * Adds exactly one income transaction per month of 16,000 ₪
   */
  const addMonthlyIncomes = (): Transaction[] => {
    const currentDate = new Date();
    
    // Create array of the last 7 months
    const last7Months = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return format(date, "yyyy-MM");
    });
    
    // Prepare new transactions to add
    const newTransactions: Transaction[] = [];
    
    // For each of the last 7 months, add a monthly income
    last7Months.forEach(month => {
      const [year, monthNum] = month.split("-");
      
      // Create date for the 1st day of the month (payday)
      const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      
      const monthlyIncome: Transaction = {
        id: generateId(`income-${month}`), // Unique ID for each month
        description: "משכורת חודשית קבועה",
        amount: 16000,
        type: "income",
        date: format(date, "yyyy-MM-dd"),
        categoryId: "",
        notes: `הכנסה חודשית קבועה לחודש ${month}`
      };
      
      // Add to new transactions array
      newTransactions.push(monthlyIncome);
    });
    
    return newTransactions;
  };

  /**
   * Checks if a transaction is a monthly income transaction
   */
  const isMonthlyIncome = (tx: Transaction): boolean => {
    return (
      tx.type === "income" && 
      tx.amount === 16000 && 
      tx.description === "משכורת חודשית קבועה"
    );
  };

  /**
   * Cleans monthly income transactions from the array
   */
  const cleanMonthlyIncomes = (transactions: Transaction[]): Transaction[] => {
    return transactions.filter(tx => !isMonthlyIncome(tx));
  };

  return {
    addMonthlyIncomes,
    cleanMonthlyIncomes,
    isMonthlyIncome,
    resetAllStoredData
  };
};
