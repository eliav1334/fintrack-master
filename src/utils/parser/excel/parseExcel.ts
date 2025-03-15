
import { Transaction, FileImportFormat } from "@/types";
import { ParserResult } from "../types";
import * as XLSX from 'xlsx';
import { parseExcelSheet } from './parseExcelSheet';

/**
 * מנתח קובץ אקסל ומייצר עסקאות
 */
export const parseExcel = async (
  file: File,
  format: FileImportFormat,
  cardFilter?: string[]
): Promise<ParserResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        if (!event.target?.result) {
          throw new Error("נכשלה קריאת הקובץ");
        }

        // קריאת הקובץ באמצעות XLSX
        const data = new Uint8Array(event.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        console.log("Excel Workbook sheets:", workbook.SheetNames);
        
        // אם נדרש לבחור גליון ספציפי או להחזיר את רשימת הגליונות הזמינים
        if (format.sheetSupport) {
          const availableSheets = workbook.SheetNames;
          
          // אם נדרש רק להחזיר את רשימת הגליונות
          if (!format.sheetSelection || format.sheetSelection.type === "all") {
            // נפרסר את כל הגליונות
            const allData: Omit<Transaction, "id">[] = [];
            const sheetInfo: { [sheetName: string]: number } = {}; // מספר העסקאות שיובאו מכל גליון
            
            for (const sheetName of availableSheets) {
              const sheetData = await parseExcelSheet(workbook, sheetName, format, cardFilter);
              if (sheetData.success && sheetData.data) {
                // הוספת שם הגליון לכל עסקה
                const transactionsWithSheet = sheetData.data.map(tx => ({
                  ...tx,
                  sheetName: sheetName // הוספת שם הגליון לעסקה
                }));
                allData.push(...transactionsWithSheet);
                sheetInfo[sheetName] = sheetData.data.length;
              }
            }
            
            resolve({ 
              success: true, 
              data: allData,
              sheets: availableSheets,
              sheetInfo: sheetInfo // מידע על מספר העסקאות בכל גליון
            });
            return;
          } 
          else if (format.sheetSelection.type === "specific" && format.sheetSelection.names) {
            // נפרסר רק את הגליונות שנבחרו
            const specificData: Omit<Transaction, "id">[] = [];
            const sheetInfo: { [sheetName: string]: number } = {}; // מספר העסקאות שיובאו מכל גליון
            
            for (const sheetName of format.sheetSelection.names) {
              if (availableSheets.includes(sheetName)) {
                const sheetData = await parseExcelSheet(workbook, sheetName, format, cardFilter);
                if (sheetData.success && sheetData.data) {
                  // הוספת שם הגליון לכל עסקה
                  const transactionsWithSheet = sheetData.data.map(tx => ({
                    ...tx,
                    sheetName: sheetName
                  }));
                  specificData.push(...transactionsWithSheet);
                  sheetInfo[sheetName] = sheetData.data.length;
                }
              }
            }
            
            resolve({ 
              success: true, 
              data: specificData,
              sheets: availableSheets,
              sheetInfo: sheetInfo
            });
            return;
          }
          
          // אם הגענו לכאן, נחזיר את רשימת הגליונות הזמינים בלבד
          resolve({ 
            success: true, 
            data: [],
            sheets: availableSheets 
          });
          return;
        }
        
        // בחירת הגיליון הראשון כברירת מחדל
        const firstSheetName = workbook.SheetNames[0];
        const sheetResult = await parseExcelSheet(workbook, firstSheetName, format, cardFilter);
        
        // הוספת שם הגליון לכל עסק בגליון הראשון
        if (sheetResult.success && sheetResult.data) {
          const dataWithSheet = sheetResult.data.map(tx => ({
            ...tx,
            sheetName: firstSheetName
          }));
          sheetResult.data = dataWithSheet;
        }
        
        resolve(sheetResult);
      } catch (error) {
        console.error("Excel Parsing Error:", error);
        resolve({
          success: false,
          error: error instanceof Error ? error.message : "שגיאה לא ידועה בניתוח קובץ האקסל",
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: "שגיאה בקריאת קובץ האקסל" });
    };

    reader.readAsArrayBuffer(file);
  });
};
