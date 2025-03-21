
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FinanceAction } from "@/contexts/types";
import { useLocalStorage } from "./useLocalStorage";
import { useSystemReset } from "./useSystemReset";
import { useIncomeFilters } from "../income/useIncomeFilters";

// קבועי מערכת
const DATA_CONSTANTS = {
  // מפתחות אחסון
  KEYS: {
    FINANCE_STATE: "financeState",
    RESET_IN_PROGRESS: "reset_in_progress",
    DATA_IMPORT_BLOCKED: "data_import_blocked",
    PERMANENT_SKIP_AUTO_INCOMES: "permanent_skip_auto_incomes"
  },
  
  // הודעות מערכת
  MESSAGES: {
    SUCCESS: {
      DATA_LOADED: "הנתונים נטענו בהצלחה",
    },
    ERROR: {
      LOADING_ERROR: "שגיאה בטעינת נתונים",
      INVALID_DATA: "מבנה הנתונים השמורים אינו תקין"
    },
    INFO: {
      NO_SAVED_DATA: "אין נתונים שמורים",
      RESET_MODE: "זוהה מצב איפוס מערכת, דילוג על טעינת נתונים",
      FILTERED_DATA: "סוננו {0} עסקאות כפולות ו-{1} עסקאות הכנסה אוטומטיות"
    },
    WARNING: {
      TOO_MANY_TRANSACTIONS: "יש יותר מדי עסקאות במערכת"
    }
  }
};

/**
 * הוק לטעינת נתונים מאחסון מקומי
 */
