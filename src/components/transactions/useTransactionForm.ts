
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
    calculateElectricityAmount,
    handleSubmit,
  };
};
