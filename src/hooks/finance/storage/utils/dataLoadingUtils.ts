
import { toast } from "sonner";
import { FinanceAction } from "@/contexts/types";
import { useLocalStorage } from "../useLocalStorage";
import { SYSTEM_CONSTANTS } from "../constants/systemConstants";

/**
 * וולידציה של נתונים שנטענו מהאחסון
 */
export const validateLoadedData = (data: any): boolean => {
  if (!data || typeof data !== 'object') {
    console.error("מבנה הנתונים השמורים אינו תקין");
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

/**
 * עדכון התראות משתמש לפי נתונים שנטענו
 */
export const displayDataLoadNotifications = (
  dataLoaded: boolean, 
  transactionsCount: number, 
  budgetsCount: number,
  removedDuplicates: number = 0,
  removedAutoIncomes: number = 0
) => {
  if (dataLoaded) {
    // הודעת הצלחה לטעינת נתונים
    toast.success("הנתונים נטענו בהצלחה", {
      description: `נטענו ${transactionsCount} עסקאות, ${budgetsCount} תקציבים`
    });
    
    // הודעה על סינון עסקאות אם בוצע
    if (removedDuplicates > 0 || removedAutoIncomes > 0) {
      const message = `סוננו ${removedDuplicates} עסקאות כפולות ו-${removedAutoIncomes} עסקאות הכנסה אוטומטיות`;
      console.log(message);
      toast.info(message);
    }
  }
};

/**
 * בדיקת חריגת מגבלת עסקאות
 */
export const checkTransactionLimits = (transactionsCount: number) => {
  if (transactionsCount > SYSTEM_CONSTANTS.MAX_TRANSACTIONS) {
    console.warn("יותר מדי עסקאות במערכת:", transactionsCount);
    
    toast.warning("יש יותר מדי עסקאות במערכת", {
      description: "מומלץ לאפס את המערכת או למחוק עסקאות ישנות בהקדם"
    });
    
    return true;
  }
  
  return false;
};

/**
 * טעינת נתונים לתוך ה-state
 */
export const loadDataIntoState = (
  data: any, 
  dispatch: React.Dispatch<FinanceAction>
): { dataWasLoaded: boolean, transactionsCount: number, budgetsCount: number } => {
  let dataWasLoaded = false;
  let transactionsCount = 0;
  let budgetsCount = 0;
  
  if (data.transactions && Array.isArray(data.transactions) && data.transactions.length > 0) {
    dispatch({ type: "ADD_TRANSACTIONS", payload: data.transactions });
    transactionsCount = data.transactions.length;
    dataWasLoaded = true;
  }
  
  if (data.budgets && Array.isArray(data.budgets) && data.budgets.length > 0) {
    data.budgets.forEach((budget) => {
      dispatch({ type: "SET_BUDGET", payload: budget });
    });
    budgetsCount = data.budgets.length;
    dataWasLoaded = true;
  }
  
  if (data.categoryMappings && Array.isArray(data.categoryMappings) && data.categoryMappings.length > 0) {
    dispatch({ type: "SET_CATEGORY_MAPPINGS", payload: data.categoryMappings });
    dataWasLoaded = true;
  }
  
  return { dataWasLoaded, transactionsCount, budgetsCount };
};