export const useDataLoading = (dispatch: React.Dispatch<FinanceAction>) => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { resetAllStoredData } = useSystemReset();
  const { loadDataFromLocalStorage, removeDuplicateTransactions } = useLocalStorage();
  const { cleanMonthlyIncomes } = useIncomeFilters();

  /**
   * וולידציה של נתונים שנטענו מהאחסון
   */
  const validateLoadedData = (data: any): boolean => {
    if (!data || typeof data !== 'object') {
      console.error(DATA_CONSTANTS.MESSAGES.ERROR.INVALID_DATA);
      return false;
    }
    
    // בדיקת מבנה העסקאות
    if (data.transactions && !Array.isArray(data.transactions)) {
      console.error("מבנה העסקאות אינו תקין");
      return false;
    }
    
    // בדיקת מבנה התקציבים
    if (data.budgets && !Array.isArray(data.budgets)) {
      console.error("מבנה התקציבים אינו תקין");
      return false;
    }
    
    return true;
  };

  // טעינת נתונים מ-localStorage בעת האתחול
  useEffect(() => {
    const loadSavedData = () => {
      // בדיקה אם זו פעולת איפוס
      const isResetMode = localStorage.getItem(DATA_CONSTANTS.KEYS.RESET_IN_PROGRESS) === "true";
      
      if (isResetMode) {
        console.log(DATA_CONSTANTS.MESSAGES.INFO.RESET_MODE);
        localStorage.removeItem(DATA_CONSTANTS.KEYS.RESET_IN_PROGRESS);
        
        // מוודא שהדגל להדילוג על הכנסות אוטומטיות מוגדר
        localStorage.setItem(DATA_CONSTANTS.KEYS.PERMANENT_SKIP_AUTO_INCOMES, "true");
        
        // הסרת חסימת ייבוא אוטומטית
        localStorage.removeItem(DATA_CONSTANTS.KEYS.DATA_IMPORT_BLOCKED);
        
        setIsDataLoaded(true);
        return;
      }
      
      // מתעלמים מחסימת ייבוא בזמן טעינה ראשונית, כי אנחנו רק קוראים ולא כותבים נתונים חדשים
      
      // ניסיון לטעון נתונים שמורים
      const savedData = loadDataFromLocalStorage(DATA_CONSTANTS.KEYS.FINANCE_STATE);
      
      if (savedData) {
        try {
          // בדיקת תקינות הנתונים הנטענים
          if (!validateLoadedData(savedData)) {
            throw new Error(DATA_CONSTANTS.MESSAGES.ERROR.INVALID_DATA);
          }
          
          // לוג מאובטח של הנתונים הנטענים (ללא המידע עצמו)
          console.log("נטענו נתונים מהאחסון המקומי:", {
            transactions: savedData.transactions?.length || 0,
            budgets: savedData.budgets?.length || 0,
            categoryMappings: savedData.categoryMappings?.length || 0
          });
          
          // בדיקה אם יש יותר מדי עסקאות
          if (savedData.transactions && Array.isArray(savedData.transactions) && 
              savedData.transactions.length > 50000) {
            console.warn(DATA_CONSTANTS.MESSAGES.WARNING.TOO_MANY_TRANSACTIONS + ":", 
              savedData.transactions.length);
            
            // לא חוסמים באופן אוטומטי, רק מציגים התראה
            toast.warning(DATA_CONSTANTS.MESSAGES.WARNING.TOO_MANY_TRANSACTIONS, {
              description: "מומלץ לאפס את המערכת או למחוק עסקאות ישנות בהקדם"
            });
          }
          
          // בדיקה ומניעת כפילויות עסקאות
          if (savedData.transactions && Array.isArray(savedData.transactions)) {
            const originalCount = savedData.transactions.length;
            // סינון כפילויות
            const uniqueTransactions = removeDuplicateTransactions(savedData.transactions);
            // סינון כל עסקאות ההכנסה האוטומטיות
            const filteredTransactions = cleanMonthlyIncomes(uniqueTransactions);
            
            savedData.transactions = filteredTransactions;
            
            const removedDuplicates = originalCount - uniqueTransactions.length;
            const removedAutoIncomes = uniqueTransactions.length - filteredTransactions.length;
            
            if (removedDuplicates > 0 || removedAutoIncomes > 0) {
              const message = DATA_CONSTANTS.MESSAGES.INFO.FILTERED_DATA
                .replace("{0}", removedDuplicates.toString())
                .replace("{1}", removedAutoIncomes.toString());
                
              console.log(message);
              toast.info(message);
            }
          }
          
          // עדכון ה-state עם הנתונים השמורים
          let dataWasLoaded = false;
          
          if (savedData.transactions && Array.isArray(savedData.transactions) && 
              savedData.transactions.length > 0) {
            // טעינה של עסקאות ייחודיות בלבד
            dispatch({ type: "ADD_TRANSACTIONS", payload: savedData.transactions });
            dataWasLoaded = true;
          }
          
          if (savedData.budgets && Array.isArray(savedData.budgets) && 
              savedData.budgets.length > 0) {
            savedData.budgets.forEach((budget) => {
              dispatch({ type: "SET_BUDGET", payload: budget });
            });
            dataWasLoaded = true;
          }
          
          if (savedData.categoryMappings && Array.isArray(savedData.categoryMappings) && 
              savedData.categoryMappings.length > 0) {
            dispatch({ type: "SET_CATEGORY_MAPPINGS", payload: savedData.categoryMappings });
            dataWasLoaded = true;
          }
          
          // סימון שהנתונים נטענו בהצלחה
          setIsDataLoaded(true);
          
          // הודעה למשתמש שהנתונים נטענו רק אם אכן נטענו נתונים
          if (dataWasLoaded) {
            toast.success(DATA_CONSTANTS.MESSAGES.SUCCESS.DATA_LOADED, {
              description: `נטענו ${savedData.transactions?.length || 0} עסקאות, ${savedData.budgets?.length || 0} תקציבים`
            });
          }
        } catch (error) {
          console.error(DATA_CONSTANTS.MESSAGES.ERROR.LOADING_ERROR + ":", error);
          toast.error(DATA_CONSTANTS.MESSAGES.ERROR.LOADING_ERROR, {
            description: "לא ניתן היה לטעון את הנתונים השמורים. מאתחל מחדש."
          });
          
          // איפוס הנתונים והתחלה מחדש
          resetAllStoredData();
          setIsDataLoaded(true);
        }
      } else {
        console.log(DATA_CONSTANTS.MESSAGES.INFO.NO_SAVED_DATA);
        setIsDataLoaded(true);
      }
    };
    
    // טעינת נתונים פעם אחת בלבד
    if (!isDataLoaded) {
      loadSavedData();
    }
  }, [dispatch, resetAllStoredData, removeDuplicateTransactions, loadDataFromLocalStorage, cleanMonthlyIncomes, isDataLoaded]);

  return { isDataLoaded };
};
