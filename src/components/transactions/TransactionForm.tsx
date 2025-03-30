import React, { useState } from "react";
import { Transaction, TransactionCategory, TransactionType, TransactionStatus } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useFinance } from "@/context/FinanceContext";

interface TransactionFormProps {
  mode: "create" | "edit";
  transaction?: Transaction;
  children: React.ReactNode;
  onSubmit?: (transaction: Omit<Transaction, "id">) => void;
}

export const TransactionForm = ({ mode, transaction, children, onSubmit }: TransactionFormProps) => {
  const { toast } = useToast();
  const { addTransaction, updateTransaction } = useFinance();
  const [open, setOpen] = useState(false);
  
  // מצב ברירת מחדל לטופס
  const defaultFormState = {
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "אחר" as TransactionCategory,
    type: "הוצאה" as TransactionType,
    status: "הושלם" as TransactionStatus,
    notes: "",
  };
  
  // אתחול מצב הטופס לפי המידע מהעסקה אם קיימת
  const [formState, setFormState] = useState(
    transaction
      ? {
          description: transaction.description,
          amount: transaction.amount.toString(),
          date: transaction.date,
          category: transaction.category,
          type: transaction.type,
          status: transaction.status,
          notes: transaction.notes || "",
        }
      : defaultFormState
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const transactionData = {
        description: formState.description,
        amount: parseFloat(formState.amount),
        date: formState.date,
        category: formState.category,
        type: formState.type,
        status: formState.status,
        notes: formState.notes || undefined,
      };
      
      if (onSubmit) {
        onSubmit(transactionData);
      } else if (mode === "create") {
        addTransaction(transactionData);
        toast({
          title: "העסקה נוספה בהצלחה",
          description: `${transactionData.description} נוסף למערכת`,
        });
      } else if (mode === "edit" && transaction) {
        updateTransaction(transaction.id, transactionData);
        toast({
          title: "העסקה עודכנה בהצלחה",
          description: `${transactionData.description} עודכן במערכת`,
        });
      }
      
      // איפוס הטופס לערכי ברירת המחדל בעת יצירה
      if (mode === "create") {
        setFormState(defaultFormState);
      }
      
      setOpen(false);
    } catch (error) {
      console.error("שגיאה בשמירת העסקה:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בשמירת העסקה",
        description: "אנא בדוק את הנתונים ונסה שוב",
      });
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "הוספת עסקה חדשה" : "עריכת עסקה"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create" 
                ? "מלא את הפרטים להוספת עסקה חדשה למערכת" 
                : "ערוך את פרטי העסקה הקיימת"
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">תיאור העסקה *</Label>
                <Input
                  id="description"
                  value={formState.description}
                  onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="למשל: קניות בסופר"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">סכום *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formState.amount}
                  onChange={(e) => setFormState(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">תאריך *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formState.date}
                  onChange={(e) => setFormState(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">סוג עסקה *</Label>
                <Select
                  value={formState.type}
                  onValueChange={(value) => setFormState(prev => ({ ...prev, type: value as TransactionType }))}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="בחר סוג עסקה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="הכנסה">הכנסה</SelectItem>
                    <SelectItem value="הוצאה">הוצאה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">קטגוריה *</Label>
                <Select
                  value={formState.category}
                  onValueChange={(value) => setFormState(prev => ({ ...prev, category: value as TransactionCategory }))}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="בחר קטגוריה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="דיור">דיור</SelectItem>
                    <SelectItem value="מזון">מזון</SelectItem>
                    <SelectItem value="תחבורה">תחבורה</SelectItem>
                    <SelectItem value="חשבונות">חשבונות</SelectItem>
                    <SelectItem value="בריאות">בריאות</SelectItem>
                    <SelectItem value="בידור">בידור</SelectItem>
                    <SelectItem value="קניות">קניות</SelectItem>
                    <SelectItem value="חינוך">חינוך</SelectItem>
                    <SelectItem value="חסכונות">חסכונות</SelectItem>
                    <SelectItem value="אחר">אחר</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">סטטוס *</Label>
                <Select
                  value={formState.status}
                  onValueChange={(value) => setFormState(prev => ({ ...prev, status: value as TransactionStatus }))}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="בחר סטטוס" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="הושלם">הושלם</SelectItem>
                    <SelectItem value="ממתין">ממתין</SelectItem>
                    <SelectItem value="בוטל">בוטל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="notes">הערות</Label>
                <Textarea
                  id="notes"
                  value={formState.notes}
                  onChange={(e) => setFormState(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="הוסף הערות נוספות..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                ביטול
              </Button>
              <Button type="submit">
                {mode === "create" ? "הוסף עסקה" : "שמור שינויים"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransactionForm;
