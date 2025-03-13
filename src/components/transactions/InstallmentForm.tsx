
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TransactionFormData } from "./transactionFormModels";

interface InstallmentFormProps {
  formData: TransactionFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInstallmentChange: (field: string, value: number) => void;
}

export const InstallmentForm: React.FC<InstallmentFormProps> = ({
  formData,
  onChange,
  onInstallmentChange,
}) => {
  // חישוב אוטומטי של תשלום חודשי
  const calculateMonthlyPayment = () => {
    if (formData.installmentDetails.totalAmount && formData.installmentDetails.totalInstallments) {
      const monthlyPayment = formData.installmentDetails.totalAmount / formData.installmentDetails.totalInstallments;
      // עדכון סכום העסקה לתשלום החודשי
      onInstallmentChange("currentAmount", monthlyPayment);
    }
  };

  return (
    <div className="space-y-4 border rounded-md p-4 bg-muted/30">
      <div className="text-sm font-medium mb-2">פרטי תשלומים</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="totalAmount">סכום כולל של העסקה</Label>
          <Input
            id="totalAmount"
            type="number"
            min="0"
            step="0.01"
            value={formData.installmentDetails.totalAmount || ""}
            onChange={(e) => {
              onInstallmentChange("totalAmount", parseFloat(e.target.value) || 0);
            }}
            onBlur={calculateMonthlyPayment}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="totalInstallments">מספר תשלומים</Label>
          <Input
            id="totalInstallments"
            type="number"
            min="1"
            value={formData.installmentDetails.totalInstallments || ""}
            onChange={(e) => {
              onInstallmentChange("totalInstallments", parseInt(e.target.value) || 1);
            }}
            onBlur={calculateMonthlyPayment}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="currentInstallment">תשלום נוכחי (מספר)</Label>
          <Input
            id="currentInstallment"
            type="number"
            min="1"
            max={formData.installmentDetails.totalInstallments || 1}
            value={formData.installmentDetails.currentInstallment || ""}
            onChange={(e) => {
              onInstallmentChange("currentInstallment", parseInt(e.target.value) || 1);
            }}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">סכום תשלום חודשי</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={onChange}
            className="font-medium"
          />
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground mt-2">
        * הסכום שיירשם בתנועה הוא סכום התשלום החודשי בלבד
      </div>
    </div>
  );
};
