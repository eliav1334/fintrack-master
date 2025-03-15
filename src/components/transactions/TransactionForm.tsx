
import React from "react";
import { Transaction } from "@/types";
import { TransactionTypeRadio } from "./TransactionTypeRadio";
import { TransactionFormField } from "./TransactionFormField";
import { CategorySelect } from "./CategorySelect";
import { TransactionFormActions } from "./TransactionFormActions";
import { useTransactionForm } from "./useTransactionForm";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ElectricityBillForm } from "./ElectricityBillForm";
import { InstallmentForm } from "./InstallmentForm";

interface TransactionFormProps {
  transaction?: Transaction;
  onClose?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onClose,
}) => {
  const {
    formData,
    isEditing,
    filteredCategories,
    handleInputChange,
    handleSelectChange,
    handleSwitchChange,
    handleElectricityChange,
    handleInstallmentChange,
    calculateElectricityAmount,
    handleSubmit,
  } = useTransactionForm(transaction, onClose);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <TransactionTypeRadio
          value={formData.type}
          onChange={(value) => handleSelectChange("type", value)}
        />

        <TransactionFormField
          id="description"
          label="תיאור"
          placeholder="לדוגמה, קניות במרכול"
          value={formData.description}
          onChange={handleInputChange}
        />

        {/* תוספת - בורר עבור עסקה בתשלומים */}
        <div className="flex items-center space-x-2 space-x-reverse rtl:space-x-reverse">
          <Switch
            id="isInstallment"
            checked={formData.isInstallment}
            onCheckedChange={(checked) => handleSwitchChange("isInstallment", checked)}
          />
          <Label htmlFor="isInstallment" className="mr-2">עסקה בתשלומים</Label>
        </div>
        
        {/* טופס תשלומים */}
        {formData.isInstallment ? (
          <InstallmentForm 
            formData={formData}
            onChange={handleInputChange}
            onInstallmentChange={handleInstallmentChange}
          />
        ) : (
          <>
            {/* תוספת - בורר עבור תחשיב חשמל */}
            <div className="flex items-center space-x-2 space-x-reverse rtl:space-x-reverse">
              <Switch
                id="isElectricityBill"
                checked={formData.isElectricityBill}
                onCheckedChange={(checked) => handleSwitchChange("isElectricityBill", checked)}
              />
              <Label htmlFor="isElectricityBill" className="mr-2">חשבון חשמל עם שני מונים</Label>
            </div>

            {formData.isElectricityBill ? (
              <ElectricityBillForm 
                formData={formData}
                handleElectricityChange={handleElectricityChange}
                calculateElectricityAmount={calculateElectricityAmount}
              />
            ) : (
              <TransactionFormField
                id="amount"
                label="סכום"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleInputChange}
              />
            )}
          </>
        )}

        <TransactionFormField
          id="date"
          label="תאריך"
          type="date"
          value={formData.date}
          onChange={handleInputChange}
        />

        <CategorySelect
          categories={filteredCategories}
          selectedCategoryId={formData.categoryId}
          onChange={(value) => handleSelectChange("categoryId", value)}
          transactionType={formData.type}
          description={formData.description}
        />

        <div className="space-y-2">
          <Label htmlFor="notes">הערות (אופציונלי)</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="פרטים נוספים..."
            value={formData.notes || ""}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <TransactionFormActions isEditing={isEditing} onCancel={onClose} />
    </form>
  );
};
