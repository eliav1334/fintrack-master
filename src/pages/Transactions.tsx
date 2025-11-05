import React, { useState, useMemo } from 'react'
import { useFinanceStore } from '@/stores/financeStore'
import { TransactionTable } from '@/components/transactions/list'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Transaction } from '@/types/finance'
import { DeleteTransactionDialog } from '@/components/transactions/list'

const Transactions: React.FC = () => {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    currentPage,
    itemsPerPage,
    setCurrentPage
  } = useFinanceStore()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    id: string;
    description: string;
    amount: number;
  }>({
    isOpen: false,
    id: '',
    description: '',
    amount: 0
  })

  // Pagination logic
  const totalPages = Math.ceil(transactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(startIndex, endIndex)
  }, [transactions, startIndex, endIndex])

  const handleAdd = (transaction: Omit<Transaction, 'id'>) => {
    addTransaction(transaction)
    setIsAddDialogOpen(false)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
  }

  const handleDelete = (id: string, description: string, amount: number) => {
    setDeleteDialogState({
      isOpen: true,
      id,
      description,
      amount
    })
  }

  const confirmDelete = () => {
    deleteTransaction(deleteDialogState.id)
    setDeleteDialogState({
      isOpen: false,
      id: '',
      description: '',
      amount: 0
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(value)
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">עסקאות ({transactions.length})</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          הוספת עסקה
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <TransactionTable
            transactions={paginatedTransactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            formatCurrency={formatCurrency}
          />
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            מציג {startIndex + 1}-{Math.min(endIndex, transactions.length)} מתוך {transactions.length} עסקאות
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronRight className="h-4 w-4" />
              הקודם
            </Button>
            <span className="text-sm">
              עמוד {currentPage} מתוך {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              הבא
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוספת עסקה חדשה</DialogTitle>
          </DialogHeader>
          <TransactionForm
            mode="create"
            onSubmit={handleAdd}
          >
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                ביטול
              </Button>
              <Button type="submit">
                הוסף עסקה
              </Button>
            </div>
          </TransactionForm>
        </DialogContent>
      </Dialog>

      {editingTransaction && (
        <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>עריכת עסקה</DialogTitle>
            </DialogHeader>
            <TransactionForm
              mode="edit"
              transaction={editingTransaction}
              onSubmit={(updatedTransaction) => {
                updateTransaction(editingTransaction.id, updatedTransaction)
                setEditingTransaction(null)
              }}
            >
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setEditingTransaction(null)}>
                  ביטול
                </Button>
                <Button type="submit">
                  שמור שינויים
                </Button>
              </div>
            </TransactionForm>
          </DialogContent>
        </Dialog>
      )}

      <DeleteTransactionDialog
        isOpen={deleteDialogState.isOpen}
        onClose={() => setDeleteDialogState({ isOpen: false, id: '', description: '', amount: 0 })}
        onConfirm={confirmDelete}
        transactionDescription={deleteDialogState.description}
        transactionAmount={deleteDialogState.amount}
      />
    </div>
  )
}

export default Transactions
