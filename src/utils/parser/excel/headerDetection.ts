
import { FileImportFormat } from "@/types";

/**
 * זיהוי אוטומטי של שורת כותרות בקובץ אקסל
 */
export const detectHeaderRow = (
  rawJsonData: any[][],
  format: FileImportFormat
): number => {
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
          break;
        }
      }
    }
  }
  
  return headerRowIndex;
};

/**
 * חיפוש אינדקסים של עמודות רלוונטיות
 */
export const findColumnIndices = (
  headers: any[],
  format: FileImportFormat
): Record<string, number> => {
  const indices: Record<string, number> = {
    dateIndex: -1,
    amountIndex: -1,
    descriptionIndex: -1,
    typeIndex: -1,
    categoryIndex: -1,
    cardNumberIndex: -1,
    transactionDateIndex: -1,
    totalAmountIndex: -1,
    installmentNumberIndex: -1,
    totalInstallmentsIndex: -1,
    chargeDateIndex: -1,
    businessCategoryIndex: -1,
    businessIdentifierIndex: -1,
    transactionCodeIndex: -1
  };
  
  // התאמה לפורמט כרטיס אשראי ישראלי
  if (format.name === "כרטיס אשראי ישראלי" || format.name.includes("אשראי")) {
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (typeof header === 'string') {
        const headerLower = header.toLowerCase();
        // בדיקת כל עמודה אפשרית
        if (headerLower.includes("תאריך") && headerLower.includes("עסקה")) {
          indices.transactionDateIndex = i; // תאריך העסקה
        } else if (headerLower.includes("תאריך") && headerLower.includes("חיוב")) {
          indices.dateIndex = i; // תאריך החיוב
          indices.chargeDateIndex = i;
        } else if (headerLower.includes("שם בית") || headerLower.includes("תיאור")) {
          indices.descriptionIndex = i;
        } else if (headerLower.includes("סכום") && headerLower.includes("חיוב")) {
          indices.amountIndex = i;
        } else if (headerLower.includes("סכום") && headerLower.includes("עסקה")) {
          indices.totalAmountIndex = i; // סכום העסקה המקורי
        } else if (headerLower.includes("מספר כרטיס") || headerLower.includes("כרטיס")) {
          indices.cardNumberIndex = i;
        } else if (headerLower.includes("תשלום") && headerLower.includes("מספר")) {
          indices.installmentNumberIndex = i;
        } else if (headerLower.includes("תשלומים") && headerLower.includes("סך")) {
          indices.totalInstallmentsIndex = i;
        } else if (headerLower.includes("קטגוריה") || headerLower.includes("קבוצה")) {
          indices.businessCategoryIndex = i;
        } else if (headerLower.includes("מזהה עסקה") || headerLower.includes("קוד")) {
          indices.transactionCodeIndex = i;
        } else if (headerLower.includes("מספר ספק") || headerLower.includes("מזהה עסק")) {
          indices.businessIdentifierIndex = i;
        }
      }
    }
    
    // אם לא מצאנו עמודת תאריך חיוב אבל יש תאריך עסקה, נשתמש בתאריך העסקה כברירת מחדל
    if (indices.dateIndex === -1 && indices.transactionDateIndex !== -1) {
      indices.dateIndex = indices.transactionDateIndex;
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
            case "date": indices.dateIndex = i; break;
            case "amount": indices.amountIndex = i; break;
            case "description": indices.descriptionIndex = i; break;
            case "type": indices.typeIndex = i; break;
            case "category": indices.categoryIndex = i; break;
            case "cardNumber": indices.cardNumberIndex = i; break;
            case "originalTransactionDate": indices.transactionDateIndex = i; break;
            case "totalAmount": indices.totalAmountIndex = i; break;
            case "installmentNumber": indices.installmentNumberIndex = i; break;
            case "totalInstallments": indices.totalInstallmentsIndex = i; break;
            case "chargeDate": indices.chargeDateIndex = i; break;
            case "businessCategory": indices.businessCategoryIndex = i; break;
            case "businessIdentifier": indices.businessIdentifierIndex = i; break;
            case "transactionCode": indices.transactionCodeIndex = i; break;
          }
        }
      });
    }
  }
  
  return indices;
};
