
import React, { useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Transaction, TransactionType } from "@/types"; // תיקון הייבוא - הוספת TransactionType
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { DialogFooter } from "@/components/ui/dialog";

interface TransactionFormProps {
  transaction?: Transaction;
  onClose?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onClose,
}) => {
  const { state, addTransaction, updateTransaction } = useFinance();
  const { toast } = useToast();
  const isEditing = !!transaction;

  const [formData, setFormData] = useState<{
    description: string;
    amount: string;
    type: TransactionType;
    date: string;
    categoryId: string;
    notes: string;
  }>({
    description: transaction?.description || "",
    amount: transaction?.amount.toString() || "",
    type: transaction?.type || "expense",
    date: transaction?.date || format(new Date(), "yyyy-MM-dd"),
    categoryId: transaction?.categoryId || "",
    notes: transaction?.notes || "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.description.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין תיאור",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      toast({
        title: "שגיאה",
        description: "נא להזין סכום תקין",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.categoryId) {
      toast({
        title: "שגיאה",
        description: "נא לבחור קטגוריה",
        variant: "destructive",
      });
      return;
    }

    try {
      const transactionData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        date: formData.date,
        categoryId: formData.categoryId,
        notes: formData.notes.trim(),
      };

      if (isEditing && transaction) {
        updateTransaction({ ...transactionData, id: transaction.id });
        toast({
          title: "הצלחה",
          description: "העסקה עודכנה בהצלחה",
        });
      } else {
        addTransaction(transactionData);
        toast({
          title: "הצלחה",
          description: "העסקה נוספה בהצלחה",
        });
      }

      // Reset form if not editing
      if (!isEditing) {
        setFormData({
          description: "",
          amount: "",
          type: "expense",
          date: format(new Date(), "yyyy-MM-dd"),
          categoryId: "",
          notes: "",
        });
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה. נא לנסות שוב.",
        variant: "destructive",
      });
    }
  };

  const filteredCategories = state.categories.filter(
    (category) => category.type === formData.type
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type">סוג עסקה</Label>
          <RadioGroup
            defaultValue={formData.type}
            value={formData.type}
            onValueChange={(value) => handleSelectChange("type", value as TransactionType)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="expense" id="expense" />
              <Label htmlFor="expense" className="cursor-pointer">
                הוצאה
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="income" id="income" />
              <Label htmlFor="income" className="cursor-pointer">
                הכנסה
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">תיאור</Label>
          <Input
            id="description"
            name="description"
            placeholder="לדוגמה, קניות במרכול"
            value={formData.description}
            onChange={handleInputChange}
            className="transition-all"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">סכום</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.amount}
            onChange={handleInputChange}
            className="transition-all"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">תאריך</Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            className="transition-all"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">קטגוריה</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => handleSelectChange("categoryId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר קטגוריה" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center">
                      <span
                        className="w-2 h-2 rounded-full ml-2"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value="none">
                  אין קטגוריות זמינות לסוג זה
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">הערות (אופציונלי)</Label>
          <Input
            id="notes"
            name="notes"
            placeholder="פרטים נוספים..."
            value={formData.notes}
            onChange={handleInputChange}
            className="transition-all"
          />
        </div>
      </div>

      <DialogFooter>
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            ביטול
          </Button>
        )}
        <Button type="submit" className="mr-2">
          {isEditing ? "עדכן" : "הוסף"} עסקה
        </Button>
      </DialogFooter>
    </form>
  );
};
