
import { Transaction, FileImportFormat } from "@/types";
import { ParserResult } from "../types";
import * as XLSX from 'xlsx';
import { detectHeaderRow } from './headerDetection';
import { extractTransactionsFromSheet } from './transactionExtractor';

/**
 * פונקציה לפרסור גליון אקסל בודד
 */
export const parseExcelSheet = async (
  workbook: XLSX.WorkBook,
  sheetName: string,
  format: FileImportFormat,
  cardFilter?: string[]
): Promise<ParserResult> => {
  return new Promise((resolve) => {
    try {
      const worksheet = workbook.Sheets[sheetName];
      
      // המרה לנתונים בפורמט JSON עם header: 1 כדי לקבל מערך שורות
      const rawJsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
      
      if (rawJsonData.length <= 1) {
        resolve({ success: true, data: [] }); // גליון ריק
        return;
      }
      
      console.log(`Sheet ${sheetName} rows:`, rawJsonData.length);
      
      // זיהוי שורת כותרות ראשית - תלוי בפורמט
      let headerRowIndex = format.headerRowIndex !== undefined ? format.headerRowIndex : 0;
      
      // זיהוי אוטומטי של שורת הכותרות אם רלוונטי
      if (format.name === "כרטיס אשראי ישראלי" || format.name.includes("אשראי")) {
        headerRowIndex = detectHeaderRow(rawJsonData, format);
        console.log("Found credit card header row at index:", headerRowIndex);
      }
      
      // חילוץ שורת הכותרות והשורות שלאחריה
      const headers = rawJsonData[headerRowIndex] || [];
      const jsonData = rawJsonData.slice(headerRowIndex + 1);
      
      console.log("Excel Headers for sheet", sheetName, ":", headers);
      console.log("Using format:", format.name);
      
      // חילוץ העסקאות מהנתונים
      const transactions = extractTransactionsFromSheet(headers, jsonData, format, cardFilter, sheetName);
      
      console.log("Parsed transactions from sheet", sheetName, ":", transactions.length);
      resolve({ success: true, data: transactions });
    } catch (error) {
      console.error("Sheet Parsing Error:", error);
      resolve({
        success: false,
        error: error instanceof Error ? error.message : `שגיאה לא ידועה בניתוח גליון ${sheetName}`,
      });
    }
  });
};
