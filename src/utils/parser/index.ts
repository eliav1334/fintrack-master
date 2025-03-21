
import { Transaction, FileImportFormat } from "@/types";
import { ParserResult } from "./types";
import { detectFileType } from "./utils";
import { parseCSV } from "./csv";
import { parseExcel } from "./excel";

/**
 * מנתח קובץ באמצעות הפרסר המתאים לפי סוג הקובץ
 */
export const parseFile = async (
  file: File,
  format: FileImportFormat,
  cardFilter?: string[]
): Promise<ParserResult> => {
  console.log("Parsing file:", file.name, "type:", file.type, "card filter:", cardFilter);
  
  // בדיקה אם ייבוא נתונים חסום, אבל גם בודק אם יש override
  const isBlocked = localStorage.getItem("data_import_blocked") === "true";
  const overrideTime = localStorage.getItem("import_override_time");
  
  if (isBlocked && (!overrideTime || isOverrideExpired(overrideTime))) {
    console.warn("ייבוא נתונים חסום - המערכת באיפוס או שיש יותר מדי נתונים");
    return {
      success: false,
      error: "ייבוא נתונים חסום. המערכת עברה איפוס לאחרונה או שיש יותר מדי נתונים. נסה שוב מאוחר יותר.",
    };
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
  
  // בדיקת מגבלת ייבוא על פי מספר עסקאות קיימות
  const currentData = localStorage.getItem("financeState");
  if (currentData) {
    try {
      const parsedData = JSON.parse(currentData);
      const transactionsCount = parsedData.transactions?.length || 0;
      
      // אם יש יותר מ-10,000 עסקאות, חוסמים ייבוא נוסף אלא אם כן יש override
      if (transactionsCount > 10000 && (!overrideTime || isOverrideExpired(overrideTime))) {
        console.warn("יותר מדי עסקאות במערכת:", transactionsCount);
        localStorage.setItem("data_import_blocked", "true");
        return {
          success: false,
          error: "יש יותר מדי עסקאות במערכת. אנא מחק חלק מהעסקאות או אפס את המערכת לפני ייבוא נוסף.",
        };
      }
    } catch (error) {
      console.error("שגיאה בבדיקת מספר העסקאות:", error);
    }
  }
  
  // אם הגענו לכאן, מחקנו את ה-override
  if (overrideTime) {
    localStorage.removeItem("import_override_time");
  }
  
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

/**
 * בודק אם ה-override פג תוקף (אחרי שעתיים)
 */
function isOverrideExpired(overrideTime: string): boolean {
  const overrideTimestamp = parseInt(overrideTime);
  const currentTime = new Date().getTime();
  const hoursSinceOverride = (currentTime - overrideTimestamp) / (1000 * 60 * 60);
  
  // אם עברו יותר משעתיים מאז ה-override, הוא פג תוקף
  return hoursSinceOverride > 2;
}

// Export everything to maintain compatibility with existing code
export * from "./types";
export * from "./utils";
export * from "./csv";
export * from "./excel";
