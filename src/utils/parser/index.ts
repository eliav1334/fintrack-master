
import { Transaction, FileImportFormat } from "@/types";
import { ParserResult } from "./types";
import { detectFileType } from "./utils";
import { parseCSV } from "./csv";
import { parseExcel } from "./excel";
import { validateStoredData, detectDuplicateTransactions } from "@/hooks/finance/storage/dataValidation";

/**
 * מנתח קובץ באמצעות הפרסר המתאים לפי סוג הקובץ
 */
export const parseFile = async (
  file: File,
  format: FileImportFormat,
  cardFilter?: string[]
): Promise<ParserResult> => {
  console.log("Parsing file:", file.name, "type:", file.type, "card filter:", cardFilter);
  
  // בדיקת חסימת ייבוא
  const isBlocked = localStorage.getItem("data_import_blocked") === "true";
  if (isBlocked) {
    const overrideTimeStr = localStorage.getItem("import_override_time");
    
    // אם אין override או שהוא לא תקין, החסימה בתוקף
    if (!overrideTimeStr) {
      console.warn("ייבוא נתונים חסום - אין override");
      return {
        success: false,
        error: "ייבוא נתונים חסום. לחץ על 'אפשר ייבוא נתונים מחדש' כדי להמשיך."
      };
    }
    
    // המרה למספר ובדיקת תקינות
    const overrideTime = parseInt(overrideTimeStr, 10);
    if (isNaN(overrideTime)) {
      console.warn("ייבוא נתונים חסום - override לא תקין", overrideTimeStr);
      return {
        success: false,
        error: "ייבוא נתונים חסום. ערך ה-override אינו תקין."
      };
    }
    
    // בדיקה אם ה-override עדיין בתוקף (48 שעות)
    const currentTime = Date.now();
    const timeDiffHours = (currentTime - overrideTime) / (1000 * 60 * 60);
    
    if (timeDiffHours > 48) {
      console.warn("ייבוא נתונים חסום - override פג תוקף", {
        currentTime,
        overrideTime,
        timeDiffHours
      });
      return {
        success: false,
        error: "ייבוא נתונים חסום. תוקף ההיתר פג לאחר 48 שעות. לחץ על 'אפשר ייבוא נתונים מחדש' כדי להמשיך."
      };
    }
    
    console.log("חסימת ייבוא קיימת אך יש override בתוקף", {
      currentTime,
      overrideTime,
      timeDiffHours,
      remainingHours: 48 - timeDiffHours
    });
  }
  
  // בדיקת גודל הקובץ - הגבלה ל-5MB
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxFileSize) {
    console.warn("הקובץ גדול מדי:", file.size, "מקסימום:", maxFileSize);
    return {
      success: false,
      error: "הקובץ גדול מדי. הגודל המקסימלי המותר הוא 5MB.",
    };
  }
  
  // בדיקת מספר העסקאות הקיימות
  const currentData = localStorage.getItem("financeState");
  if (currentData && validateStoredData(currentData)) {
    try {
      const parsedData = JSON.parse(currentData);
      if (parsedData.transactions && Array.isArray(parsedData.transactions)) {
        const transactionsCount = parsedData.transactions.length;
        
        // בדיקת כפילויות בנתונים קיימים
        const duplicatesCount = detectDuplicateTransactions(parsedData.transactions);
        if (duplicatesCount > 0) {
          console.warn(`נמצאו ${duplicatesCount} כפילויות בנתונים הקיימים`);
        }
        
        // אם יש יותר מ-50,000 עסקאות, חסימת ייבוא
        if (transactionsCount > 50000) {
          localStorage.setItem("data_import_blocked", "true");
          console.error("יותר מדי עסקאות במערכת:", transactionsCount);
          return {
            success: false,
            error: "יש יותר מדי עסקאות במערכת. אנא מחק חלק מהעסקאות או אפס את המערכת לפני ייבוא נוסף.",
          };
        }
        
        // התראה אם מתקרבים למגבלה
        if (transactionsCount > 40000) {
          console.warn("מספר גבוה של עסקאות:", transactionsCount);
        }
      }
    } catch (error) {
      console.error("שגיאה בבדיקת מספר העסקאות:", error);
    }
  }
  
  // הפעלת הפרסר המתאים לפי סוג הקובץ
  const fileType = detectFileType(file);
  console.log("Detected file type:", fileType);
  
  switch (fileType) {
    case "csv":
      return parseCSV(file, format, cardFilter);
    case "excel":
      return parseExcel(file, format, cardFilter);
    default:
      return {
        success: false,
        error: "סוג קובץ לא נתמך. אנא השתמש בקבצי CSV או אקסל.",
      };
  }
};

// Export everything to maintain compatibility with existing code
export * from "./types";
export * from "./utils";
export * from "./csv";
export * from "./excel";
