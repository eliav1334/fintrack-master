
/**
 * פונקציות עזר לאימות נתונים באחסון המקומי
 */

/**
 * פונקציה לאימות נתונים מה-localStorage
 * @param data הנתונים לאימות
 * @returns האם הנתונים תקינים
 */
export const validateStoredData = (data: string | null): boolean => {
  if (!data) return false;
  
  try {
    const parsedData = JSON.parse(data);
    
    // בדיקות בסיסיות
    if (!parsedData || typeof parsedData !== 'object') return false;
    
    // וידוא שמערך העסקאות הוא אכן מערך (אם קיים)
    if (parsedData.transactions && !Array.isArray(parsedData.transactions)) {
      console.error("שגיאה: נתוני עסקאות אינם במבנה מערך");
      return false;
    }
    
    // וידוא שמערך הקטגוריות הוא אכן מערך (אם קיים)
    if (parsedData.categories && !Array.isArray(parsedData.categories)) {
      console.error("שגיאה: נתוני קטגוריות אינם במבנה מערך");
      return false;
    }
    
    // בדיקות נוספות כפי שנדרש
    return true;
  } catch (error) {
    console.error("שגיאה באימות נתונים:", error);
    return false;
  }
};

/**
 * פונקציה לזיהוי כפילויות עסקאות
 * @param transactions מערך העסקאות לבדיקה
 * @returns מספר הכפילויות שזוהו
 */
export const detectDuplicateTransactions = (transactions: any[]): number => {
  if (!Array.isArray(transactions)) return 0;
  
  // מפה לזיהוי כפילויות
  const transactionMap = new Map<string, number>();
  let duplicateCount = 0;
  
  // בדיקת כל עסקה
  transactions.forEach(tx => {
    if (!tx || typeof tx !== 'object' || !tx.date || !tx.amount || !tx.description) {
      return; // דילוג על עסקאות לא תקינות
    }
    
    // יצירת מפתח ייחודי לעסקה
    const key = `${tx.date}_${tx.amount}_${tx.description}_${tx.type || ''}`;
    
    // בדיקה אם כבר יש עסקה כזו
    if (transactionMap.has(key)) {
      duplicateCount++;
      transactionMap.set(key, transactionMap.get(key)! + 1);
    } else {
      transactionMap.set(key, 1);
    }
  });
  
  // לוג מפורט של כפילויות
  if (duplicateCount > 0) {
    console.warn(`נמצאו ${duplicateCount} כפילויות עסקאות`);
    
    // לוג של עסקאות עם יותר מכפילות אחת
    [...transactionMap.entries()]
      .filter(([_, count]) => count > 1)
      .forEach(([key, count]) => {
        console.log(`עסקה כפולה (${count} פעמים): ${key}`);
      });
  }
  
  return duplicateCount;
};
