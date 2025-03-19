
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
    console.log(`Processing CSV with ${lines.length} lines for format: ${format.name}`);
    
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
    const processedIds = new Set<string>(); // סט למעקב אחר עסקאות שכבר עובדו

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
      
      let typeIdentifierConfig = format.typeIdentifier;
      if (isCreditCardFile && typeIdentifierConfig) {
        typeIdentifierConfig = {
          ...typeIdentifierConfig,
          creditCardLogic: true
        };
      } else if (isCreditCardFile) {
        typeIdentifierConfig = {
          column: "type",
          incomeValues: ["זיכוי", "החזר"],
          expenseValues: ["חיוב", "רכישה"],
          creditCardLogic: true
        };
      }
      
      // שימוש בפונקציה המשופרת לזיהוי סוג העסקה
      const { type, amount: adjustedAmount } = detectTransactionType(
        amount, 
        typeIndex >= 0 ? values[typeIndex] : undefined, 
        typeIdentifierConfig
      );
      amount = adjustedAmount;

      // יצירת עסקה בסיסית
      const transaction: Omit<Transaction, "id"> = {
        date: values[dateIndex],
        amount,
        description: values[descriptionIndex],
        type,
        categoryId: categoryIndex >= 0 ? values[categoryIndex] || "" : "",
        notes: "יובא מקובץ",
        createdAt: new Date().toISOString()
      };

      // יצירת מזהה ייחודי מורחב לבדיקת כפילויות
      let uniqueId = `${transaction.date}_${transaction.amount}_${transaction.description}`;
      
      // הוספת נתונים נוספים למזהה אם קיימים
      if (transactionCodeIndex !== -1 && values[transactionCodeIndex]) {
        uniqueId += `_${values[transactionCodeIndex]}`;
        transaction.transactionCode = values[transactionCodeIndex];
      }
      
      if (cardNumberIndex !== -1 && values[cardNumberIndex]) {
        uniqueId += `_${values[cardNumberIndex]}`;
        transaction.cardNumber = values[cardNumberIndex];
      }
      
      // בדיקה כפולה - גם לפי מזהה ייחודי וגם לפי שילוב של תאריך + סכום + תיאור
      const simpleId = `${transaction.date}_${transaction.amount}_${transaction.description}`;
      
      if (processedIds.has(uniqueId) || processedIds.has(simpleId)) {
        console.log(`Skipping duplicate CSV transaction: ${transaction.description} (${transaction.date}, ${transaction.amount})`);
        continue;
      }
      
      // שמירת המזהים לצורך בדיקת כפילויות
      processedIds.add(uniqueId);
      processedIds.add(simpleId);
      
      // זיהוי תשלומים מהתיאור וחילוץ פרטיהם
      const installmentInfo = detectInstallments({
        description: values[descriptionIndex],
        totalAmountValue: totalAmountIndex !== -1 ? values[totalAmountIndex] : undefined,
        installmentNumberValue: installmentNumberIndex !== -1 ? values[installmentNumberIndex] : undefined,
        totalInstallmentsValue: totalInstallmentsIndex !== -1 ? values[totalInstallmentsIndex] : undefined,
        originalTransactionDateValue: originalTransactionDateIndex !== -1 ? values[originalTransactionDateIndex] : undefined,
        chargeDateValue: chargeDateIndex !== -1 ? values[chargeDateIndex] : undefined,
        currentAmount: amount,
        installmentIdentifier: format.installmentIdentifier ? {
          enabled: true,
          pattern: [format.installmentIdentifier.pattern]
        } : undefined,
        defaultDate: values[dateIndex]
      });
      
      // הוספת פרטי תשלומים אם קיימים
      if (installmentInfo.isInstallment && installmentInfo.details) {
        transaction.isInstallment = true;
        transaction.installmentDetails = installmentInfo.details;
        transaction.notes = `יובא מקובץ | תשלום ${installmentInfo.details.installmentNumber} מתוך ${installmentInfo.details.totalInstallments}`;
        
        // עדכון המזהה הייחודי כך שיכלול מידע על תשלומים
        const installmentUniqueId = `${uniqueId}_${installmentInfo.details.installmentNumber}_${installmentInfo.details.totalInstallments}`;
        processedIds.add(installmentUniqueId);
      }
      
      // הוספת מידע נוסף אם קיים
      if (businessCategoryIndex !== -1 && values[businessCategoryIndex]) {
        transaction.businessCategory = values[businessCategoryIndex];
      }
      
      if (businessIdentifierIndex !== -1 && values[businessIdentifierIndex]) {
        transaction.businessIdentifier = values[businessIdentifierIndex];
      }

      data.push(transaction);
    }

    console.log(`Extracted ${data.length} unique transactions from CSV`);
    return { success: true, data };
  } catch (error) {
    console.error("Error processing CSV lines:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "שגיאה בעיבוד נתוני CSV",
    };
  }
};
