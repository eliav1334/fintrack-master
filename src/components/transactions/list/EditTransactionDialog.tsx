import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { Transaction } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from "@/stores/financeStore";

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const EditTransactionDialog: React.FC<EditTransactionDialogProps> = ({
  transaction,
  onClose,
}) => {
  const { updateTransaction } = useFinanceStore();

  if (!transaction) return null;
  
  const handleSubmit = (updatedTransaction: Omit<Transaction, "id">) => {
    try {
      updateTransaction(transaction.id, updatedTransaction);
      onClose();
    } catch (error) {
      console.error('שגיאה בעדכון העסקה:', error);
      alert('אירעה שגיאה בעת עדכון העסקה. אנא נסה שנית.');
    }
  };

  return (
    <Dialog open={!!transaction} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>עריכת עסקה</DialogTitle>
          <DialogDescription>
            עדכן את פרטי העסקה להלן
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          mode="edit"
          transaction={transaction}
          onSubmit={handleSubmit}
        >
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit">
              שמור שינויים
            </Button>
          </div>
        </TransactionForm>
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionDialog;
