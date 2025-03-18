
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
  const [skipAutoIncomes, setSkipAutoIncomes] = useState(false);
  
  // טעינת נתונים מ-localStorage בעת האתחול
  useEffect(() => {
    // בדיקה אם זו פעולת איפוס
    const isResetMode = localStorage.getItem("reset_in_progress") === "true";
    const shouldSkipAutoIncomes = localStorage.getItem("skip_auto_incomes") === "true";
    const permanentlySkipAutoIncomes = localStorage.getItem("permanent_skip_auto_incomes") === "true";
    
    // אם יש הגדרה קבועה לדלג על הכנסות אוטומטיות, נשמור אותה
    if (permanentlySkipAutoIncomes) {
      console.log("זוהתה הגדרה קבועה לדילוג על הכנסות אוטומטיות");
      setSkipAutoIncomes(true);
    }
    
    if (isResetMode) {
      console.log("זוהה מצב איפוס מערכת מכוון, דילוג על טעינת נתונים");
      localStorage.removeItem("reset_in_progress");
      setIsDataLoaded(true);
      setSkipAutoIncomes(true);
      return;
    }
    
    if (shouldSkipAutoIncomes) {
      console.log("זוהה מצב דילוג על הכנסות אוטומטיות");
      localStorage.removeItem("skip_auto_incomes");
      setSkipAutoIncomes(true);
    }
    
    if (state.transactions.length === 0 && state.budgets.length === 0 && 
        state.categoryMappings.length === 0 && state.categories.length > 0) {
      console.log("זוהה מצב איפוס מערכת, מנקה את localStorage");
      localStorage.removeItem("financeState");
    }
    
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
          // סינון כל עסקאות ההכנסה האוטומטיות
          const filteredTransactions = uniqueTransactions.filter(tx => 
            !(tx.type === "income" && tx.description === "משכורת חודשית קבועה")
          );
          
          parsedData.transactions = filteredTransactions;
          
          const removedDuplicates = parsedData.transactions.length - uniqueTransactions.length;
          const removedAutoIncomes = uniqueTransactions.length - filteredTransactions.length;
          
          if (removedDuplicates > 0 || removedAutoIncomes > 0) {
            console.log(`נמצאו וסוננו ${removedDuplicates} עסקאות כפולות ו-${removedAutoIncomes} עסקאות הכנסה אוטומטיות`);
            toast.info(`סוננו ${removedDuplicates} עסקאות כפולות ו-${removedAutoIncomes} עסקאות הכנסה אוטומטיות`);
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
        
        // הודעה למשתמש שהנתונים נטענו רק אם אכן נטענו נתונים
        if (dataWasLoaded) {
          toast.success("הנתונים נטענו בהצלחה", {
            description: `נטענו ${parsedData.transactions?.length || 0} עסקאות, ${parsedData.budgets?.length || 0} תקציבים`
          });
          // מכיוון שנטענו נתונים, נדלג על הוספה אוטומטית של הכנסות חודשיות
          setSkipAutoIncomes(true);
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
  }, []);

  // טיפול בהוספת הכנסות חודשיות בהתבסס על מצב הטעינה
  useEffect(() => {
    // בודק אם יש הגדרת איפוס קבוע
    const permanentlySkipAutoIncomes = localStorage.getItem("permanent_skip_auto_incomes") === "true";
    
    if (isDataLoaded && !skipAutoIncomes && state.transactions.length === 0 && !permanentlySkipAutoIncomes) {
      console.log("מוסיף הכנסות חודשיות קבועות");
      setTimeout(() => {
        const monthlyIncomes = addMonthlyIncomes();
        dispatch({ type: "ADD_TRANSACTIONS", payload: monthlyIncomes });
        if (monthlyIncomes.length > 0) {
          toast.success(`נוספו ${monthlyIncomes.length} עסקאות הכנסה חודשית קבועה`);
        }
      }, 800);
    }
  }, [isDataLoaded, skipAutoIncomes]);

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
