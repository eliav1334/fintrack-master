
import { useReducer, useEffect, useState } from "react";
import { financeReducer } from "@/contexts/reducers";
import { initialState } from "@/contexts/defaultValues";
import { useMonthlyIncomes } from "./useMonthlyIncomes";
import { Budget, Transaction } from "@/types";
import { toast } from "sonner";

/**
 * הוק לניהול מצב פיננסי עם שמירה ב-localStorage
 */
export const useFinanceState = () => {
  const [state, dispatch] = useReducer(financeReducer, initialState);
  const { addMonthlyIncomes, cleanMonthlyIncomes, resetAllStoredData } = useMonthlyIncomes();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // טעינת נתונים מ-localStorage בעת האתחול
  useEffect(() => {
    // ניסיון לטעון נתונים שמורים
    const savedData = localStorage.getItem("financeState");
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        // בדיקת תקינות הנתונים הנטענים
        if (!parsedData || typeof parsedData !== 'object') {
          throw new Error("מבנה הנתונים השמורים אינו תקין");
        }
        
        // לוג מפורט של הנתונים הנטענים
        console.log("נטענו נתונים מהאחסון המקומי:", {
          transactions: parsedData.transactions?.length || 0,
          budgets: parsedData.budgets?.length || 0,
          categoryMappings: parsedData.categoryMappings?.length || 0,
          fullData: parsedData
        });
        
        // בדיקה ומניעת כפילויות עסקאות
        if (parsedData.transactions && Array.isArray(parsedData.transactions)) {
          const uniqueTransactions = removeDuplicateTransactions(parsedData.transactions);
          parsedData.transactions = uniqueTransactions;
          
          if (uniqueTransactions.length < parsedData.transactions.length) {
            console.log(`נמצאו וסוננו ${parsedData.transactions.length - uniqueTransactions.length} עסקאות כפולות`);
          }
        }
        
        // עדכון ה-state עם הנתונים השמורים
        let dataWasLoaded = false;
        
        if (parsedData.transactions && Array.isArray(parsedData.transactions) && parsedData.transactions.length > 0) {
          dispatch({ type: "ADD_TRANSACTIONS", payload: parsedData.transactions });
          dataWasLoaded = true;
        }
        
        if (parsedData.budgets && Array.isArray(parsedData.budgets) && parsedData.budgets.length > 0) {
          parsedData.budgets.forEach((budget: Budget) => {
            dispatch({ type: "SET_BUDGET", payload: budget });
          });
          dataWasLoaded = true;
        }
        
        if (parsedData.categoryMappings && Array.isArray(parsedData.categoryMappings) && parsedData.categoryMappings.length > 0) {
          dispatch({ type: "SET_CATEGORY_MAPPINGS", payload: parsedData.categoryMappings });
          dataWasLoaded = true;
        }
        
        // סימון שהנתונים נטענו בהצלחה
        setIsDataLoaded(true);
        
        // הודעה למשתמש שהנתונים נטענו
        if (dataWasLoaded) {
          toast.success("הנתונים נטענו בהצלחה", {
            description: `נטענו ${parsedData.transactions?.length || 0} עסקאות, ${parsedData.budgets?.length || 0} תקציבים`
          });
        } else {
          // אם אין נתונים מהותיים שנטענו, יצירת הכנסות חודשיות קבועות
          const monthlyIncomes = addMonthlyIncomes();
          dispatch({ type: "ADD_TRANSACTIONS", payload: monthlyIncomes });
          toast.success(`נוספו ${monthlyIncomes.length} עסקאות הכנסה חודשית קבועה`);
        }
      } catch (error) {
        console.error("שגיאה בטעינת נתונים מהאחסון המקומי:", error);
        toast.error("שגיאה בטעינת נתונים", {
          description: "לא ניתן היה לטעון את הנתונים השמורים. מאתחל מחדש."
        });
        
        // שמירת גיבוי של הנתונים הפגומים למקרה שיהיה צורך לשחזרם
        try {
          const timestamp = new Date().toISOString();
          localStorage.setItem(`financeState_backup_${timestamp}`, savedData);
          console.log(`נשמר גיבוי של הנתונים הפגומים בשם financeState_backup_${timestamp}`);
        } catch (backupError) {
          console.error("שגיאה בשמירת גיבוי לנתונים פגומים:", backupError);
        }
        
        // איפוס הנתונים והתחלה מחדש
        resetAllStoredData();
        
        // הוספת הכנסות חודשיות קבועות
        setTimeout(() => {
          const monthlyIncomes = addMonthlyIncomes();
          dispatch({ type: "ADD_TRANSACTIONS", payload: monthlyIncomes });
          toast.success(`נוספו ${monthlyIncomes.length} עסקאות הכנסה חודשית קבועה`);
          setIsDataLoaded(true);
        }, 800);
      }
    } else {
      // אם אין נתונים שמורים, יצירת הכנסות חודשיות קבועות
      console.log("אין נתונים שמורים, מוסיף הכנסות חודשיות קבועות");
      setTimeout(() => {
        const monthlyIncomes = addMonthlyIncomes();
        dispatch({ type: "ADD_TRANSACTIONS", payload: monthlyIncomes });
        toast.success(`נוספו ${monthlyIncomes.length} עסקאות הכנסה חודשית קבועה`);
        setIsDataLoaded(true);
      }, 800);
    }
  }, []);

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
      const lastBackupDate = localStorage.getItem("lastBackupDate");
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!lastBackupDate || lastBackupDate !== today) {
        // שמירת גיבוי יומי
        localStorage.setItem(`financeState_daily_backup_${today}`, JSON.stringify(dataToSave));
        localStorage.setItem("lastBackupDate", today);
        console.log(`נשמר גיבוי יומי: financeState_daily_backup_${today}`);
      }
      
      // שמירת הנתונים הנוכחיים
      localStorage.setItem("financeState", JSON.stringify(dataToSave));
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
  }, [state.transactions, state.budgets, state.categoryMappings, isDataLoaded]);
  
  // פונקציה להסרת עסקאות כפולות
  const removeDuplicateTransactions = (transactions: Transaction[]): Transaction[] => {
    const seen = new Map();
    return transactions.filter(transaction => {
      // יצירת מזהה ייחודי על בסיס שדות חשובים בעסקה
      const key = `${transaction.date}_${transaction.amount}_${transaction.description}`;
      
      if (seen.has(key)) {
        // אם כבר ראינו עסקה דומה, נבדוק איזו לשמור
        const existing = seen.get(key);
        
        // אם יש זיהוי קטגוריה לעסקה הנוכחית ולא לקיימת, נעדיף את הנוכחית
        if (transaction.categoryId && !existing.categoryId) {
          seen.set(key, transaction);
          return true;
        }
        
        return false; // נשמור את הראשונה שמצאנו
      } else {
        seen.set(key, transaction);
        return true;
      }
    });
  };

  return { state, dispatch };
};
