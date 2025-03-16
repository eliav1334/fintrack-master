
import { useState, useEffect } from "react";
import { Transaction } from "@/types";
import { startOfMonth, endOfMonth } from "date-fns";
import { useSearchParams } from "react-router-dom";

export const useTransactionFilters = (transactions: Transaction[]) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  
  // URL parameter handling
  const [searchParams] = useSearchParams();
  const monthParam = searchParams.get('month');
  
  useEffect(() => {
    if (monthParam) {
      try {
        const dateFromParam = new Date(monthParam);
        if (!isNaN(dateFromParam.getTime())) {
          setSelectedMonth(dateFromParam);
        }
      } catch (error) {
        console.error("שגיאה בפרמטר החודש:", error);
      }
    }
  }, [monthParam]);

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setTypeFilter("all");
    setDateFilter("all");
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filter by selected month
    if (selectedMonth) {
      const firstDayOfMonth = startOfMonth(selectedMonth);
      const lastDayOfMonth = endOfMonth(selectedMonth);
      
      filtered = filtered.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= firstDayOfMonth && txDate <= lastDayOfMonth;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((tx) => tx.categoryId === categoryFilter);
    }

    // Filter by transaction type
    if (typeFilter !== "all") {
      filtered = filtered.filter((tx) => tx.type === typeFilter);
    }

    // Filter by date range
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.date);
        switch (dateFilter) {
          case "today":
            return txDate >= today;
          case "this-week":
            return txDate >= startOfWeek;
          case "this-month":
            return txDate >= startOfMonth;
          case "this-year":
            return txDate >= startOfYear;
          default:
            return true;
        }
      });
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    typeFilter,
    setTypeFilter,
    dateFilter,
    setDateFilter,
    selectedMonth,
    setSelectedMonth,
    resetFilters,
    filterTransactions,
    hasFilters: searchTerm !== "" || categoryFilter !== "all" || typeFilter !== "all" || dateFilter !== "all"
  };
};
