
import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { FinanceState } from "@/contexts/types";
import { useLocalStorage } from "./useLocalStorage";
import { SYSTEM_CONSTANTS } from "./constants/systemConstants";

/**
 * הוק לשמירה אוטומטית של נתונים לאחסון מקומי עם בקרת שגיאות משופרת
 */
export const useDataPersistence = (state: FinanceState, isDataLoaded: boolean) => {
  const { saveDataToLocalStorage, createDailyBackup } = useLocalStorage();
  const lastSaveTimeRef = useRef<number>(0);
  const lastTransactionsCountRef = useRef<number>(0);

  // פונקציה לבדיקה אם יש לשמור נתונים
  const shouldSaveData = useCallback(() => {
    // שמירה רק אם נתונים כבר נטענו כדי למנוע דריסה של נתונים קיימים
    if (!isDataLoaded) {
      console.log("דילוג על שמירת נתונים: טעינת נתונים לא הושלמה");
      return false;
    }
    
    // מניעת שמירות תכופות מדי (לפחות 500ms בין שמירות)
    const now = Date.now();
    if (now - lastSaveTimeRef.current < 500) {
      console.log("דילוג על שמירת נתונים: שמירה קודמת בוצעה לאחרונה");
      return false;
    }
    
    // בדיקה אם הנתונים השתנו
    if (state.transactions.length === lastTransactionsCountRef.current) {
      console.log("דילוג על שמירת נתונים: אין שינוי במספר העסקאות");
      return false;
    }
    
    // בדיקה אם איפוס בתהליך
    if (localStorage.getItem(SYSTEM_CONSTANTS.KEYS.RESET_IN_PROGRESS) === "true") {
      console.log("דילוג על שמירת נתונים: איפוס מערכת בתהליך");
      return false;
    }
    
    return true;
  }, [isDataLoaded]);

  // פונקציה לבדיקת חסימת ייבוא נתונים
  const checkImportBlockStatus = useCallback(() => {
    // בדיקת חסימת ייבוא - בדיקה ישירה ובטוחה
    const isBlocked = localStorage.getItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED) === "true";
    
    // בדיקת דריסה
    const hasOverrideTimeStr = localStorage.getItem(SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME);
    const hasOverride = hasOverrideTimeStr !== null;
    
    // אם ייבוא חסום וללא דריסה, לא שומרים
    if (isBlocked && !hasOverride) {
      console.log("דילוג על שמירת נתונים: חסימת ייבוא פעילה ללא דריסה");
      return false;
    }
    
    return true;
  }, []);

  // פונקציה לבדיקת חריגת מגבלת עסקאות
  const checkTransactionOverflow = useCallback((transactionsCount: number) => {
    // בדיקה אם יש יותר מדי עסקאות (מעל 50,000)
    if (transactionsCount > SYSTEM_CONSTANTS.MAX_TRANSACTIONS) {
      console.warn("יותר מדי עסקאות - חוסם ייבוא נוסף:", transactionsCount);
      
      // רק אם אין דריסת חסימה, מפעילים את החסימה
      const hasOverrideTimeStr = localStorage.getItem(SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME);
      const hasOverride = hasOverrideTimeStr !== null;
      
      if (!hasOverride) {
        localStorage.setItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED, "true");
        // מחיקת כל דריסה קיימת
        localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME);
        
        toast.warning("יש יותר מדי עסקאות במערכת", {
          description: "מומלץ לאפס את המערכת או למחוק עסקאות ישנות"
        });
        return false;
      } else {
        console.log("נמצאה דריסת חסימת ייבוא - ממשיך בשמירה למרות כמות עסקאות גדולה");
        return true;
      }
    }
    
    return true;
  }, []);

  // שמירת נתונים ב-localStorage בכל שינוי
  useEffect(() => {
    if (!shouldSaveData()) {
      return;
    }
    
    if (!checkImportBlockStatus()) {
      return;
    }
    
    try {
      if (!checkTransactionOverflow(state.transactions.length)) {
        return;
      }
      
      // הכנת נתונים לשמירה
      const dataToSave = {
        transactions: state.transactions,
        budgets: state.budgets,
        categoryMappings: state.categoryMappings
      };
      
      // עדכון זמן השמירה האחרון
      const now = Date.now();
      lastSaveTimeRef.current = now;
      lastTransactionsCountRef.current = state.transactions.length;
      
      // יצירת גיבוי תקופתי (פעם ביום)
      createDailyBackup(dataToSave);
      
      // שמירת הנתונים הנוכחיים
      saveDataToLocalStorage(SYSTEM_CONSTANTS.KEYS.FINANCE_STATE, dataToSave);
      
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
        localStorage.setItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED, "true");
        // מחיקת כל דריסה קיימת
        localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.IMPORT_OVERRIDE_TIME);
        
        toast.error("חריגת מכסת אחסון", {
          description: "אין מספיק מקום לשמור את כל הנתונים. מומלץ למחוק חלק מהנתונים או ליצור גיבוי ולאפס."
        });
      } else {
        toast.error("שגיאה בשמירת נתונים", {
          description: "לא ניתן היה לשמור את הנתונים. נסה לרענן את הדף."
        });
      }
    }
  }, [
    state.transactions, 
    state.budgets, 
    state.categoryMappings, 
    isDataLoaded, 
    saveDataToLocalStorage, 
    createDailyBackup,
    shouldSaveData,
    checkImportBlockStatus,
    checkTransactionOverflow
  ]);
};
