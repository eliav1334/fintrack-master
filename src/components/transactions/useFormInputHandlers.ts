
import React from "react";
import { TransactionFormData } from "./transactionFormModels";
import { TransactionType } from "@/types";

/**
 * Custom hook to handle various form input changes
 */
export const useFormInputHandlers = (
  setFormData: React.Dispatch<React.SetStateAction<TransactionFormData>>
) => {
  // Handle changes to regular input fields
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle changes to select fields
  const handleSelectChange = (name: string, value: string) => {
    if (name === "type") {
      // Ensure type is always TransactionType
      setFormData((prevData) => ({ ...prevData, [name]: value as TransactionType }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  // Handle changes to switch components
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prevData) => ({ ...prevData, [name]: checked }));
  };

  return {
    handleInputChange,
    handleSelectChange,
    handleSwitchChange
  };
};
