
import { useState, useEffect, useCallback } from "react";
import { Transaction, TransactionType } from "@/types";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useFinance } from "@/contexts/FinanceContext";
import { TransactionFormData, UseTransactionFormParams, UseTransactionFormResult } from "./transactionFormModels";
import { useElectricityCalculator } from "./useElectricityCalculator";
import { useTransactionFormValidator } from "./useTransactionFormValidator";

// מפתח לשמירת נתוני הטופס הזמניים ב-sessionStorage
const FORM_STORAGE_KEY = "transaction_form_data";

export const useTransactionForm = (
  initialTransaction?: Transaction,
  onClose?: () => void
): UseTransactionFormResult => {
  const { state, addTransaction, updateTransaction } = useFinance();
  const { toast } = useToast();
  const isEditing = !!initialTransaction;

  // אתחול נתוני הטופס - מנסה לטעון מהאחסון אם ישנם, אחרת משתמש בברירות מחדל או בעסקה שהועברה
  const initializeFormData = (): TransactionFormData => {
    // אם בעריכה, תמיד נשתמש בערכים של העסקה שנשלחה
    if (isEditing && initialTransaction) {
      return {
        description: initialTransaction.description || "",
        amount: initialTransaction.amount.toString() || "",
        type: initialTransaction.type || "expense",
        date: initialTransaction.date || format(new Date(), "yyyy-MM-dd"),
        categoryId: initialTransaction.categoryId || "",
        notes: initialTransaction.notes || "",
        isElectricityBill: initialTransaction.isElectricityBill || false,
        mainMeterReading: initialTransaction.mainMeterReading || {
          current: 0,
          previous: 0,
          date: format(new Date(), "yyyy-MM-dd"),
        },
        secondaryMeterReading: initialTransaction.secondaryMeterReading || {
          current: 0,
          previous: 0,
          date: format(new Date(), "yyyy-MM-dd"),
        },
        electricityRate: initialTransaction.electricityRate || 0.60,
        vatRate: initialTransaction.vatRate || 17,
      };
    }
    
    // אם לא בעריכה, ננסה לטעון מהאחסון
    try {
      const savedData = sessionStorage.getItem(FORM_STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error("שגיאה בטעינת נתוני טופס:", error);
    }
    
    // ברירת מחדל אם אין נתונים באחסון
    return {
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
    };
  };

  const [formData, setFormData] = useState<TransactionFormData>(initializeFormData);

  // שמירת נתוני הטופס ב-sessionStorage בכל שינוי אם לא במצב עריכה
  useEffect(() => {
    if (!isEditing) {
      sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, isEditing]);

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

      // איפוס הטופס והאחסון אם לא בעריכה
      if (!isEditing) {
        const defaultFormData = {
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
        };
        
        setFormData(defaultFormData);
        sessionStorage.removeItem(FORM_STORAGE_KEY);
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
