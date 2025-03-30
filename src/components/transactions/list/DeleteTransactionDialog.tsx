import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface DeleteTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isForAllIncome?: boolean;
  transactionDescription?: string;
  transactionAmount?: number;
}

const DeleteTransactionDialog: React.FC<DeleteTransactionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isForAllIncome = false,
  transactionDescription,
  transactionAmount,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isForAllIncome ? "מחיקת כל עסקאות ההכנסה" : "מחיקת עסקה"}
          </DialogTitle>
          <DialogDescription>
            {isForAllIncome
              ? "האם אתה בטוח שברצונך למחוק את כל עסקאות ההכנסה? פעולה זו אינה הפיכה."
              : `האם אתה בטוח שברצונך למחוק את העסקה "${transactionDescription}" בסכום ${formatCurrency(transactionAmount || 0)}? פעולה זו אינה הפיכה.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ביטול
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {isForAllIncome ? "מחק את כל ההכנסות" : "מחק"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTransactionDialog;
