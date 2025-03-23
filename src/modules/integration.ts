
/**
 * מודול אינטגרציה - מקשר בין מודול הליבה לפיצ'רים
 * 
 * קובץ זה מספק את הממשקים הדרושים לאינטגרציה בין המודולים
 * וישמש לחיבור המודולים השונים במקום אחד לניהול הקוד והתלויות
 */

// ייצוא מודול הליבה
export * from './core';

// ייצוא מודול הפיצ'רים
export * from './features';

// ייצוא מודול ממשק ניקוי
export * from './features/cleanup';

// ייצוא מודול דוחות
export * from './features/reports';

// ייצוא מודול איפוס
export * from './reset';

/**
 * פונקציה להפעלת האפליקציה המלאה
 */
export const initializeApp = () => {
  console.log("מערכת מאותחלת - מודולים מחוברים");
  
  // כאן ניתן לבצע פעולות אתחול נוספות
  return {
    isReady: true,
    timestamp: new Date().toISOString()
  };
};
