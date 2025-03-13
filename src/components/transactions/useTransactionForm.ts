
import { useState } from "react";
import { Transaction, TransactionType } from "@/types";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useFinance } from "@/contexts/FinanceContext";

export interface TransactionFormData {
  description: string;
  amount: string;
  type: TransactionType;
  date: string;
  categoryId: string;
  notes: string;
  // שדות חדשים לתחשיב חשמל
  isElectricityBill?: boolean;
  mainMeterReading?: {
    current: number;
    previous: number;
    date: string;
  };
  secondaryMeterReading?: {
    current: number;
    previous: number;
    date: string;
  };
  electricityRate?: number;
  vatRate?: number;
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prevData) => ({ ...prevData, [name]: checked }));
  };

  // טיפול בשינויים בשדות תחשיב החשמל
  const handleElectricityChange = (type: string, field: string, value: string) => {
    if (type === "electricityRate" || type === "vatRate") {
      setFormData((prevData) => ({
        ...prevData,
        [type]: value ? parseFloat(value) : 0
      }));
    } else {
      setFormData((prevData) => {
        // Fix for the spread type error - type assertion to ensure we're spreading an object
        const prevValue = prevData[type as keyof typeof prevData] as Record<string, any> || {};
        return {
          ...prevData,
          [type]: {
            ...prevValue,
            [field]: field === "date" ? value : (value ? parseFloat(value) : 0)
          }
        };
      });
    }
  };

  // חישוב וקביעת סכום חשבון החשמל
  const calculateElectricityAmount = () => {
    if (!formData.isElectricityBill) return;
    
    const mainDiff = 
      (formData.mainMeterReading?.current || 0) - 
      (formData.mainMeterReading?.previous || 0);
      
    const secondaryDiff = 
      (formData.secondaryMeterReading?.current || 0) - 
      (formData.secondaryMeterReading?.previous || 0);
    
    const totalKWh = mainDiff + secondaryDiff;
    const priceBeforeVat = totalKWh * (formData.electricityRate || 0);
    const totalPrice = priceBeforeVat * (1 + (formData.vatRate || 0) / 100);
    
    setFormData(prevData => ({
      ...prevData,
      amount: totalPrice.toFixed(2)
    }));
    
    // הצגת הודעה
    toast({
      title: "חושב סכום חשבון חשמל",
      description: `סה"כ ${totalKWh} קוט"ש × ${formData.electricityRate} ₪ + מע"מ = ${totalPrice.toFixed(2)} ₪`,
    });
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
        // Adding electricity fields only if relevant
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
