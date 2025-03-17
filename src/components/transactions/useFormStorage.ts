
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Transaction, TransactionType } from "@/types";
import { TransactionFormData } from "./transactionFormModels";

// Storage key for saving form data in sessionStorage
const FORM_STORAGE_KEY = "transaction_form_data";

/**
 * Custom hook to handle form data persistence via sessionStorage
 */
export const useFormStorage = (initialTransaction?: Transaction) => {
  const isEditing = !!initialTransaction;

  // Initialize form data from storage or with default values
  const initializeFormData = (): TransactionFormData => {
    // If editing, always use the transaction's values
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
        isInstallment: initialTransaction.isInstallment || false,
        installmentDetails: initialTransaction.installmentDetails ? {
          totalAmount: initialTransaction.installmentDetails.totalAmount || 0,
          currentInstallment: initialTransaction.installmentDetails.currentInstallment || 1,
          totalInstallments: initialTransaction.installmentDetails.totalInstallments || 1,
          installmentNumber: initialTransaction.installmentDetails.installmentNumber,
          originalTransactionDate: initialTransaction.installmentDetails.originalTransactionDate,
          installmentDate: initialTransaction.date,
          remainingAmount: 0
        } : {
          totalAmount: 0,
          currentInstallment: 1,
          totalInstallments: 1,
          installmentNumber: 1,
          installmentDate: format(new Date(), "yyyy-MM-dd"),
          remainingAmount: 0
        },
      };
    }
    
    // If not editing, try to load from storage
    try {
      const savedData = sessionStorage.getItem(FORM_STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error("שגיאה בטעינת נתוני טופס:", error);
    }
    
    // Default values if no data in storage
    return {
      description: "",
      amount: "",
      type: "expense" as TransactionType,
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
      isInstallment: false,
      installmentDetails: {
        totalAmount: 0,
        currentInstallment: 1,
        totalInstallments: 1,
        installmentNumber: 1,
        installmentDate: format(new Date(), "yyyy-MM-dd"),
        remainingAmount: 0
      },
    };
  };

  const [formData, setFormData] = useState<TransactionFormData>(initializeFormData);

  // Save form data to sessionStorage on changes if not editing
  useEffect(() => {
    if (!isEditing) {
      sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, isEditing]);

  /**
   * Reset form data to defaults and clear storage
   */
  const resetFormData = () => {
    const defaultFormData: TransactionFormData = {
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
      isInstallment: false,
      installmentDetails: {
        totalAmount: 0,
        currentInstallment: 1,
        totalInstallments: 1,
        installmentNumber: 1,
        installmentDate: format(new Date(), "yyyy-MM-dd"),
        remainingAmount: 0
      },
    };
    
    setFormData(defaultFormData);
    sessionStorage.removeItem(FORM_STORAGE_KEY);
  };

  return {
    formData,
    setFormData,
    isEditing,
    resetFormData
  };
};
