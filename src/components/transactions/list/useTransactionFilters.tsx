import { useState, useMemo } from 'react';
import { Transaction as FinanceTransaction, TransactionCategory } from '@/types/finance';
import type { Transaction, CategoryType } from "@/modules/core/finance/types";

interface UseTransactionFiltersProps {
  transactions: Transaction[];
  categories: CategoryType[];
  selectedMonth: Date;
}

export const useTransactionFilters = ({ transactions, categories, selectedMonth }: UseTransactionFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const mapTransactionsToFinanceType = (transactions: Transaction[]): FinanceTransaction[] => {
    return transactions.map(tx => {
      const category = categories.find((cat: CategoryType) => cat.id === tx.categoryId);
      const categoryName = category?.name as TransactionCategory || 'אחר';
      return {
        id: tx.id,
        date: tx.date,
        amount: tx.amount,
        description: tx.description,
        type: tx.type,
        category: categoryName,
        status: 'הושלם',
        notes: tx.notes,
        createdAt: tx.createdAt
      };
    });
  };

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by selected month
    if (selectedMonth) {
      const firstDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const lastDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
      
      filtered = filtered.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= firstDayOfMonth && txDate <= lastDayOfMonth;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((tx) => {
        const category = categories.find((cat: CategoryType) => cat.id === tx.categoryId);
        return category?.name === categoryFilter;
      });
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((tx) => tx.type === typeFilter);
    }

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

    return mapTransactionsToFinanceType(filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [transactions, categories, selectedMonth, searchTerm, categoryFilter, typeFilter, dateFilter]);

  const monthlyIncomeInCurrentMonth = useMemo(() => 
    filteredTransactions.filter(tx => 
      tx.type === 'הכנסה' && tx.description === "משכורת חודשית קבועה"
    ),
    [filteredTransactions]
  );

  const hasIncomeTransactions = useMemo(() => 
    transactions.some(tx => tx.type === 'הכנסה'),
    [transactions]
  );

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setTypeFilter("all");
    setDateFilter("all");
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
    filteredTransactions,
    monthlyIncomeInCurrentMonth,
    hasIncomeTransactions,
    resetFilters,
  };
};
