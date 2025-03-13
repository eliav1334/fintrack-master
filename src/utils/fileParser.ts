
import { Transaction, FileImportFormat } from "@/types";
import * as XLSX from 'xlsx';

type ParserResult = {
  success: boolean;
  data?: Omit<Transaction, "id">[];
  error?: string;
};

export const parseCSV = async (
  file: File,
  format: FileImportFormat,
  cardFilter?: string[]
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
        const cardNumberIndex = mapping.cardNumber ? headers.indexOf(mapping.cardNumber) : -1;

        // ניתוח שורות
        const data: Omit<Transaction, "id">[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(format.delimiter || ",").map((value) => value.trim());
          if (values.length !== headers.length) continue;

          // אם יש סינון לפי מספר כרטיס אשראי ויש עמודת מספר כרטיס
          if (cardFilter?.length && cardNumberIndex !== -1) {
            const cardNumber = values[cardNumberIndex];
            // בדיקה אם מספר הכרטיס מוכל בפילטר שהוגדר
            if (!cardFilter.some(filter => cardNumber.includes(filter))) {
              // אם מספר הכרטיס לא נמצא ברשימת הפילטר, נדלג על השורה הזו
              continue;
            }
          }

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

          // הוספת מספר כרטיס לעסקה אם קיים
          if (cardNumberIndex !== -1) {
            transaction.cardNumber = values[cardNumberIndex];
          }

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
  format: FileImportFormat,
  cardFilter?: string[]
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
        
        // המרה לנתונים בפורמט JSON עם header: 1 כדי לקבל מערך שורות
        const rawJsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        
        if (rawJsonData.length <= 1) {
          throw new Error("הקובץ ריק או מכיל רק כותרות");
        }
        
        console.log("Raw Excel rows:", rawJsonData.length);
        
        // זיהוי שורת כותרות ראשית - תלוי בפורמט
        let headerRowIndex = 0;
        
        // זיהוי פורמט כרטיס אשראי ישראלי - מחפש אחרי שורות ריקות
        if (format.name === "כרטיס אשראי ישראלי") {
          // לדלג על שורות ריקות ומידע כללי בראש הקובץ
          for (let i = 0; i < rawJsonData.length; i++) {
            const row = rawJsonData[i];
            // שורה שמכילה תאריך או שם בית עסק היא כנראה שורת הכותרות
            if (row && Array.isArray(row) && row.length > 5) {
              const rowStr = row.join(" ").toLowerCase();
              if (rowStr.includes("תאריך") && rowStr.includes("סכום") && rowStr.includes("עסק")) {
                headerRowIndex = i;
                console.log("Found credit card header row at index:", headerRowIndex);
                break;
              }
            }
          }
        }
        
        // חילוץ שורת הכותרות והשורות שלאחריה
        const headers = rawJsonData[headerRowIndex] || [];
        const jsonData = rawJsonData.slice(headerRowIndex + 1);
        
        console.log("Excel Headers:", headers);
        console.log("Using format:", format.name);
        console.log("Format mapping:", format.mapping);
        
        // חיפוש אינדקסים של העמודות הרלוונטיות
        let dateIndex = -1;
        let amountIndex = -1;
        let descriptionIndex = -1;
        let typeIndex = -1;
        let categoryIndex = -1;
        let cardNumberIndex = -1;
        let transactionDateIndex = -1; // אינדקס לתאריך העסקה (בניגוד לתאריך החיוב)

        // התאמה לפורמט כרטיס אשראי ישראלי
        if (format.name === "כרטיס אשראי ישראלי") {
          for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            if (typeof header === 'string') {
              // בדיקת כל עמודה אפשרית
              if (header.includes("תאריך") && header.includes("עסקה")) {
                transactionDateIndex = i; // תאריך העסקה
              } else if (header.includes("תאריך") && header.includes("חיוב")) {
                dateIndex = i; // תאריך החיוב
              } else if (header.includes("שם בית העסק")) {
                descriptionIndex = i;
              } else if (header.includes("סכום") && header.includes("חיוב")) {
                amountIndex = i;
              } else if (header.includes("מספר כרטיס") || header.includes("תשלומים")) {
                // בדרך כלל מספר כרטיס נמצא בעמודת התשלומים בפורמט ישראלי
                cardNumberIndex = i;
              }
            }
          }
          
          // אם לא מצאנו עמודת תאריך חיוב אבל יש תאריך עסקה, נשתמש בתאריך העסקה כברירת מחדל
          if (dateIndex === -1 && transactionDateIndex !== -1) {
            dateIndex = transactionDateIndex;
          }
        } else {
          // התאמה רגילה לפי מיפוי הפורמט
          for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            if (typeof header === 'string') {
              const headerStr = header.toString().trim();
              if (headerStr === format.mapping.date) {
                dateIndex = i;
              } else if (headerStr === format.mapping.amount) {
                amountIndex = i;
              } else if (headerStr === format.mapping.description) {
                descriptionIndex = i;
              } else if (format.mapping.type && headerStr === format.mapping.type) {
                typeIndex = i;
              } else if (format.mapping.category && headerStr === format.mapping.category) {
                categoryIndex = i;
              } else if (format.mapping.cardNumber && headerStr === format.mapping.cardNumber) {
                cardNumberIndex = i;
              }
            }
          }
        }

        console.log("Column indices:", {
          date: dateIndex,
          transactionDate: transactionDateIndex,
          amount: amountIndex,
          description: descriptionIndex,
          type: typeIndex,
          category: categoryIndex,
          cardNumber: cardNumberIndex
        });

        // בדיקת עמודות חובה
        if (dateIndex === -1 || amountIndex === -1 || descriptionIndex === -1) {
          console.error("Missing required columns. Headers:", headers);
          const foundCols = [];
          if (dateIndex !== -1) foundCols.push("תאריך");
          if (amountIndex !== -1) foundCols.push("סכום");
          if (descriptionIndex !== -1) foundCols.push("תיאור");
          
          throw new Error(
            `לא זוהו כל העמודות הנדרשות. נמצאו: ${foundCols.join(", ")}`
          );
        }

        // ניתוח שורות
        const transactions: Omit<Transaction, "id">[] = [];
        
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || !Array.isArray(row) || row.length < Math.max(dateIndex, amountIndex, descriptionIndex) + 1) {
            continue;  // דילוג על שורות חסרות או קצרות מדי
          }
          
          // בדיקה אם השורה ריקה - דילוג על שורות סיכום בסוף דוח כרטיס אשראי
          if (row.every(cell => cell === null || cell === undefined || cell === "")) {
            continue;
          }
          
          let dateValue = row[dateIndex];
          let amountValue = row[amountIndex];
          let descriptionValue = row[descriptionIndex];
          let cardNumberValue = cardNumberIndex !== -1 ? row[cardNumberIndex] : null;
          let transactionDateValue = transactionDateIndex !== -1 ? row[transactionDateIndex] : null;
          
          // דילוג על שורות שאינן מכילות נתוני עסקאות חיוניים
          if (!dateValue && !amountValue && !descriptionValue) {
            continue;
          }

          // אם יש סינון לפי מספר כרטיס אשראי ויש עמודת מספר כרטיס
          if (cardFilter?.length && cardNumberIndex !== -1 && cardNumberValue) {
            // המרה למחרוזת במקרה שמדובר במספר או ערך אחר
            const cardNumberStr = String(cardNumberValue);
            
            // בדיקה אם מספר הכרטיס מוכל בפילטר שהוגדר
            if (!cardFilter.some(filter => cardNumberStr.includes(filter))) {
              // אם מספר הכרטיס לא נמצא ברשימת הפילטר, נדלג על השורה הזו
              continue;
            }
          }
          
          // טיפול בתאריך - עדיפות לתאריך העסקה אם קיים
          let dateStr: string;
          let actualDateValue = transactionDateValue || dateValue; // העדפת תאריך העסקה על פני תאריך החיוב
          
          if (actualDateValue instanceof Date) {
            dateStr = actualDateValue.toISOString().split('T')[0];
          } else if (typeof actualDateValue === 'number') {
            // תאריך אקסל מספרי
            const excelDate = new Date(Math.round((actualDateValue - 25569) * 86400 * 1000));
            dateStr = excelDate.toISOString().split('T')[0];
          } else {
            // טיפול במחרוזת תאריך
            dateStr = String(actualDateValue || '');
            
            // תיקון לפורמט תאריך בכרטיס אשראי ישראלי
            if (format.name === "כרטיס אשראי ישראלי" && typeof actualDateValue === 'string') {
              // נסיון לחלץ תאריך בפורמט DD/MM/YYYY או DD-MM-YYYY
              const dateMatch = actualDateValue.match(/(\d{1,2})[-.\/](\d{1,2})[-.\/](\d{2,4})/);
              if (dateMatch) {
                const day = dateMatch[1].padStart(2, '0');
                const month = dateMatch[2].padStart(2, '0');
                let year = dateMatch[3];
                if (year.length === 2) year = '20' + year;
                dateStr = `${year}-${month}-${day}`;
              }
            } else {
              // ניקוי התאריך (הסרת תווים מיוחדים)
              dateStr = dateStr.replace(/[^\d/.-]/g, '');
              
              // אם התאריך בפורמט עברי (DD/MM/YYYY)
              if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(dateStr)) {
                const parts = dateStr.split('/');
                dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            }
          }

          // טיפול בסכום
          let amount: number;
          
          if (typeof amountValue === 'number') {
            amount = amountValue;
          } else {
            // ניקוי הסכום מתווים מיוחדים
            const amountStr = String(amountValue || '0').replace(/[^\d.-]/g, '');
            amount = parseFloat(amountStr) || 0;
          }
          
          // בכרטיסי אשראי, הסכומים הם בדרך כלל חיוב (הוצאה)
          let type: "income" | "expense" = "expense";
          
          if (format.name === "כרטיס אשראי ישראלי") {
            // אם סכום שלילי בכרטיס אשראי, זה עשוי להיות החזר/זיכוי
            if (amount < 0) {
              type = "income";
              amount = Math.abs(amount);
            }
          } else if (typeIndex >= 0 && format.typeIdentifier) {
            // שימוש במזהה הסוג אם הוגדר בפורמט
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

          const description = String(descriptionValue || '');
          
          // קיצור תיאורים ארוכים מדי
          const truncatedDescription = description.length > 100 
            ? description.substring(0, 97) + '...' 
            : description;

          // הוספת מידע לגבי תאריך העסקה להערות אם קיים תאריך עסקה שונה מתאריך החיוב
          let notes = format.name === "כרטיס אשראי ישראלי" ? "יובא מכרטיס אשראי" : "יובא מקובץ אקסל";
          
          if (transactionDateIndex !== -1 && transactionDateValue && dateValue !== transactionDateValue) {
            let transactionDateStr = "";
            
            if (typeof transactionDateValue === 'string') {
              // ניסיון לפרסר את תאריך העסקה
              const dateMatch = transactionDateValue.match(/(\d{1,2})[-.\/](\d{1,2})[-.\/](\d{2,4})/);
              if (dateMatch) {
                const day = dateMatch[1].padStart(2, '0');
                const month = dateMatch[2].padStart(2, '0');
                let year = dateMatch[3];
                if (year.length === 2) year = '20' + year;
                transactionDateStr = `${day}/${month}/${year}`;
              } else {
                transactionDateStr = transactionDateValue;
              }
            } else if (transactionDateValue instanceof Date) {
              transactionDateStr = transactionDateValue.toLocaleDateString('he-IL');
            }
            
            if (transactionDateStr) {
              notes += ` | תאריך עסקה: ${transactionDateStr}`;
            }
          }

          const transaction: Omit<Transaction, "id"> = {
            date: dateStr,
            amount,
            description: truncatedDescription,
            type,
            categoryId: categoryIndex >= 0 ? String(row[categoryIndex] || '') : "",
            notes
          };

          // הוספת מספר כרטיס לעסקה אם קיים
          if (cardNumberIndex !== -1 && cardNumberValue) {
            transaction.cardNumber = String(cardNumberValue);
          }

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
  format: FileImportFormat,
  cardFilter?: string[]
): Promise<ParserResult> => {
  console.log("Parsing file:", file.name, "type:", file.type, "card filter:", cardFilter);
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
