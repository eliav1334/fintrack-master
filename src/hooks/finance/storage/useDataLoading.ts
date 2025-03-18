
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FinanceAction } from "@/contexts/types";
import { Transaction, Budget } from "@/types";
import { useLocalStorage } from "./useLocalStorage";
import { useMonthlyIncomes } from "../useMonthlyIncomes";

/**
 * הוק לטעינת נתונים מאחסון מקומי
 */
export const useDataLoading = (dispatch: React.Dispatch<FinanceAction>) => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { resetAllStoredData } = useMonthlyIncomes();
  const { loadDataFromLocalStorage, removeDuplicateTransactions } = useLocalStorage();

  // טעינת נתונים מ-localStorage בעת האתחול
  useEffect(() => {
    // בדיקה אם זו פעולת איפוס
    const isResetMode = localStorage.getItem("reset_in_progress") === "true";
    
    if (isResetMode) {
      console.log("זוהה מצב איפוס מערכת מכוון, דילוג על טעינת נתונים");
      localStorage.removeItem("reset_in_progress");
      
      // מוודא שהדגל להדילוג על הכנסות אוטומטיות מוגדר
      localStorage.setItem("permanent_skip_auto_incomes", "true");
      
      // מחיקת כל הנתונים מהמטמון
      Object.keys(localStorage).forEach(key => {
        if (key !== "permanent_skip_auto_incomes") {
          localStorage.removeItem(key);
        }
      });
      
      setIsDataLoaded(true);
      return;
    }
    
    // ניסיון לטעון נתונים שמורים
    const savedData = loadDataFromLocalStorage("financeState");
    
    if (savedData) {
      try {
        // בדיקת תקינות הנתונים הנטענים
        if (!savedData || typeof savedData !== 'object') {
          throw new Error("מבנה הנתונים השמורים אינו תקין");
        }
        
        // לוג מפורט של הנתונים הנטענים
        console.log("נטענו נתונים מהאחסון המקומי:", {
          transactions: savedData.transactions?.length || 0,
          budgets: savedData.budgets?.length || 0,
          categoryMappings: savedData.categoryMappings?.length || 0,
          fullData: savedData
        });
        
        // בדיקה ומניעת כפילויות עסקאות
        if (savedData.transactions && Array.isArray(savedData.transactions)) {
          const uniqueTransactions = removeDuplicateTransactions(savedData.transactions);
          // סינון כל עסקאות ההכנסה האוטומטיות
          const filteredTransactions = uniqueTransactions.filter(tx => 
            !(tx.type === "income" && tx.description === "משכורת חודשית קבועה")
          );
          
          savedData.transactions = filteredTransactions;
          
          const removedDuplicates = savedData.transactions.length - uniqueTransactions.length;
          const removedAutoIncomes = uniqueTransactions.length - filteredTransactions.length;
          
          if (removedDuplicates > 0 || removedAutoIncomes > 0) {
            console.log(`נמצאו וסוננו ${removedDuplicates} עסקאות כפולות ו-${removedAutoIncomes} עסקאות הכנסה אוטומטיות`);
            toast.info(`סוננו ${removedDuplicates} עסקאות כפולות ו-${removedAutoIncomes} עסקאות הכנסה אוטומטיות`);
          }
        }
        
        // עדכון ה-state עם הנתונים השמורים
        let dataWasLoaded = false;
        
        if (savedData.transactions && Array.isArray(savedData.transactions) && savedData.transactions.length > 0) {
          dispatch({ type: "ADD_TRANSACTIONS", payload: savedData.transactions });
          dataWasLoaded = true;
        }
        
        if (savedData.budgets && Array.isArray(savedData.budgets) && savedData.budgets.length > 0) {
          savedData.budgets.forEach((budget: Budget) => {
            dispatch({ type: "SET_BUDGET", payload: budget });
          });
          dataWasLoaded = true;
        }
        
        if (savedData.categoryMappings && Array.isArray(savedData.categoryMappings) && savedData.categoryMappings.length > 0) {
          dispatch({ type: "SET_CATEGORY_MAPPINGS", payload: savedData.categoryMappings });
          dataWasLoaded = true;
        }
        
        // סימון שהנתונים נטענו בהצלחה
        setIsDataLoaded(true);
        
        // הודעה למשתמש שהנתונים נטענו רק אם אכן נטענו נתונים
        if (dataWasLoaded) {
          toast.success("הנתונים נטענו בהצלחה", {
            description: `נטענו ${savedData.transactions?.length || 0} עסקאות, ${savedData.budgets?.length || 0} תקציבים`
          });
        }
      } catch (error) {
        console.error("שגיאה בטעינת נתונים מהאחסון המקומי:", error);
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
  }, [dispatch, resetAllStoredData, removeDuplicateTransactions, loadDataFromLocalStorage]);

  return { isDataLoaded };
};
