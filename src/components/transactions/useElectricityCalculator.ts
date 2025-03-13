
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TransactionFormData } from "./transactionFormModels";

export interface UseElectricityCalculatorParams {
  formData: TransactionFormData;
  setFormData: React.Dispatch<React.SetStateAction<TransactionFormData>>;
}

export const useElectricityCalculator = ({ formData, setFormData }: UseElectricityCalculatorParams) => {
  const { toast } = useToast();

  // טיפול בשינויים בשדות תחשיב החשמל
  const handleElectricityChange = (type: string, field: string, value: string | number) => {
    // Convert value to string for consistent processing
    const stringValue = String(value);
    
    if (type === "electricityRate" || type === "vatRate") {
      setFormData((prevData) => ({
        ...prevData,
        [type]: stringValue ? parseFloat(stringValue) : 0
      }));
    } else {
      setFormData((prevData) => {
        // חיקוי של פעולת הפיזור עם טיפוס מוגדר
        const prevValue = prevData[type as keyof typeof prevData] as Record<string, any> || {};
        return {
          ...prevData,
          [type]: {
            ...prevValue,
            [field]: field === "date" ? stringValue : (stringValue ? parseFloat(stringValue) : 0)
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

  return {
    handleElectricityChange,
    calculateElectricityAmount
  };
};
