
import { Transaction, FileImportFormat } from "@/types";
import * as XLSX from 'xlsx';

type ParserResult = {
  success: boolean;
  data?: Omit<Transaction, "id">[];
  error?: string;
  sheets?: string[]; // שמות הגליונות הזמינים
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
        
        // אינדקסים לשדות תשלומים
        const totalAmountIndex = mapping.totalAmount ? headers.indexOf(mapping.totalAmount) : -1;
        const installmentNumberIndex = mapping.installmentNumber ? headers.indexOf(mapping.installmentNumber) : -1;
        const totalInstallmentsIndex = mapping.totalInstallments ? headers.indexOf(mapping.totalInstallments) : -1;
        const originalTransactionDateIndex = mapping.originalTransactionDate ? headers.indexOf(mapping.originalTransactionDate) : -1;
        const chargeDateIndex = mapping.chargeDate ? headers.indexOf(mapping.chargeDate) : -1;
        const transactionCodeIndex = mapping.transactionCode ? headers.indexOf(mapping.transactionCode) : -1;
        const businessCategoryIndex = mapping.businessCategory ? headers.indexOf(mapping.businessCategory) : -1;
        const businessIdentifierIndex = mapping.businessIdentifier ? headers.indexOf(mapping.businessIdentifier) : -1;

        // ניתוח שורות
        const data: Omit<Transaction, "id">[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(format.delimiter || ",").map((value) => value.trim());
          if (values.length !== headers.length) continue;

          // אם יש סינון לפי מספר כרטיס אשראי ויש עמודת מספר כרטיס
          if (cardFilter?.length && cardNumberIndex !== -1) {
            const cardNumber = values[cardNumberIndex];
            // בדיקה אם מספר הכרטיס מוכל בפילטר שהוגדר
            if (!cardFilter.some(filter => cardNumber?.includes(filter))) {
              // אם מספר הכרטיס לא נמצא ברשימת הפילטר, נדלג על השורה הזו
              continue;
            }
          }

          let amount = parseFloat(values[amountIndex]?.replace(/[^\d.-]/g, "") || "0");
          
          // קביעת סוג העסקה
          let type: "income" | "expense";
          if (typeIndex >= 0 && format.typeIdentifier) {
            const typeValue = values[typeIndex]?.toLowerCase() || "";
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

          // זיהוי תשלומים מהתיאור
          let isInstallment = false;
          let installmentDetails = null;
          
          // בדיקה אם קיימים שדות תשלומים ייעודיים
          if (totalAmountIndex !== -1 || installmentNumberIndex !== -1 || totalInstallmentsIndex !== -1) {
            const totalAmount = totalAmountIndex !== -1 ? parseFloat(values[totalAmountIndex]?.replace(/[^\d.-]/g, "") || "0") : 0;
            const installmentNumber = installmentNumberIndex !== -1 ? parseInt(values[installmentNumberIndex]?.replace(/[^\d]/g, "") || "0") : 0;
            const totalInstallments = totalInstallmentsIndex !== -1 ? parseInt(values[totalInstallmentsIndex]?.replace(/[^\d]/g, "") || "0") : 0;
            
            if (totalInstallments > 1 || (totalAmount > 0 && totalAmount !== amount)) {
              isInstallment = true;
              installmentDetails = {
                totalAmount: totalAmount > 0 ? totalAmount : amount * totalInstallments,
                currentInstallment: amount,
                totalInstallments: totalInstallments || 1,
                installmentNumber: installmentNumber || 1,
                originalTransactionDate: originalTransactionDateIndex !== -1 ? values[originalTransactionDateIndex] : values[dateIndex],
                installmentDate: chargeDateIndex !== -1 ? values[chargeDateIndex] : values[dateIndex],
                remainingAmount: totalAmount - (amount * installmentNumber)
              };
            }
          } else if (format.installmentIdentifier?.enabled && format.installmentIdentifier.pattern.length > 0) {
            // זיהוי תשלומים לפי תבנית טקסט בתיאור
            const description = values[descriptionIndex];
            for (const pattern of format.installmentIdentifier.pattern) {
              if (description.includes(pattern)) {
                // ניסיון לחלץ מספרי תשלומים מהתיאור
                const regex = /תשלום\s+(\d+)\s+מ-?\s*(\d+)/i;
                const match = description.match(regex);
                
                if (match) {
                  const currentInstallment = parseInt(match[1]);
                  const totalInstallments = parseInt(match[2]);
                  
                  if (totalInstallments > 1) {
                    isInstallment = true;
                    installmentDetails = {
                      totalAmount: amount * totalInstallments,  // הערכה לפי הכפלה
                      currentInstallment: amount,
                      totalInstallments: totalInstallments,
                      installmentNumber: currentInstallment,
                      installmentDate: values[dateIndex],
                      originalTransactionDate: values[dateIndex] // אין לנו את התאריך המקורי
                    };
                  }
                }
                break;
              }
            }
          }

          const transaction: Omit<Transaction, "id"> = {
            date: values[dateIndex],
            amount,
            description: values[descriptionIndex],
            type,
            categoryId: categoryIndex >= 0 ? values[categoryIndex] || "" : "",
            notes: "יובא מקובץ"
          };

          // הוספת מספר כרטיס לעסקה אם קיים
          if (cardNumberIndex !== -1 && values[cardNumberIndex]) {
            transaction.cardNumber = values[cardNumberIndex];
          }
          
          // הוספת פרטי תשלומים אם קיימים
          if (isInstallment && installmentDetails) {
            transaction.isInstallment = true;
            transaction.installmentDetails = installmentDetails;
            
            // הוספת מידע לשדה הערות
            transaction.notes = `יובא מקובץ | תשלום ${installmentDetails.installmentNumber} מתוך ${installmentDetails.totalInstallments}`;
          }
          
          // הוספת מידע נוסף אם קיים
          if (transactionCodeIndex !== -1 && values[transactionCodeIndex]) {
            transaction.transactionCode = values[transactionCodeIndex];
          }
          
          if (businessCategoryIndex !== -1 && values[businessCategoryIndex]) {
            transaction.businessCategory = values[businessCategoryIndex];
          }
          
          if (businessIdentifierIndex !== -1 && values[businessIdentifierIndex]) {
            transaction.businessIdentifier = values[businessIdentifierIndex];
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
            
            for (const sheetName of availableSheets) {
              const sheetData = await parseExcelSheet(workbook, sheetName, format, cardFilter);
              if (sheetData.success && sheetData.data) {
                allData.push(...sheetData.data);
              }
            }
            
            resolve({ 
              success: true, 
              data: allData,
              sheets: availableSheets 
            });
            return;
          } 
          else if (format.sheetSelection.type === "specific" && format.sheetSelection.names) {
            // נפרסר רק את הגליונות שנבחרו
            const specificData: Omit<Transaction, "id">[] = [];
            
            for (const sheetName of format.sheetSelection.names) {
              if (availableSheets.includes(sheetName)) {
                const sheetData = await parseExcelSheet(workbook, sheetName, format, cardFilter);
                if (sheetData.success && sheetData.data) {
                  specificData.push(...sheetData.data);
                }
              }
            }
            
            resolve({ 
              success: true, 
              data: specificData,
              sheets: availableSheets 
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

// פונקציה לפרסור גליון אקסל בודד
const parseExcelSheet = async (
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
      
      // זיהוי פורמט כרטיס אשראי ישראלי - מחפש שורת כותרות
      if (format.name === "כרטיס אשראי ישראלי" || format.name.includes("אשראי")) {
        // לדלג על שורות ריקות ומידע כללי בראש הקובץ
        for (let i = 0; i < rawJsonData.length; i++) {
          const row = rawJsonData[i];
          // שורה שמכילה תאריך או שם בית עסק היא כנראה שורת הכותרות
          if (row && Array.isArray(row) && row.length > 5) {
            const rowStr = row.join(" ").toLowerCase();
            if ((rowStr.includes("תאריך") || rowStr.includes("שם בית")) && 
                (rowStr.includes("סכום") || rowStr.includes("חיוב"))) {
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
      
      console.log("Excel Headers for sheet", sheetName, ":", headers);
      console.log("Using format:", format.name);
      
      // חיפוש אינדקסים של העמודות הרלוונטיות
      let dateIndex = -1;
      let amountIndex = -1;
      let descriptionIndex = -1;
      let typeIndex = -1;
      let categoryIndex = -1;
      let cardNumberIndex = -1;
      let transactionDateIndex = -1; // אינדקס לתאריך העסקה (בניגוד לתאריך החיוב)
      
      // אינדקסים נוספים לשדות תשלומים ומידע נוסף
      let totalAmountIndex = -1;
      let installmentNumberIndex = -1;
      let totalInstallmentsIndex = -1;
      let chargeDateIndex = -1;
      let businessCategoryIndex = -1;
      let businessIdentifierIndex = -1;
      let transactionCodeIndex = -1;

      // התאמה לפורמט כרטיס אשראי ישראלי
      if (format.name === "כרטיס אשראי ישראלי" || format.name.includes("אשראי")) {
        for (let i = 0; i < headers.length; i++) {
          const header = headers[i];
          if (typeof header === 'string') {
            const headerLower = header.toLowerCase();
            // בדיקת כל עמודה אפשרית
            if (headerLower.includes("תאריך") && headerLower.includes("עסקה")) {
              transactionDateIndex = i; // תאריך העסקה
            } else if (headerLower.includes("תאריך") && headerLower.includes("חיוב")) {
              dateIndex = i; // תאריך החיוב
              chargeDateIndex = i;
            } else if (headerLower.includes("שם בית") || headerLower.includes("תיאור")) {
              descriptionIndex = i;
            } else if (headerLower.includes("סכום") && headerLower.includes("חיוב")) {
              amountIndex = i;
            } else if (headerLower.includes("סכום") && headerLower.includes("עסקה")) {
              totalAmountIndex = i; // סכום העסקה המקורי
            } else if (headerLower.includes("מספר כרטיס") || headerLower.includes("כרטיס")) {
              cardNumberIndex = i;
            } else if (headerLower.includes("תשלום") && headerLower.includes("מספר")) {
              installmentNumberIndex = i;
            } else if (headerLower.includes("תשלומים") && headerLower.includes("סך")) {
              totalInstallmentsIndex = i;
            } else if (headerLower.includes("קטגוריה") || headerLower.includes("קבוצה")) {
              businessCategoryIndex = i;
            } else if (headerLower.includes("מזהה עסקה") || headerLower.includes("קוד")) {
              transactionCodeIndex = i;
            } else if (headerLower.includes("מספר ספק") || headerLower.includes("מזהה עסק")) {
              businessIdentifierIndex = i;
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
          if (!header) continue;
          
          // המרה למחרוזת עבור השוואה
          const headerStr = String(header).trim().toLowerCase();
          const mapping = format.mapping;
          
          Object.entries(mapping).forEach(([key, value]) => {
            if (!value) return;
            
            const valueStr = String(value).trim().toLowerCase();
            if (headerStr === valueStr || headerStr.includes(valueStr)) {
              switch (key) {
                case "date": dateIndex = i; break;
                case "amount": amountIndex = i; break;
                case "description": descriptionIndex = i; break;
                case "type": typeIndex = i; break;
                case "category": categoryIndex = i; break;
                case "cardNumber": cardNumberIndex = i; break;
                case "originalTransactionDate": transactionDateIndex = i; break;
                case "totalAmount": totalAmountIndex = i; break;
                case "installmentNumber": installmentNumberIndex = i; break;
                case "totalInstallments": totalInstallmentsIndex = i; break;
                case "chargeDate": chargeDateIndex = i; break;
                case "businessCategory": businessCategoryIndex = i; break;
                case "businessIdentifier": businessIdentifierIndex = i; break;
                case "transactionCode": transactionCodeIndex = i; break;
              }
            }
          });
        }
      }

      // בדיקת עמודות חובה
      if (dateIndex === -1 || amountIndex === -1 || descriptionIndex === -1) {
        console.error("Missing required columns in sheet", sheetName, ". Headers:", headers);
        const foundCols = [];
        if (dateIndex !== -1) foundCols.push("תאריך");
        if (amountIndex !== -1) foundCols.push("סכום");
        if (descriptionIndex !== -1) foundCols.push("תיאור");
        
        resolve({
          success: false,
          error: `לא זוהו כל העמודות הנדרשות בגליון ${sheetName}. נמצאו: ${foundCols.join(", ")}`
        });
        return;
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
        
        // שדות תשלומים
        let totalAmountValue = totalAmountIndex !== -1 ? row[totalAmountIndex] : null;
        let installmentNumberValue = installmentNumberIndex !== -1 ? row[installmentNumberIndex] : null;
        let totalInstallmentsValue = totalInstallmentsIndex !== -1 ? row[totalInstallmentsIndex] : null;
        
        // שדות נוספים
        let businessCategoryValue = businessCategoryIndex !== -1 ? row[businessCategoryIndex] : null;
        let businessIdentifierValue = businessIdentifierIndex !== -1 ? row[businessIdentifierIndex] : null;
        let transactionCodeValue = transactionCodeIndex !== -1 ? row[transactionCodeIndex] : null;
        
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
        let actualDateValue = dateValue; // ברירת מחדל - תאריך חיוב
        
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
          if ((format.name === "כרטיס אשראי ישראלי" || format.name.includes("אשראי")) && 
              typeof actualDateValue === 'string') {
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
        
        // מיפוי תאריך העסקה המקורי
        let originalTransactionDateStr = "";
        if (transactionDateValue) {
          if (transactionDateValue instanceof Date) {
            originalTransactionDateStr = transactionDateValue.toISOString().split('T')[0];
          } else if (typeof transactionDateValue === 'number') {
            const excelDate = new Date(Math.round((transactionDateValue - 25569) * 86400 * 1000));
            originalTransactionDateStr = excelDate.toISOString().split('T')[0];
          } else {
            originalTransactionDateStr = String(transactionDateValue);
            
            // נסיון לחלץ תאריך בפורמט DD/MM/YYYY או DD-MM-YYYY
            const dateMatch = originalTransactionDateStr.match(/(\d{1,2})[-.\/](\d{1,2})[-.\/](\d{2,4})/);
            if (dateMatch) {
              const day = dateMatch[1].padStart(2, '0');
              const month = dateMatch[2].padStart(2, '0');
              let year = dateMatch[3];
              if (year.length === 2) year = '20' + year;
              originalTransactionDateStr = `${year}-${month}-${day}`;
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
        
        // טיפול בסכום המקורי של העסקה (לפני תשלומים)
        let totalAmount: number = 0;
        if (totalAmountValue) {
          if (typeof totalAmountValue === 'number') {
            totalAmount = totalAmountValue;
          } else {
            const totalAmountStr = String(totalAmountValue || '0').replace(/[^\d.-]/g, '');
            totalAmount = parseFloat(totalAmountStr) || 0;
          }
        }
        
        // זיהוי מספר תשלומים ותשלום נוכחי
        let installmentNumber = 0;
        let totalInstallments = 0;
        
        if (installmentNumberValue) {
          const installmentStr = String(installmentNumberValue).replace(/[^\d]/g, '');
          installmentNumber = parseInt(installmentStr) || 0;
        }
        
        if (totalInstallmentsValue) {
          const totalInstallmentsStr = String(totalInstallmentsValue).replace(/[^\d]/g, '');
          totalInstallments = parseInt(totalInstallmentsStr) || 0;
        } else if (format.installmentIdentifier?.enabled) {
          // ניסיון לזהות תשלומים מהתיאור
          const description = String(descriptionValue || '');
          
          // חיפוש תבניות כמו "תשלום 2 מ-6" או "2/6"
          const regex1 = /תשלום\s+(\d+)\s+מ-?\s*(\d+)/i;
          const regex2 = /(\d+)\/(\d+)\s+תשלומים/i;
          
          let match = description.match(regex1);
          if (!match) match = description.match(regex2);
          
          if (match) {
            installmentNumber = parseInt(match[1]) || 0;
            totalInstallments = parseInt(match[2]) || 0;
          }
        }
        
        // בכרטיסי אשראי, הסכומים הם בדרך כלל חיוב (הוצאה)
        let type: "income" | "expense" = "expense";
        
        if (format.name === "כרטיס אשראי ישראלי" || format.name.includes("אשראי")) {
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
        let notes = "";
        
        if (format.name === "כרטיס אשראי ישראלי" || format.name.includes("אשראי")) {
          notes = "יובא מכרטיס אשראי";
        } else {
          notes = `יובא מקובץ אקסל - גליון: ${sheetName}`;
        }
        
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
        
        // הוספת מידע על תשלומים אם קיים
        if (totalInstallments > 1 && installmentNumber > 0) {
          notes += ` | תשלום ${installmentNumber} מתוך ${totalInstallments}`;
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
        
        // הוספת פרטי תשלומים אם קיימים
        if (totalInstallments > 1 && installmentNumber > 0) {
          transaction.isInstallment = true;
          transaction.installmentDetails = {
            totalAmount: totalAmount > 0 ? totalAmount : amount * totalInstallments,
            currentInstallment: amount,
            totalInstallments,
            installmentNumber,
            originalTransactionDate: originalTransactionDateStr || dateStr,
            installmentDate: dateStr
          };
          
          // חישוב הסכום הנותר לתשלום
          if (totalAmount > 0) {
            const alreadyPaid = amount * (installmentNumber - 1);
            const remaining = totalAmount - alreadyPaid - amount;
            transaction.installmentDetails.remainingAmount = remaining > 0 ? remaining : 0;
          }
        }
        
        // הוספת מידע נוסף אם קיים
        if (transactionCodeIndex !== -1 && transactionCodeValue) {
          transaction.transactionCode = String(transactionCodeValue);
        }
        
        if (businessCategoryIndex !== -1 && businessCategoryValue) {
          transaction.businessCategory = String(businessCategoryValue);
        }
        
        if (businessIdentifierIndex !== -1 && businessIdentifierValue) {
          transaction.businessIdentifier = String(businessIdentifierValue);
        }
        
        if (totalAmount > 0 && totalAmount !== amount) {
          transaction.originalAmount = totalAmount;
        }

        transactions.push(transaction);
      }

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
