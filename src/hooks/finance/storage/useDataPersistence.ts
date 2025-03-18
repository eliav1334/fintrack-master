
import { useEffect } from "react";
import { toast } from "sonner";
import { FinanceState } from "@/contexts/types";
import { useLocalStorage } from "./useLocalStorage";

/**
 * הוק לשמירה אוטומטית של נתונים לאחסון מקומי
 */
export const useDataPersistence = (state: FinanceState, isDataLoaded: boolean) => {
  const { saveDataToLocalStorage, createDailyBackup } = useLocalStorage();

  // שמירת נתונים ב-localStorage בכל שינוי
  useEffect(() => {
    // שמירה רק אם נתונים כבר נטענו כדי למנוע דריסה של נתונים קיימים
    if (!isDataLoaded) return;
    
    try {
      const dataToSave = {
        transactions: state.transactions,
        budgets: state.budgets,
        categoryMappings: state.categoryMappings
      };
      
      // יצירת גיבוי תקופתי (פעם ביום)
      createDailyBackup(dataToSave);
      
      // שמירת הנתונים הנוכחיים
      saveDataToLocalStorage("financeState", dataToSave);
      console.log("נתונים נשמרו בהצלחה:", {
        transactions: state.transactions.length,
        budgets: state.budgets.length,
        categoryMappings: state.categoryMappings.length
      });
    } catch (error) {
      console.error("שגיאה בשמירת נתונים לאחסון מקומי:", error);
      toast.error("שגיאה בשמירת נתונים", {
        description: "לא ניתן היה לשמור את הנתונים. נסה לרענן את הדף."
      });
    }
  }, [state.transactions, state.budgets, state.categoryMappings, isDataLoaded, saveDataToLocalStorage, createDailyBackup]);
};
