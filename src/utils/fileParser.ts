
import { Transaction, FileImportFormat } from "@/types";
import * as XLSX from 'xlsx';

type ParserResult = {
  success: boolean;
  data?: Omit<Transaction, "id">[];
  error?: string;
};

export const parseCSV = async (
  file: File,
  format: FileImportFormat
): Promise<ParserResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error("נכשלה קריאת הקובץ");
        }

        const csv = event.target.result as string;
        const lines = csv.split("\n").filter((line) => line.trim() !== "");
        const headers = lines[0].split(format.delimiter || ",").map((header) => header.trim());

        console.log("CSV Headers:", headers);
        console.log("Format mapping:", format.mapping);

        // אימות קיום עמודות נדרשות
        const requiredColumns = ["amount", "date", "description"];
        const mapping = format.mapping;
        const missingColumns = requiredColumns.filter((col) => {
          const mappedHeader = mapping[col as keyof typeof mapping];
          return mappedHeader && !headers.includes(mappedHeader);
        });

        if (missingColumns.length > 0) {
          throw new Error(
            `עמודות חובה חסרות: ${missingColumns.join(", ")}`
          );
        }

        // קבלת אינדקסים של עמודות
        const dateIndex = headers.indexOf(mapping.date);
        const amountIndex = headers.indexOf(mapping.amount);
        const descriptionIndex = headers.indexOf(mapping.description);
        const typeIndex = mapping.type ? headers.indexOf(mapping.type) : -1;
        const categoryIndex = mapping.category ? headers.indexOf(mapping.category) : -1;

        // ניתוח שורות
        const data: Omit<Transaction, "id">[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(format.delimiter || ",").map((value) => value.trim());
          if (values.length !== headers.length) continue;

          let amount = parseFloat(values[amountIndex].replace(/[^\d.-]/g, ""));
          
          // קביעת סוג העסקה
          let type: "income" | "expense";
          if (typeIndex >= 0 && format.typeIdentifier) {
            const typeValue = values[typeIndex].toLowerCase();
            if (format.typeIdentifier.incomeValues.some(v => typeValue.includes(v.toLowerCase()))) {
              type = "income";
              amount = Math.abs(amount);
            } else if (format.typeIdentifier.expenseValues.some(v => typeValue.includes(v.toLowerCase()))) {
              type = "expense";
              amount = Math.abs(amount);
            } else {
              // התנהגות ברירת מחדל: חיובי = הכנסה, שלילי = הוצאה
              type = amount >= 0 ? "income" : "expense";
              amount = Math.abs(amount);
            }
          } else {
            // התנהגות ברירת מחדל על בסיס סימן הסכום
            type = amount >= 0 ? "income" : "expense";
            amount = Math.abs(amount);
          }

          const transaction: Omit<Transaction, "id"> = {
            date: values[dateIndex],
            amount,
            description: values[descriptionIndex],
            type,
            categoryId: categoryIndex >= 0 ? values[categoryIndex] : "",
            notes: "יובא מקובץ"
          };

          data.push(transaction);
        }

        resolve({ success: true, data });
      } catch (error) {
        console.error("CSV Parsing Error:", error);
        resolve({
          success: false,
          error: error instanceof Error ? error.message : "שגיאה לא ידועה בניתוח הקובץ",
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: "שגיאה בקריאת הקובץ" });
    };

    reader.readAsText(file);
  });
};

