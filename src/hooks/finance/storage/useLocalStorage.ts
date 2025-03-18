
import { toast } from "sonner";
import { Transaction } from "@/types";

/**
 * הוק לניהול אחסון מקומי של נתונים פיננסיים
 */
export const useLocalStorage = () => {
  /**
   * שמירת נתונים לאחסון מקומי
   */
  const saveDataToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`שגיאה בשמירת ${key} לאחסון מקומי:`, error);
      return false;
    }
  };

  /**
   * טעינת נתונים מאחסון מקומי
   */
  const loadDataFromLocalStorage = (key: string) => {
    try {
      const savedData = localStorage.getItem(key);
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      console.error(`שגיאה בטעינת ${key} מהאחסון המקומי:`, error);
      return null;
    }
  };

  /**
   * יצירת גיבוי יומי
   */
  const createDailyBackup = (data: any) => {
    try {
      const lastBackupDate = localStorage.getItem("lastBackupDate");
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!lastBackupDate || lastBackupDate !== today) {
        // שמירת גיבוי יומי
        localStorage.setItem(`financeState_daily_backup_${today}`, JSON.stringify(data));
        localStorage.setItem("lastBackupDate", today);
        console.log(`נשמר גיבוי יומי: financeState_daily_backup_${today}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("שגיאה ביצירת גיבוי יומי:", error);
      return false;
    }
  };

  /**
   * הסרת כפילויות בעסקאות
   */
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

  return {
    saveDataToLocalStorage,
    loadDataFromLocalStorage,
    createDailyBackup,
    removeDuplicateTransactions
  };
};
