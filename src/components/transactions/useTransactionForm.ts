
import { useCallback } from "react";
import { Transaction } from "@/types";
import { useFinance } from "@/contexts/FinanceContext";
import { UseTransactionFormResult } from "./transactionFormModels";
import { useElectricityCalculator } from "./useElectricityCalculator";
import { useFormStorage } from "./useFormStorage";
import { useFormInputHandlers } from "./useFormInputHandlers";
import { useTransactionSubmit } from "./useTransactionSubmit";

export const useTransactionForm = (
  initialTransaction?: Transaction,
  onClose?: () => void
): UseTransactionFormResult => {
  const { state } = useFinance();
  
  // Load form storage handling
  const { formData, setFormData, isEditing, resetFormData } = useFormStorage(initialTransaction);
  
  // Load input handlers
  const { 
    handleInputChange,
    handleSelectChange,
    handleSwitchChange 
  } = useFormInputHandlers(setFormData);
  
  // Load electricity calculator
  const { handleElectricityChange, calculateElectricityAmount } = useElectricityCalculator({
    formData,
    setFormData
  });
  
  // Handle installment fields changes
  const handleInstallmentChange = useCallback((field: string, value: number) => {
    if (field === "currentAmount") {
      // עדכון הסכום החודשי בטופס
      setFormData(prev => ({
        ...prev,
        amount: value.toString()
      }));
      return;
    }
    
    // אם מדובר בשדה של מספר התשלום הנוכחי
    if (field === "installmentNumber") {
      setFormData(prev => ({
        ...prev,
        installmentDetails: {
          ...prev.installmentDetails,
          installmentNumber: value,
          // חישוב הסכום החודשי אם יש סכום כולל
          currentInstallment: prev.installmentDetails.totalAmount > 0 
            ? prev.installmentDetails.totalAmount / prev.installmentDetails.totalInstallments 
            : prev.installmentDetails.currentInstallment
        }
      }));
      return;
    }
    
    // אם מדובר בסכום נותר לתשלום
    if (field === "remainingAmount") {
      setFormData(prev => ({
        ...prev,
        installmentDetails: {
          ...prev.installmentDetails,
          remainingAmount: value
        }
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      installmentDetails: {
        ...prev.installmentDetails,
        [field]: value
      }
    }));
    
    // אם מדובר בשינוי בסכום הכולל או במספר התשלומים, אז נחשב את התשלום החודשי
    if (field === "totalAmount" || field === "totalInstallments") {
      const { totalAmount, totalInstallments } = formData.installmentDetails;
      
      // חישוב התשלום החודשי רק אם יש ערכים תקפים
      if (totalAmount && totalInstallments) {
        const monthlyPayment = totalAmount / totalInstallments;
        
        setFormData(prev => ({
          ...prev,
          amount: monthlyPayment.toString(),
          installmentDetails: {
            ...prev.installmentDetails,
            currentInstallment: monthlyPayment
          }
        }));
      }
    }
  }, [formData.installmentDetails, setFormData]);
  
  // Load submission handler
  const { handleSubmit } = useTransactionSubmit({
    formData,
    isEditing,
    initialTransaction,
    resetFormData,
    onClose
  });

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
    handleInstallmentChange,
    calculateElectricityAmount,
    handleSubmit,
  };
};
