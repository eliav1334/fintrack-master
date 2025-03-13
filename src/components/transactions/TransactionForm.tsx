
import React from "react";
import { Transaction } from "@/types";
import { TransactionTypeRadio } from "./TransactionTypeRadio";
import { TransactionFormField } from "./TransactionFormField";
import { CategorySelect } from "./CategorySelect";
import { TransactionFormActions } from "./TransactionFormActions";
import { useTransactionForm } from "./useTransactionForm";

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
        />

        <TransactionFormField
          id="notes"
          label="הערות (אופציונלי)"
          placeholder="פרטים נוספים..."
          value={formData.notes}
          onChange={handleInputChange}
        />
      </div>

      <TransactionFormActions isEditing={isEditing} onClose={onClose} />
    </form>
  );
};
