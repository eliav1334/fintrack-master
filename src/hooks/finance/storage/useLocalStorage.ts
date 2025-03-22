
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
        
        // ניקוי גיבויים ישנים (שומרים רק 7 ימים אחרונים)
        cleanupOldBackups();
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("שגיאה ביצירת גיבוי יומי:", error);
      return false;
    }
  };
  
  /**
   * ניקוי גיבויים ישנים (שומר רק 7 ימים אחרונים)
   */
  const cleanupOldBackups = () => {
    try {
      const dailyBackupKeys: string[] = [];
      
      // איסוף כל מפתחות הגיבויים היומיים
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("financeState_daily_backup_")) {
          dailyBackupKeys.push(key);
        }
      }
      
      // מיון לפי תאריך (מהישן לחדש)
      dailyBackupKeys.sort();
      
      // אם יש יותר מ-7 גיבויים, מוחקים את הישנים ביותר
      if (dailyBackupKeys.length > 7) {
        const keysToRemove = dailyBackupKeys.slice(0, dailyBackupKeys.length - 7);
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log(`נמחק גיבוי ישן: ${key}`);
        });
      }
    } catch (error) {
      console.error("שגיאה בניקוי גיבויים ישנים:", error);
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
      } else {
        // עסקה ייחודית - נשמור אותה
        uniqueTransactions.set(simpleKey, transaction);
      }
      
      // בדיקה נוספת עם המפתח המורחב אם רלוונטי
      if (simpleKey !== complexKey) {
        if (uniqueTransactions.has(complexKey)) {
          // כפילות נמצאה - נשמור את המזהה
          duplicateIds.add(transaction.id);
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
  
  /**
   * ניקוי עסקאות ישנות (ארכוב)
   */
  const archiveOldTransactions = (transactions: Transaction[], monthsToKeep: number = 12): Transaction[] => {
    try {
      if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
        return transactions;
      }
      
      // חישוב התאריך הגבולי (לפני X חודשים)
      const now = new Date();
      const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsToKeep, 1).toISOString().split('T')[0];
      
      // סינון העסקאות החדשות מהתאריך הגבולי
      const recentTransactions = transactions.filter(transaction => transaction.date >= cutoffDate);
      
      // העסקאות הישנות שיועברו לארכיון
      const oldTransactions = transactions.filter(transaction => transaction.date < cutoffDate);
      
      // אם יש עסקאות ישנות, שומרים אותן בארכיון
      if (oldTransactions.length > 0) {
        console.log(`מעביר ${oldTransactions.length} עסקאות ישנות לארכיון`);
        
        // שמירת הארכיון עם תאריך
        const archiveKey = `financeState_archive_${new Date().toISOString().split('T')[0]}`;
        saveDataToLocalStorage(archiveKey, { archivedTransactions: oldTransactions });
        
        toast.info(`הועברו ${oldTransactions.length} עסקאות ישנות לארכיון`, {
          description: `עסקאות לפני ${cutoffDate} נשמרו בארכיון והוסרו מהתצוגה הראשית.`
        });
      }
      
      return recentTransactions;
    } catch (error) {
      console.error("שגיאה בארכוב עסקאות ישנות:", error);
      return transactions;
    }
  };

  return {
    saveDataToLocalStorage,
    loadDataFromLocalStorage,
    createDailyBackup,
    removeDuplicateTransactions,
    archiveOldTransactions,
    cleanupOldBackups
  };
};
