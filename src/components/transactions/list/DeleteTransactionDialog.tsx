
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

interface DeleteTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isForAllIncome?: boolean;
}

const DeleteTransactionDialog: React.FC<DeleteTransactionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isForAllIncome = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isForAllIncome ? "מחיקת כל עסקאות ההכנסה" : "מחיקת עסקה"}
          </DialogTitle>
          <DialogDescription>
            {isForAllIncome
              ? "האם אתה בטוח שברצונך למחוק את כל עסקאות ההכנסה? פעולה זו אינה ניתנת לביטול."
              : "האם אתה בטוח שברצונך למחוק עסקה זו? פעולה זו אינה ניתנת לביטול."}
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
