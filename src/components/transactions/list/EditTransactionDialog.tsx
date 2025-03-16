
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { Transaction } from "@/types";

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const EditTransactionDialog: React.FC<EditTransactionDialogProps> = ({
  transaction,
  onClose,
}) => {
  if (!transaction) return null;
  
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
          transaction={transaction}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionDialog;
