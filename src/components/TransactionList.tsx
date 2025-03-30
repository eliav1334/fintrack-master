import React, { useState, useEffect } from "react";
import { useFinance } from "@/modules/core/finance/FinanceContext";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import TransactionTable from "@/components/transactions/list/TransactionTable";
import DeleteTransactionDialog from "@/components/transactions/list/DeleteTransactionDialog";
import TransactionFilters from "@/components/transactions/list/TransactionFilters";
import TransactionHeader from "@/components/transactions/list/TransactionHeader";
import TransactionEmptyState from "@/components/transactions/list/TransactionEmptyState";
import { Transaction as FinanceTransaction } from '@/types/finance';
import type { Transaction } from "@/modules/core/finance/types";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { useTransactionFilters } from "@/components/transactions/list/useTransactionFilters";

const TransactionList = () => {
  const { state, deleteTransaction, deleteAllIncomeTransactions } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [transactionToDeleteDetails, setTransactionToDeleteDetails] = useState<{ description: string; amount: number } | null>(null);
  const [editTransaction, setEditTransaction] = useState<FinanceTransaction | null>(null);
  
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

  const {
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
  } = useTransactionFilters({
    transactions: state.transactions,
    categories: state.categories,
    selectedMonth,
  });

  const handleEdit = (transaction: FinanceTransaction) => {
    setEditTransaction(transaction);
  };

  const handleDelete = (id: string, description: string, amount: number) => {
    setTransactionToDelete(id);
    setTransactionToDeleteDetails({ description, amount });
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
      setTransactionToDeleteDetails(null);
      setShowConfirmDialog(false);
      toast.success("העסקה נמחקה בהצלחה");
    }
  };

  const handleDeleteAllIncome = () => {
    setTransactionToDelete(null);
    setTransactionToDeleteDetails(null);
    setShowConfirmDialog(true);
  };

  const confirmDeleteAllIncome = () => {
    deleteAllIncomeTransactions();
    setShowConfirmDialog(false);
    toast.success("כל עסקאות ההכנסה נמחקו בהצלחה");
  };

  const hasActiveFilters = Boolean(searchTerm || categoryFilter !== "all" || typeFilter !== "all" || dateFilter !== "all");

  return (
    <div className="animate-fade-in p-6 space-y-6">
      <h1 className="text-3xl font-semibold mb-6">עסקאות</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <TransactionHeader
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          filteredTransactionsCount={filteredTransactions.length}
          monthlyIncomeCount={monthlyIncomeInCurrentMonth.length}
          hasIncomeTransactions={hasIncomeTransactions}
          onDeleteAllIncome={handleDeleteAllIncome}
        />
        
        <TransactionFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          categories={state.categories}
          resetFilters={resetFilters}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto" id="transactions-table-container">
            <TransactionTable
              transactions={filteredTransactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <TransactionEmptyState
            selectedMonth={selectedMonth}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
          />
        )}
      </div>

      {editTransaction && (
        <TransactionForm
          mode="edit"
          transaction={editTransaction}
          children={<></>}
        />
      )}

      <DeleteTransactionDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={transactionToDelete ? confirmDelete : confirmDeleteAllIncome}
        isForAllIncome={!transactionToDelete}
        transactionDescription={transactionToDeleteDetails?.description}
        transactionAmount={transactionToDeleteDetails?.amount}
      />
    </div>
  );
};

export default TransactionList;
