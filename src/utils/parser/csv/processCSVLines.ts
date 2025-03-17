
import { Transaction, FileImportFormat } from "@/types";
import { ParserResult } from "../types";
import { detectTransactionType } from "./typeDetection";
import { detectInstallments } from "./installmentDetection";

/**
 * עיבוד שורות CSV לעסקאות
 */
export const processCSVLines = (
  lines: string[],
  headers: string[],
  format: FileImportFormat,
  cardFilter?: string[]
): ParserResult => {
  try {
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
      
      // קביעת סוג העסקה בהתאם לסוג הקובץ
      const isCreditCardFile = format.name.includes("אשראי") || format.creditCardFormat === true;
      
      let typeIdentifier = format.typeIdentifier;
      if (isCreditCardFile && typeIdentifier) {
        typeIdentifier = {
          ...typeIdentifier,
          creditCardLogic: true
        };
      } else if (isCreditCardFile) {
        typeIdentifier = {
          incomeValues: ["זיכוי", "החזר"],
          expenseValues: ["חיוב", "רכישה"],
          creditCardLogic: true
        };
      }
      
      // שימוש בפונקציה המשופרת לזיהוי סוג העסקה
      const { type, amount: adjustedAmount } = detectTransactionType(
        amount, 
        typeIndex >= 0 ? values[typeIndex] : undefined, 
        typeIdentifier
      );
      amount = adjustedAmount;

      // יצירת עסקה בסיסית
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
      
      // זיהוי תשלומים מהתיאור וחילוץ פרטיהם
      const installmentInfo = detectInstallments({
        description: values[descriptionIndex],
        totalAmountValue: totalAmountIndex !== -1 ? values[totalAmountIndex] : undefined,
        installmentNumberValue: installmentNumberIndex !== -1 ? values[installmentNumberIndex] : undefined,
        totalInstallmentsValue: totalInstallmentsIndex !== -1 ? values[totalInstallmentsIndex] : undefined,
        originalTransactionDateValue: originalTransactionDateIndex !== -1 ? values[originalTransactionDateIndex] : undefined,
        chargeDateValue: chargeDateIndex !== -1 ? values[chargeDateIndex] : undefined,
        currentAmount: amount,
        installmentIdentifier: format.installmentIdentifier,
        defaultDate: values[dateIndex]
      });
      
      // הוספת פרטי תשלומים אם קיימים
      if (installmentInfo.isInstallment && installmentInfo.details) {
        transaction.isInstallment = true;
        transaction.installmentDetails = installmentInfo.details;
        transaction.notes = `יובא מקובץ | תשלום ${installmentInfo.details.installmentNumber} מתוך ${installmentInfo.details.totalInstallments}`;
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

    return { success: true, data };
  } catch (error) {
    console.error("Error processing CSV lines:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "שגיאה בעיבוד נתוני CSV",
    };
  }
};
