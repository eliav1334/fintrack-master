
import { useToast } from "@/hooks/use-toast";
import { TransactionFormData } from "./transactionFormModels";

export const useTransactionFormValidator = () => {
  const { toast } = useToast();

  const validateForm = (formData: TransactionFormData): boolean => {
    if (!formData.description.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין תיאור",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      toast({
        title: "שגיאה",
        description: "נא להזין סכום תקין",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.categoryId) {
      toast({
        title: "שגיאה",
        description: "נא לבחור קטגוריה",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return { validateForm };
};