export const parseExcel = async (
  file: File,
  format: FileImportFormat
): Promise<ParserResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error("נכשלה קריאת הקובץ");
        }

        // קריאת הקובץ באמצעות XLSX
        const data = new Uint8Array(event.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // בחירת הגיליון הראשון
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        console.log("Excel Workbook sheets:", workbook.SheetNames);
        
        // המרה לנתונים בפורמט JSON
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { header: 1 });
        
        if (jsonData.length <= 1) {
          throw new Error("הקובץ ריק או מכיל רק כותרות");
        }
        
        // קריאת כותרות
        const headers = jsonData[0] as string[];
        console.log("Excel Headers:", headers);
        console.log("Format mapping:", format.mapping);
        
        // התאמה ספציפית לפורמט הקובץ של משתמש זה (אם תזהה שזהו פורמט הבנק הספציפי)
        const isHebrewBankFormat = headers.some(h => 
          h && typeof h === 'string' && (
            h.includes('תאריך') || 
            h.includes('סכום') || 
            h.includes('תיאור')
          )
        );
        
        console.log("Is Hebrew Bank Format:", isHebrewBankFormat);
        
        // אם זיהינו פורמט בנק עברי ספציפי, נתאים את המיפוי
        let adaptedMapping = { ...format.mapping };
        if (isHebrewBankFormat) {
          // חפש כותרות ספציפיות לפורמט העברי
          for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            if (typeof header === 'string') {
              if (header.includes('תאריך') || header.includes('תאריך ערך')) {
                adaptedMapping.date = header;
                console.log("Found date column:", header);
              } else if (header.includes('תיאור') || header.includes('פרטים')) {
                adaptedMapping.description = header;
                console.log("Found description column:", header);
              } else if (header.includes('סכום') || header.includes('חובה') || header.includes('זכות')) {
                adaptedMapping.amount = header;
                console.log("Found amount column:", header);
              }
            }
          }
        }
        
        // בדיקת עמודות חובה
        const requiredColumns = ["amount", "date", "description"];
        const missingColumns = requiredColumns.filter((col) => {
          const mappedHeader = adaptedMapping[col as keyof typeof adaptedMapping];
          return !mappedHeader || !headers.includes(mappedHeader);
        });

        if (missingColumns.length > 0) {
          console.error("Missing columns:", missingColumns, "Available headers:", headers);
          throw new Error(
            `עמודות חובה חסרות או לא זוהו: ${missingColumns.join(", ")}`
          );
        }

        // קבלת אינדקסים של עמודות
        const dateIndex = headers.indexOf(adaptedMapping.date);
        const amountIndex = headers.indexOf(adaptedMapping.amount);
        const descriptionIndex = headers.indexOf(adaptedMapping.description);
        const typeIndex = adaptedMapping.type ? headers.indexOf(adaptedMapping.type) : -1;
        const categoryIndex = adaptedMapping.category ? headers.indexOf(adaptedMapping.category) : -1;

        console.log("Column indices:", {
          date: dateIndex,
          amount: amountIndex,
          description: descriptionIndex,
          type: typeIndex,
          category: categoryIndex
        });

        // ניתוח שורות
        const transactions: Omit<Transaction, "id">[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length < Math.max(dateIndex, amountIndex, descriptionIndex) + 1) {
            continue;  // דילוג על שורות שאינן מכילות מספיק עמודות
          }
          
          // טיפול בתאריך - ניסיון לפרסר פורמטים שונים
          let dateValue = row[dateIndex];
          let dateStr: string;
          
          if (dateValue instanceof Date) {
            dateStr = dateValue.toISOString().split('T')[0];
          } else if (typeof dateValue === 'number') {
            // תאריך אקסל מספרי
            const excelDate = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
            dateStr = excelDate.toISOString().split('T')[0];
          } else {
            // טיפול במחרוזת תאריך
            dateStr = String(dateValue || '');
            
            // ניקוי התאריך (הסרת תווים מיוחדים)
            dateStr = dateStr.replace(/[^\d/.-]/g, '');
            
            // אם התאריך בפורמט עברי (DD/MM/YYYY)
            if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(dateStr)) {
              const parts = dateStr.split('/');
              dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          }

          // טיפול בסכום
          let amountValue = row[amountIndex];
          let amount: number;
          
          if (typeof amountValue === 'number') {
            amount = amountValue;
          } else {
            // ניקוי הסכום מתווים מיוחדים
            const amountStr = String(amountValue || '0').replace(/[^\d.-]/g, '');
            amount = parseFloat(amountStr) || 0;
          }
          
          // קביעת סוג העסקה
          let type: "income" | "expense";
          if (typeIndex >= 0 && format.typeIdentifier) {
            const typeValue = String(row[typeIndex] || '').toLowerCase();
            if (format.typeIdentifier.incomeValues.some(v => typeValue.includes(v.toLowerCase()))) {
              type = "income";
              amount = Math.abs(amount);
            } else if (format.typeIdentifier.expenseValues.some(v => typeValue.includes(v.toLowerCase()))) {
              type = "expense";
              amount = Math.abs(amount);
            } else {
              // התנהגות ברירת מחדל: חיובי = הכנסה, שלילי = הוצאה
              type = amount >= 0 ? "income" : "expense";
              amount = Math.abs(amount);
            }
          } else {
            // התנהגות ברירת מחדל על בסיס סימן הסכום
            type = amount >= 0 ? "income" : "expense";
            amount = Math.abs(amount);
          }

          const description = String(row[descriptionIndex] || '');
          
          // קיצור תיאורים ארוכים מדי
          const truncatedDescription = description.length > 100 
            ? description.substring(0, 97) + '...' 
            : description;

          const transaction: Omit<Transaction, "id"> = {
            date: dateStr,
            amount,
            description: truncatedDescription,
            type,
            categoryId: categoryIndex >= 0 ? String(row[categoryIndex] || '') : "",
            notes: "יובא מקובץ אקסל"
          };

          transactions.push(transaction);
        }

        console.log("Parsed transactions:", transactions.length);
        resolve({ success: true, data: transactions });
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

export const detectFileType = (file: File): "csv" | "excel" | "unknown" => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  console.log("File extension:", extension);
  if (extension === "csv") {
    return "csv";
  } else if (["xls", "xlsx", "xlsb", "xlsm"].includes(extension || "")) {
    return "excel";
  }
  return "unknown";
};

export const parseFile = async (
  file: File,
  format: FileImportFormat
): Promise<ParserResult> => {
  console.log("Parsing file:", file.name, "type:", file.type);
  const fileType = detectFileType(file);
  console.log("Detected file type:", fileType);
  
  switch (fileType) {
    case "csv":
      return parseCSV(file, format);
    case "excel":
      return parseExcel(file, format);
    default:
      return {
        success: false,
        error: "סוג קובץ לא נתמך. אנא השתמש בקבצי CSV או אקסל.",
      };
  }
};
