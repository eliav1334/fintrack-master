
import { Transaction, FileImportFormat } from "@/types";

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
  // זהו מציין מקום עבור לוגיקת ניתוח אקסל
  // באפליקציה אמיתית, היינו משתמשים בספריה כמו SheetJS/xlsx
  // עבור הדגמה זו, נחזיר שגיאה המבקשת מהמשתמש להשתמש ב-CSV במקום
  return {
    success: false,
    error: "ניתוח קבצי אקסל אינו מיושם עדיין. אנא המר ל-CSV ונסה שוב.",
  };
};

export const detectFileType = (file: File): "csv" | "excel" | "unknown" => {
  const extension = file.name.split(".").pop()?.toLowerCase();
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
  const fileType = detectFileType(file);
  
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
