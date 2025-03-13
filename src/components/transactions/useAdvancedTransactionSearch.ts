
import { useMemo, useState } from "react";
import { Transaction } from "@/types";

interface DateRange {
  from: string | null;
  to: string | null;
}

interface AmountRange {
  min: number | null;
  max: number | null;
}

interface TransactionSearchFilters {
  searchTerm: string;
  categoryId: string | "all";
  type: "all" | "income" | "expense";
  dateRange: DateRange;
  amountRange: AmountRange;
  sortBy: "date" | "amount" | "description";
  sortDirection: "asc" | "desc";
}

export interface UseAdvancedTransactionSearchResult {
  filters: TransactionSearchFilters;
  setSearchTerm: (term: string) => void;
  setCategoryFilter: (categoryId: string) => void;
  setTypeFilter: (type: "all" | "income" | "expense") => void;
  setDateRange: (range: DateRange) => void;
  setAmountRange: (range: AmountRange) => void;
  setSortBy: (field: "date" | "amount" | "description") => void;
  setSortDirection: (direction: "asc" | "desc") => void;
  resetFilters: () => void;
  filteredTransactions: Transaction[];
}

/**
 * הוק מתקדם לחיפוש וסינון עסקאות
 */
export const useAdvancedTransactionSearch = (transactions: Transaction[]): UseAdvancedTransactionSearchResult => {
  // מצב התחלתי של פילטרים
  const [filters, setFilters] = useState<TransactionSearchFilters>({
    searchTerm: "",
    categoryId: "all",
    type: "all",
    dateRange: { from: null, to: null },
    amountRange: { min: null, max: null },
    sortBy: "date",
    sortDirection: "desc"
  });
  
  // עדכון פילטרים בודדים
  const setSearchTerm = (term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  };
  
  const setCategoryFilter = (categoryId: string) => {
    setFilters(prev => ({ ...prev, categoryId }));
  };
  
  const setTypeFilter = (type: "all" | "income" | "expense") => {
    setFilters(prev => ({ ...prev, type }));
  };
  
  const setDateRange = (dateRange: DateRange) => {
    setFilters(prev => ({ ...prev, dateRange }));
  };
  
  const setAmountRange = (amountRange: AmountRange) => {
    setFilters(prev => ({ ...prev, amountRange }));
  };
  
  const setSortBy = (sortBy: "date" | "amount" | "description") => {
    setFilters(prev => ({ ...prev, sortBy }));
  };
  
  const setSortDirection = (sortDirection: "asc" | "desc") => {
    setFilters(prev => ({ ...prev, sortDirection }));
  };
  
  // איפוס כל הפילטרים
  const resetFilters = () => {
    setFilters({
      searchTerm: "",
      categoryId: "all",
      type: "all",
      dateRange: { from: null, to: null },
      amountRange: { min: null, max: null },
      sortBy: "date",
      sortDirection: "desc"
    });
  };
  
  // חישוב העסקאות המסוננות על פי הפילטרים
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    
    // סינון לפי מונח חיפוש
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(tx => 
        tx.description.toLowerCase().includes(searchLower) || 
        tx.notes?.toLowerCase().includes(searchLower)
      );
    }
    
    // סינון לפי קטגוריה
    if (filters.categoryId !== "all") {
      result = result.filter(tx => tx.categoryId === filters.categoryId);
    }
    
    // סינון לפי סוג (הכנסה/הוצאה)
    if (filters.type !== "all") {
      result = result.filter(tx => tx.type === filters.type);
    }
    
    // סינון לפי טווח תאריכים
    if (filters.dateRange.from) {
      result = result.filter(tx => tx.date >= filters.dateRange.from!);
    }
    
    if (filters.dateRange.to) {
      result = result.filter(tx => tx.date <= filters.dateRange.to!);
    }
    
    // סינון לפי טווח סכומים
    if (filters.amountRange.min !== null) {
      result = result.filter(tx => tx.amount >= filters.amountRange.min!);
    }
    
    if (filters.amountRange.max !== null) {
      result = result.filter(tx => tx.amount <= filters.amountRange.max!);
    }
    
    // מיון התוצאות
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "description":
          comparison = a.description.localeCompare(b.description);
          break;
      }
      
      // היפוך המיון אם הכיוון הוא יורד
      return filters.sortDirection === "desc" ? -comparison : comparison;
    });
    
    return result;
  }, [transactions, filters]);
  
  return {
    filters,
    setSearchTerm,
    setCategoryFilter,
    setTypeFilter,
    setDateRange,
    setAmountRange,
    setSortBy,
    setSortDirection,
    resetFilters,
    filteredTransactions
  };
};
