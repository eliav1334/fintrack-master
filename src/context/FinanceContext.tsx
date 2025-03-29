import React, { createContext, useContext } from "react";
import { Transaction, Budget, FinancialSummary } from "../types/finance";
import { useTransactions } from "../hooks/useTransactions";
import { useBudgets } from "../hooks/useBudgets";
import { getFinancialSummary } from "../utils/financeUtils";

interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (budget: Omit<Budget, "id">) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  getFinancialSummary: () => FinancialSummary;
  importTransactions: (transactions: Omit<Transaction, "id">[]) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    transactions, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    importTransactions 
  } = useTransactions();
  
  const { 
    budgets, 
    addBudget, 
    updateBudget, 
    deleteBudget 
  } = useBudgets();

  const getSummary = () => getFinancialSummary(transactions);

  const value = {
    transactions,
    budgets,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    getFinancialSummary: getSummary,
    importTransactions,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
