
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
   * הסרת כפילויות בעסקאות - גרסה משופרת מאוד
   */
  const removeDuplicateTransactions = (transactions: Transaction[]): Transaction[] => {
    if (!transactions || !Array.isArray(transactions)) {
      console.warn("נתוני עסקאות לא תקינים לסינון כפילויות:", transactions);
      return [];
    }
    
    console.log(`בודק כפילויות בין ${transactions.length} עסקאות`);
    
    // שימוש במפה עם מפתחות מורכבים לזיהוי כפילויות
    const uniqueTransactions = new Map<string, Transaction>();
    const duplicateIds = new Set<string>(); // מעקב אחר עסקאות כפולות
    
    // זיהוי כפילויות במערך
    transactions.forEach(transaction => {
      // יצירת מזהה ייחודי מורכב מהשדות החשובים
      const simpleKey = `${transaction.date}_${transaction.amount.toFixed(2)}_${transaction.description}_${transaction.type}`;
      
      // יצירת מזהה מורחב עם פרטים נוספים אם קיימים
      let complexKey = simpleKey;
      
      if (transaction.transactionCode) {
        complexKey += `_${transaction.transactionCode}`;
      }
      
      if (transaction.cardNumber) {
        complexKey += `_${transaction.cardNumber}`;
      }
      
      if (transaction.isInstallment && transaction.installmentDetails) {
        complexKey += `_${transaction.installmentDetails.installmentNumber}_${transaction.installmentDetails.totalInstallments}`;
      }
      
      // בדיקה אם העסקה כבר קיימת
      if (uniqueTransactions.has(simpleKey)) {
        // כפילות נמצאה - נשמור את המזהה
        duplicateIds.add(transaction.id);
        console.log("זיהוי עסקה כפולה (מפתח פשוט):", simpleKey, transaction);
      } else {
        // עסקה ייחודית - נשמור אותה
        uniqueTransactions.set(simpleKey, transaction);
      }
      
      // בדיקה נוספת עם המפתח המורחב אם רלוונטי
      if (simpleKey !== complexKey) {
        if (uniqueTransactions.has(complexKey)) {
          // כפילות נמצאה - נשמור את המזהה
          duplicateIds.add(transaction.id);
          console.log("זיהוי עסקה כפולה (מפתח מורחב):", complexKey, transaction);
        } else {
          // עסקה ייחודית גם במפתח המורחב - נשמור אותה
          uniqueTransactions.set(complexKey, transaction);
        }
      }
    });
    
    // בניית מערך התוצאה תוך סינון העסקאות הכפולות
    const result = transactions.filter(transaction => !duplicateIds.has(transaction.id));
    
    // לוג מספר העסקאות שהוסרו
    const removedCount = transactions.length - result.length;
    if (removedCount > 0) {
      console.log(`הוסרו ${removedCount} עסקאות כפולות מסך ${transactions.length} עסקאות`);
    }
    
    return result;
  };

  return {
    saveDataToLocalStorage,
    loadDataFromLocalStorage,
    createDailyBackup,
    removeDuplicateTransactions
  };
};
