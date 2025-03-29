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
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImportedTransaction } from "@/types/finance";

interface TransactionPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: ImportedTransaction[];
  onConfirmImport: () => void;
}

export const TransactionPreview: React.FC<TransactionPreviewProps> = ({
  open,
  onOpenChange,
  transactions,
  onConfirmImport,
}): JSX.Element => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("he-IL");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>תצוגה מקדימה של העסקאות</DialogTitle>
          <DialogDescription>
            נמצאו {transactions.length} עסקאות לייבוא. אנא בדוק את הנתונים לפני אישור הייבוא.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] rounded-md border p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-[1fr,2fr,1fr,1fr,1fr] gap-4 py-2 border-b font-medium">
              <div>תאריך</div>
              <div>תיאור</div>
              <div>סכום</div>
              <div>קטגוריה</div>
              <div>סוג</div>
            </div>
            {transactions.map((transaction, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr,2fr,1fr,1fr,1fr] gap-4 py-2 border-b last:border-0"
              >
                <div>{formatDate(transaction.date)}</div>
                <div className="font-medium">{transaction.description}</div>
                <div className={transaction.amount >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatAmount(transaction.amount)}
                </div>
                <div>{transaction.category || "-"}</div>
                <div>{transaction.type === "income" ? "הכנסה" : "הוצאה"}</div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button onClick={onConfirmImport}>
            אשר ייבוא
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
