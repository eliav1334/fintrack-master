
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
  const { addTransaction, updateTransaction, state } = useFinance();
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
        
        // Auto-categorize similar transactions if category has changed
        if (initialTransaction.categoryId !== formData.categoryId && formData.categoryId && formData.description) {
          autoCategorizeSimilarTransactions(formData.description, formData.categoryId);
        }
        
        toast({
          title: "הצלחה",
          description: "העסקה עודכנה בהצלחה",
        });
      } else {
        // בדוק אם העסקה כבר קיימת לפני הוספה
        const isDuplicate = checkForDuplicateTransaction(transactionData);
        
        if (isDuplicate) {
          toast({
            title: "שגיאה",
            description: "עסקה דומה כבר קיימת במערכת",
            variant: "destructive",
          });
          return;
        }
        
        addTransaction(transactionData as Omit<Transaction, "id">);
        
        // Auto-categorize similar transactions for new transactions with categories
        if (formData.categoryId && formData.description) {
          autoCategorizeSimilarTransactions(formData.description, formData.categoryId);
        }
        
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
  
  /**
   * בדיקה אם עסקה דומה כבר קיימת במערכת
   */
  const checkForDuplicateTransaction = (transaction: Partial<Transaction>): boolean => {
    return state.transactions.some(tx => 
      tx.date === transaction.date && 
      Math.abs(tx.amount - (transaction.amount || 0)) < 0.01 && // השוואת סכומים עם סבילות קטנה לשגיאות עיגול
      tx.description === transaction.description
    );
  };
  
  /**
   * Auto-categorize similar transactions that have the same description
   */
  const autoCategorizeSimilarTransactions = (description: string, categoryId: string) => {
    // Check if there's already a mapping for this description
    const existingMapping = state.categoryMappings.find(
      mapping => mapping.description.toLowerCase() === description.toLowerCase()
    );
    
    // If no mapping exists, create one
    if (!existingMapping) {
      // This will be processed by the categoryMappingReducer 
      // which will then auto-update transactions
      useFinance().addCategoryMapping({
        description,
        categoryId
      });
    }
  };

  return { handleSubmit };
};
