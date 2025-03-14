
import { Transaction, FileImportFormat } from "@/types";
import { ParserResult } from "./types";

/**
 * מנתח קובץ CSV ומייצר עסקאות
 */
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
