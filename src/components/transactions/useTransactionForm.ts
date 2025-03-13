
import { useState } from "react";
import { Transaction, TransactionType } from "@/types";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { useFinance } from "@/contexts/FinanceContext";

export interface TransactionFormData {
  description: string;
  amount: string;
  type: TransactionType;
  date: string;
  categoryId: string;
  notes: string;
}

export const useTransactionForm = (
  initialTransaction?: Transaction,
  onClose?: () => void
) => {
  const { state, addTransaction, updateTransaction } = useFinance();
  const { toast } = useToast();
  const isEditing = !!initialTransaction;

  const [formData, setFormData] = useState<TransactionFormData>({
    description: initialTransaction?.description || "",
    amount: initialTransaction?.amount.toString() || "",
    type: initialTransaction?.type || "expense",
    date: initialTransaction?.date || format(new Date(), "yyyy-MM-dd"),
    categoryId: initialTransaction?.categoryId || "",
    notes: initialTransaction?.notes || "",
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

  const filteredCategories = state.categories.filter(
    (category) => category.type === formData.type
  );

  const validateForm = () => {
    if (!formData.description.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין תיאור",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      toast({
        title: "שגיאה",
        description: "נא להזין סכום תקין",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.categoryId) {
      toast({
        title: "שגיאה",
        description: "נא לבחור קטגוריה",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
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

      if (isEditing && initialTransaction) {
        updateTransaction({ ...transactionData, id: initialTransaction.id });
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

  return {
    formData,
    isEditing,
    filteredCategories,
    handleInputChange,
    handleSelectChange,
    handleSubmit,
  };
};
