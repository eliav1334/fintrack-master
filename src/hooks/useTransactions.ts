
import { useState, useEffect } from "react";
import { Transaction } from "@/types/finance";
import { generateId, defaultTransactions } from "@/utils/financeUtils";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem("transactions");
      
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      } else {
        setTransactions(defaultTransactions);
      }
    } catch (error) {
      console.error("Error loading transactions from localStorage:", error);
      setTransactions(defaultTransactions);
    }
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem("transactions", JSON.stringify(transactions));
    }
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: generateId(),
    };
    setTransactions([...transactions, newTransaction]);
  };

  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    setTransactions(
      transactions.map((t) => (t.id === id ? { ...t, ...transaction } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const importTransactions = (newTransactions: Omit<Transaction, "id">[]) => {
    const transactionsWithIds = newTransactions.map((transaction) => ({
      ...transaction,
      id: generateId(),
    }));
    
    setTransactions([...transactions, ...transactionsWithIds]);
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    importTransactions,
  };
}
