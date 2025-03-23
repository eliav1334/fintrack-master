
import { useState, useMemo } from "react";
import { Transaction } from "../types";

/**
 * הוק לסינון עסקאות על בסיס משתנים שונים
 */
export const useTransactionFilters = (transactions: Transaction[]) => {
  const [filters, setFilters] = useState({
    keyword: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    selectedTypes: [] as string[],
    selectedCategories: [] as string[],
  });

  // פונקציה לעדכון פילטר בודד
  const updateFilter = (name: string, value: string | string[]) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // פונקציה לניקוי כל הפילטרים
  const clearFilters = () => {
    setFilters({
      keyword: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      selectedTypes: [],
      selectedCategories: []
    });
  };

  // עסקאות מסוננות
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // סינון לפי מילת חיפוש
      if (filters.keyword && 
          !transaction.description.toLowerCase().includes(filters.keyword.toLowerCase())) {
        return false;
      }
      
      // סינון לפי תאריך התחלה
      if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) {
        return false;
      }
      
      // סינון לפי תאריך סיום
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59); // סוף היום
        if (new Date(transaction.date) > endDate) {
          return false;
        }
      }
      
      // סינון לפי סכום מינימלי
      if (filters.minAmount && Number(transaction.amount) < Number(filters.minAmount)) {
        return false;
      }
      
      // סינון לפי סכום מקסימלי
      if (filters.maxAmount && Number(transaction.amount) > Number(filters.maxAmount)) {
        return false;
      }
      
      // סינון לפי סוגי עסקאות
      if (filters.selectedTypes.length > 0 && 
          !filters.selectedTypes.includes(transaction.type)) {
        return false;
      }
      
      // סינון לפי קטגוריות
      if (filters.selectedCategories.length > 0 && 
          !filters.selectedCategories.includes(transaction.categoryId || "")) {
        return false;
      }
      
      return true;
    });
  }, [transactions, filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    filteredTransactions
  };
};
