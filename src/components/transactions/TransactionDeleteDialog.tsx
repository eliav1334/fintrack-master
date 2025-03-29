
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useFinance } from "@/context/FinanceContext";
import { Trash2, AlertTriangle } from "lucide-react";

interface TransactionDeleteDialogProps {
  transactionId: string;
  children: React.ReactNode;
}

export const TransactionDeleteDialog = ({ transactionId, children }: TransactionDeleteDialogProps) => {
  const { toast } = useToast();
  const { deleteTransaction, transactions } = useFinance();
  const [open, setOpen] = useState(false);
  
  const transaction = transactions.find(t => t.id === transactionId);
  
  const handleDelete = () => {
    try {
      deleteTransaction(transactionId);
      
      toast({
        title: "העסקה נמחקה בהצלחה",
        description: "העסקה הוסרה מהמערכת",
      });
      
      setOpen(false);
    } catch (error) {
      console.error("שגיאה במחיקת העסקה:", error);
      
      toast({
        variant: "destructive",
        title: "שגיאה במחיקת העסקה",
        description: "אירעה שגיאה במחיקת העסקה, אנא נסה שוב",
      });
    }
  };
  
  if (!transaction) {
    return null;
  }
  
  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              אישור מחיקת עסקה
            </DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את העסקה "{transaction.description}" בסכום של ₪{transaction.amount}?
              פעולה זו אינה ניתנת לביטול.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              מחיקת עסקה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
