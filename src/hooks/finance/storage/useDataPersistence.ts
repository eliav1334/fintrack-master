
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
    
    // בדיקה אם איפוס בתהליך או שייבוא נתונים חסום
    if (localStorage.getItem("reset_in_progress") === "true" || 
        localStorage.getItem("data_import_blocked") === "true") {
      console.log("דילוג על שמירת נתונים בגלל איפוס או חסימת ייבוא");
      return;
    }
    
    try {
      // בדיקה אם יש יותר מדי עסקאות (מעל 10,000)
      if (state.transactions.length > 10000) {
        console.warn("יותר מדי עסקאות - חוסם ייבוא נוסף:", state.transactions.length);
        localStorage.setItem("data_import_blocked", "true");
        toast.warning("יש יותר מדי עסקאות במערכת", {
          description: "מומלץ לאפס את המערכת או למחוק עסקאות ישנות"
        });
        return;
      }
      
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
      
      // בדיקה אם השגיאה היא בגלל חריגת מכסה
      if (error instanceof Error && error.name === "QuotaExceededError") {
        console.error("חריגת מכסת אחסון - חוסם ייבוא נוסף", error);
        localStorage.setItem("data_import_blocked", "true");
        toast.error("חריגת מכסת אחסון", {
          description: "אין מספיק מקום לשמור את כל הנתונים. אנא אפס את המערכת או מחק נתונים מיותרים."
        });
      } else {
        toast.error("שגיאה בשמירת נתונים", {
          description: "לא ניתן היה לשמור את הנתונים. נסה לרענן את הדף."
        });
      }
    }
  }, [state.transactions, state.budgets, state.categoryMappings, isDataLoaded, saveDataToLocalStorage, createDailyBackup]);
};
