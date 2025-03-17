
import { Transaction } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useFinance } from "@/contexts/FinanceContext";
import { TransactionFormData } from "./transactionFormModels";
import { useTransactionFormValidator } from "./useTransactionFormValidator";

interface UseTransactionSubmitParams {
  formData: TransactionFormData;
  isEditing: boolean;
  initialTransaction?: Transaction;
  resetFormData: () => void;
  onClose?: () => void;
}

/**
 * Custom hook to handle transaction form submission
 */
export const useTransactionSubmit = ({
  formData,
  isEditing,
  initialTransaction,
  resetFormData,
  onClose
}: UseTransactionSubmitParams) => {
  const { addTransaction, updateTransaction } = useFinance();
  const { toast } = useToast();
  const { validateForm } = useTransactionFormValidator();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }

    try {
      const transactionData: Partial<Transaction> = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        date: formData.date,
        categoryId: formData.categoryId,
        notes: formData.notes.trim(),
        isInstallment: formData.isInstallment,
      };
      
      if (formData.isInstallment) {
        transactionData.installmentDetails = {
          installmentNumber: formData.installmentDetails.installmentNumber || 1,
          totalInstallments: formData.installmentDetails.totalInstallments,
          totalAmount: formData.installmentDetails.totalAmount,
          currentInstallment: formData.installmentDetails.currentInstallment
        };
      } else if (formData.isElectricityBill) {
        transactionData.isElectricityBill = formData.isElectricityBill;
        transactionData.mainMeterReading = formData.mainMeterReading;
        transactionData.secondaryMeterReading = formData.secondaryMeterReading;
        transactionData.electricityRate = formData.electricityRate;
        transactionData.vatRate = formData.vatRate;
      }

      if (isEditing && initialTransaction) {
        updateTransaction({ ...transactionData, id: initialTransaction.id } as Transaction);
        toast({
          title: "הצלחה",
          description: "העסקה עודכנה בהצלחה",
        });
      } else {
        addTransaction(transactionData as Omit<Transaction, "id">);
        toast({
          title: "הצלחה",
          description: "העסקה נוספה בהצלחה",
        });
      }

      // Reset form data if not editing
      if (!isEditing) {
        resetFormData();
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

  return { handleSubmit };
};
