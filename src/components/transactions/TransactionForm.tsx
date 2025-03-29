
import React, { useState } from "react";
import { Transaction, TransactionCategory, TransactionType } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useFinance } from "@/context/FinanceContext";
import { Check, X } from "lucide-react";

interface TransactionFormProps {
  mode: "create" | "edit";
  transaction?: Transaction;
  children: React.ReactNode;
}

export const TransactionForm = ({ mode, transaction, children }: TransactionFormProps) => {
  const { toast } = useToast();
  const { addTransaction, updateTransaction } = useFinance();
  const [open, setOpen] = useState(false);
  
  // מצב ברירת מחדל לטופס
  const defaultFormState = {
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "אחר" as TransactionCategory,
    type: "expense" as TransactionType,
    status: "הושלם" as "הושלם" | "מתוכנן" | "בוטל",
    notes: "",
    recurrent: false,
    recurrencePattern: "monthly" as "weekly" | "monthly" | "yearly" | undefined,
    hasInstallments: false,
    currentInstallment: "1",
    totalInstallments: "1",
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
          recurrent: transaction.recurrent || false,
          recurrencePattern: transaction.recurrencePattern,
          hasInstallments: transaction.installments ? true : false,
          currentInstallment: transaction.installments ? transaction.installments.current.toString() : "1",
          totalInstallments: transaction.installments ? transaction.installments.total.toString() : "1",
        }
      : defaultFormState
  );
  
  const handleChange = (key: string, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };
  
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
        recurrent: formState.recurrent || undefined,
        recurrencePattern: formState.recurrent ? formState.recurrencePattern : undefined,
        installments: formState.hasInstallments
          ? {
              current: parseInt(formState.currentInstallment),
              total: parseInt(formState.totalInstallments),
            }
          : undefined,
      };
      
      if (mode === "create") {
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
                  onChange={(e) => handleChange("description", e.target.value)}
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
                  onChange={(e) => handleChange("amount", e.target.value)}
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
                  onChange={(e) => handleChange("date", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">סוג העסקה *</Label>
                <Select
                  value={formState.type}
                  onValueChange={(value) => handleChange("type", value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="בחר סוג עסקה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">הוצאה</SelectItem>
                    <SelectItem value="income">הכנסה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">קטגוריה *</Label>
                <Select
                  value={formState.category}
                  onValueChange={(value) => handleChange("category", value as TransactionCategory)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="בחר קטגוריה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="דיור">דיור</SelectItem>
                    <SelectItem value="מזון">מזון</SelectItem>
                    <SelectItem value="תחבורה">תחבורה</SelectItem>
                    <SelectItem value="בידור">בידור</SelectItem>
                    <SelectItem value="חשבונות">חשבונות</SelectItem>
                    <SelectItem value="הכנסה">הכנסה</SelectItem>
                    <SelectItem value="אחר">אחר</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">סטטוס *</Label>
                <Select
                  value={formState.status}
                  onValueChange={(value) => handleChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="בחר סטטוס" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="הושלם">הושלם</SelectItem>
                    <SelectItem value="מתוכנן">מתוכנן</SelectItem>
                    <SelectItem value="בוטל">בוטל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="recurrent" className="cursor-pointer">עסקה חוזרת</Label>
                <Switch
                  id="recurrent"
                  checked={formState.recurrent}
                  onCheckedChange={(checked) => handleChange("recurrent", checked)}
                />
              </div>
              
              {formState.recurrent && (
                <div className="pt-2">
                  <Label htmlFor="recurrence-pattern">תדירות</Label>
                  <Select
                    value={formState.recurrencePattern}
                    onValueChange={(value) => handleChange("recurrencePattern", value)}
                  >
                    <SelectTrigger id="recurrence-pattern">
                      <SelectValue placeholder="בחר תדירות" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">שבועי</SelectItem>
                      <SelectItem value="monthly">חודשי</SelectItem>
                      <SelectItem value="yearly">שנתי</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="has-installments" className="cursor-pointer">תשלומים</Label>
                <Switch
                  id="has-installments"
                  checked={formState.hasInstallments}
                  onCheckedChange={(checked) => handleChange("hasInstallments", checked)}
                />
              </div>
              
              {formState.hasInstallments && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="current-installment">תשלום נוכחי</Label>
                    <Input
                      id="current-installment"
                      type="number"
                      min="1"
                      value={formState.currentInstallment}
                      onChange={(e) => handleChange("currentInstallment", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="total-installments">סה"כ תשלומים</Label>
                    <Input
                      id="total-installments"
                      type="number"
                      min="1"
                      value={formState.totalInstallments}
                      onChange={(e) => handleChange("totalInstallments", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                value={formState.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="הערות נוספות על העסקה"
                rows={3}
              />
            </div>
            
            <DialogFooter className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                ביטול
              </Button>
              <Button type="submit">
                <Check className="h-4 w-4 mr-2" />
                {mode === "create" ? "הוספת עסקה" : "עדכון עסקה"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
