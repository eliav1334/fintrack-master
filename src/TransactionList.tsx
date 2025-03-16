
import React, { useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Transaction } from "@/types";
import { toast } from "sonner";
import TransactionFilters from "@/components/transactions/list/TransactionFilters";
import TransactionTable from "@/components/transactions/list/TransactionTable";
import EmptyTransactionList from "@/components/transactions/list/EmptyTransactionList";
import DeleteTransactionDialog from "@/components/transactions/list/DeleteTransactionDialog";
import EditTransactionDialog from "@/components/transactions/list/EditTransactionDialog";
import { useTransactionFilters } from "@/components/transactions/list/useTransactionFilters";

const TransactionList = () => {
  const { state, deleteTransaction, deleteAllIncomeTransactions } = useFinance();
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [showConfirmDeleteAllIncome, setShowConfirmDeleteAllIncome] = useState<boolean>(false);
  
  // Use the filter hook
  const {
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
    hasFilters
  } = useTransactionFilters(state.transactions);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
    }).format(value);
  };

  // Handle transaction editing
  const handleEdit = (transaction: Transaction) => {
    setEditTransaction(transaction);
  };

  // Handle transaction deletion
  const handleDelete = (id: string) => {
    setTransactionToDelete(id);
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete);
      setShowConfirmDialog(false);
      setTransactionToDelete(null);
    }
  };

  // Handle delete all income transactions
  const handleDeleteAllIncome = () => {
    setShowConfirmDeleteAllIncome(true);
  };

  const confirmDeleteAllIncome = () => {
    deleteAllIncomeTransactions();
    setShowConfirmDeleteAllIncome(false);
    toast.success("כל עסקאות ההכנסה נמחקו בהצלחה");
  };

  const filteredTransactions = filterTransactions();
  const hasIncomeTransactions = state.transactions.some(tx => tx.type === "income");
  
  // Filter monthly income transactions for the current selected month
  const monthlyIncomeInCurrentMonth = filteredTransactions.filter(tx => 
    tx.type === "income" && tx.description === "משכורת חודשית קבועה"
  );

  return (
    <div className="animate-fade-in p-6 space-y-6">
      <h1 className="text-3xl font-semibold mb-6">עסקאות</h1>

      {/* Filters component */}
      <TransactionFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        resetFilters={resetFilters}
        filteredCount={filteredTransactions.length}
        monthlyIncomeCount={monthlyIncomeInCurrentMonth.length}
        hasIncomeTransactions={hasIncomeTransactions}
        onDeleteAllIncome={handleDeleteAllIncome}
        categories={state.categories}
      />

      {/* Transaction table or empty state */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <TransactionTable 
            transactions={filteredTransactions}
            categories={state.categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
            formatCurrency={formatCurrency}
          />
        ) : (
          <EmptyTransactionList 
            selectedMonth={selectedMonth}
            hasFilters={hasFilters}
            resetFilters={resetFilters}
          />
        )}
      </div>

      {/* Edit transaction dialog */}
      <EditTransactionDialog 
        transaction={editTransaction}
        onClose={() => setEditTransaction(null)}
      />

      {/* Delete transaction confirmation dialog */}
      <DeleteTransactionDialog 
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmDelete}
      />

      {/* Delete all income transactions confirmation dialog */}
      <DeleteTransactionDialog 
        isOpen={showConfirmDeleteAllIncome}
        onClose={() => setShowConfirmDeleteAllIncome(false)}
        onConfirm={confirmDeleteAllIncome}
        isForAllIncome={true}
      />
    </div>
  );
};

export default TransactionList;
