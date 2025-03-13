
import { useState } from "react";
import { Transaction, TransactionType } from "@/types";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useFinance } from "@/contexts/FinanceContext";
import { TransactionFormData, UseTransactionFormParams, UseTransactionFormResult } from "./transactionFormModels";
import { useElectricityCalculator } from "./useElectricityCalculator";
import { useTransactionFormValidator } from "./useTransactionFormValidator";

export const useTransactionForm = (
  initialTransaction?: Transaction,
  onClose?: () => void
): UseTransactionFormResult => {
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
    // אתחול שדות חשמל
    isElectricityBill: initialTransaction?.isElectricityBill || false,
    mainMeterReading: initialTransaction?.mainMeterReading || {
      current: 0,
      previous: 0,
      date: format(new Date(), "yyyy-MM-dd"),
    },
    secondaryMeterReading: initialTransaction?.secondaryMeterReading || {
      current: 0,
      previous: 0,
      date: format(new Date(), "yyyy-MM-dd"),
    },
    electricityRate: initialTransaction?.electricityRate || 0.60, // תעריף ברירת מחדל
    vatRate: initialTransaction?.vatRate || 17, // מע"מ ברירת מחדל
  });

  // טעינת ולידטור הטופס
  const { validateForm } = useTransactionFormValidator();

  // טעינת מחשבון החשמל
  const { handleElectricityChange, calculateElectricityAmount } = useElectricityCalculator({
    formData,
    setFormData
  });

  // טיפול בשינוי קלט רגיל
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // טיפול בשינוי בחירה
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // טיפול בשינוי מתג
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prevData) => ({ ...prevData, [name]: checked }));
  };

  // טיפול בשליחת הטופס
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
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
        // הוספת שדות חשמל רק אם רלוונטי
        ...(formData.isElectricityBill ? {
          isElectricityBill: true,
          mainMeterReading: formData.mainMeterReading,
          secondaryMeterReading: formData.secondaryMeterReading,
          electricityRate: formData.electricityRate,
          vatRate: formData.vatRate
        } : {})
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

      // איפוס הטופס אם לא בעריכה
      if (!isEditing) {
        setFormData({
          description: "",
          amount: "",
          type: "expense",
          date: format(new Date(), "yyyy-MM-dd"),
          categoryId: "",
          notes: "",
          isElectricityBill: false,
          mainMeterReading: {
            current: 0,
            previous: 0,
            date: format(new Date(), "yyyy-MM-dd"),
          },
          secondaryMeterReading: {
            current: 0,
            previous: 0,
            date: format(new Date(), "yyyy-MM-dd"),
          },
          electricityRate: 0.60,
          vatRate: 17,
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
    filteredCategories: state.categories.filter(
      (category) => category.type === formData.type
    ),
    handleInputChange,
    handleSelectChange,
    handleSwitchChange,
    handleElectricityChange,
    calculateElectricityAmount,
    handleSubmit,
  };
};
