
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { FinanceState } from "@/contexts/types";
import { useLocalStorage } from "./useLocalStorage";

/**
 * הוק לשמירה אוטומטית של נתונים לאחסון מקומי
 */
export const useDataPersistence = (state: FinanceState, isDataLoaded: boolean) => {
  const { saveDataToLocalStorage, createDailyBackup } = useLocalStorage();
  const lastSaveTimeRef = useRef<number>(0);

  // שמירת נתונים ב-localStorage בכל שינוי
  useEffect(() => {
    // שמירה רק אם נתונים כבר נטענו כדי למנוע דריסה של נתונים קיימים
    if (!isDataLoaded) {
      console.log("דילוג על שמירת נתונים: טעינת נתונים לא הושלמה");
      return;
    }
    
    // מניעת שמירות תכופות מדי (לפחות 500ms בין שמירות)
    const now = Date.now();
    if (now - lastSaveTimeRef.current < 500) {
      console.log("דילוג על שמירת נתונים: שמירה קודמת בוצעה לאחרונה");
      return;
    }
    
    // בדיקה אם איפוס בתהליך
    if (localStorage.getItem("reset_in_progress") === "true") {
      console.log("דילוג על שמירת נתונים: איפוס מערכת בתהליך");
      return;
    }
    
    // בדיקת חסימת ייבוא - מימוש בטוח
    const isBlockedValue = localStorage.getItem("data_import_blocked");
    const isBlocked = isBlockedValue === "true";
    
    // בדיקת דריסה
    const hasOverride = localStorage.getItem("import_override_time") !== null;
    
    // אם ייבוא חסום וללא דריסה, לא שומרים
    if (isBlocked && !hasOverride) {
      console.log("דילוג על שמירת נתונים: חסימת ייבוא פעילה ללא דריסה");
      return;
    }
    
    try {
      // בדיקה אם יש יותר מדי עסקאות (מעל 50,000)
      if (state.transactions.length > 50000) {
        console.warn("יותר מדי עסקאות - חוסם ייבוא נוסף:", state.transactions.length);
        
        // רק אם אין דריסת חסימה, מפעילים את החסימה
        if (!hasOverride) {
          localStorage.setItem("data_import_blocked", "true");
          toast.warning("יש יותר מדי עסקאות במערכת", {
            description: "מומלץ לאפס את המערכת או למחוק עסקאות ישנות"
          });
          return;
        } else {
          console.log("נמצאה דריסת חסימת ייבוא - ממשיך בשמירה למרות כמות עסקאות גדולה");
        }
      }
      
      const dataToSave = {
        transactions: state.transactions,
        budgets: state.budgets,
        categoryMappings: state.categoryMappings
      };
      
      // עדכון זמן השמירה האחרון
      lastSaveTimeRef.current = now;
      
      // יצירת גיבוי תקופתי (פעם ביום)
      createDailyBackup(dataToSave);
      
      // שמירת הנתונים הנוכחיים
      saveDataToLocalStorage("financeState", dataToSave);
      console.log("נתונים נשמרו בהצלחה:", {
        transactions: state.transactions.length,
        budgets: state.budgets.length,
        categoryMappings: state.categoryMappings.length,
        time: new Date().toISOString()
      });
    } catch (error) {
      console.error("שגיאה בשמירת נתונים לאחסון מקומי:", error);
      
      // בדיקה אם השגיאה היא בגלל חריגת מכסה
      if (error instanceof Error && error.name === "QuotaExceededError") {
        console.error("חריגת מכסת אחסון - חוסם ייבוא נוסף", error);
        localStorage.setItem("data_import_blocked", "true");
        
        toast.error("חריגת מכסת אחסון", {
          description: "אין מספיק מקום לשמור את כל הנתונים. מומלץ למחוק חלק מהנתונים או ליצור גיבוי ולאפס."
        });
      } else {
        toast.error("שגיאה בשמירת נתונים", {
          description: "לא ניתן היה לשמור את הנתונים. נסה לרענן את הדף."
        });
      }
    }
  }, [state.transactions, state.budgets, state.categoryMappings, isDataLoaded, saveDataToLocalStorage, createDailyBackup]);
};
