
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { FinanceAction } from "@/contexts/types";
import { useLocalStorage } from "./useLocalStorage";
import { useSystemReset } from "./useSystemReset";
import { useIncomeFilters } from "../income/useIncomeFilters";
import { 
  validateLoadedData, 
  displayDataLoadNotifications, 
  checkTransactionLimits, 
  loadDataIntoState 
} from "./utils/dataLoadingUtils";
import { SYSTEM_CONSTANTS } from "./constants/systemConstants";

/**
 * הוק לטעינה ראשונית של נתונים מאחסון מקומי
 */
export const useInitialDataLoad = (dispatch: React.Dispatch<FinanceAction>) => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { resetAllStoredData } = useSystemReset();
  const { loadDataFromLocalStorage, removeDuplicateTransactions } = useLocalStorage();
  const { cleanMonthlyIncomes } = useIncomeFilters();

  // טעינת נתונים מ-localStorage בעת האתחול
  useEffect(() => {
    const loadSavedData = () => {
      // בדיקה אם זו פעולת איפוס
      const isResetMode = localStorage.getItem(SYSTEM_CONSTANTS.KEYS.RESET_IN_PROGRESS) === "true";
      
      if (isResetMode) {
        console.log("זוהה מצב איפוס מערכת, דילוג על טעינת נתונים");
        localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.RESET_IN_PROGRESS);
        
        // מוודא שהדגל להדילוג על הכנסות אוטומטיות מוגדר
        localStorage.setItem(SYSTEM_CONSTANTS.KEYS.PERMANENT_SKIP_AUTO_INCOMES, "true");
        
        // הסרת חסימת ייבוא אוטומטית
        localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED);
        
        setIsDataLoaded(true);
        return;
      }
      
      // ניסיון לטעון נתונים שמורים
      const savedData = loadDataFromLocalStorage(SYSTEM_CONSTANTS.KEYS.FINANCE_STATE);
      
      if (savedData) {
        try {
          // בדיקת תקינות הנתונים הנטענים
          if (!validateLoadedData(savedData)) {
            throw new Error("מבנה הנתונים השמורים אינו תקין");
          }
          
          // לוג מאובטח של הנתונים הנטענים (ללא המידע עצמו)
          console.log("נטענו נתונים מהאחסון המקומי:", {
            transactions: savedData.transactions?.length || 0,
            budgets: savedData.budgets?.length || 0,
            categoryMappings: savedData.categoryMappings?.length || 0
          });
          
          // בדיקה אם יש יותר מדי עסקאות
          if (savedData.transactions && Array.isArray(savedData.transactions)) {
            checkTransactionLimits(savedData.transactions.length);
          }
          
          // פיצול לוגיקת הסינון ועיבוד הנתונים
          const processedData = processSavedData(savedData);
          
          // טעינת הנתונים לתוך ה-state
          const { dataWasLoaded, transactionsCount, budgetsCount } = 
            loadDataIntoState(processedData, dispatch);
          
          // הצגת התראות למשתמש
          displayDataLoadNotifications(
            dataWasLoaded,
            transactionsCount,
            budgetsCount,
            savedData.transactions?.length - processedData.transactions?.length || 0,
            0 // נתוני הכנסות אוטומטיות מטופלים בתוך processSavedData
          );
          
          // סימון שהנתונים נטענו בהצלחה
          setIsDataLoaded(true);
        } catch (error) {
          console.error("שגיאה בטעינת נתונים:", error);
          toast.error("שגיאה בטעינת נתונים", {
            description: "לא ניתן היה לטעון את הנתונים השמורים. מאתחל מחדש."
          });
          
          // איפוס הנתונים והתחלה מחדש
          resetAllStoredData();
          setIsDataLoaded(true);
        }
      } else {
        console.log("אין נתונים שמורים");
        setIsDataLoaded(true);
      }
    };
    
    // פונקציית עזר לעיבוד הנתונים השמורים
    const processSavedData = (savedData: any) => {
      const result = { ...savedData };
      
      if (savedData.transactions && Array.isArray(savedData.transactions)) {
        const originalCount = savedData.transactions.length;
        
        // סינון כפילויות
        const uniqueTransactions = removeDuplicateTransactions(savedData.transactions);
        
        // סינון כל עסקאות ההכנסה האוטומטיות
        const filteredTransactions = cleanMonthlyIncomes(uniqueTransactions);
        
        result.transactions = filteredTransactions;
        
        // לוג סיכום הסינון
        const removedDuplicates = originalCount - uniqueTransactions.length;
        const removedAutoIncomes = uniqueTransactions.length - filteredTransactions.length;
        
        if (removedDuplicates > 0 || removedAutoIncomes > 0) {
          console.log(`סוננו ${removedDuplicates} עסקאות כפולות ו-${removedAutoIncomes} עסקאות הכנסה אוטומטיות`);
        }
      }
      
      return result;
    };
    
    // טעינת נתונים פעם אחת בלבד
    if (!isDataLoaded) {
      loadSavedData();
    }
  }, [
    dispatch, 
    resetAllStoredData, 
    removeDuplicateTransactions, 
    loadDataFromLocalStorage, 
    cleanMonthlyIncomes, 
    isDataLoaded
  ]);

  return { isDataLoaded };
};
