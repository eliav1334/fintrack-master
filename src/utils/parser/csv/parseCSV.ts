
import { FileImportFormat } from "@/types";
import { ParserResult } from "../types";
import { processCSVLines } from './processCSVLines';

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

        const result = processCSVLines(lines, headers, format, cardFilter);
        resolve(result);
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
