
import { FileImportFormat } from "@/types";

/**
 * מזהה את סוג הקובץ לפי הסיומת
 */
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
