
import { Transaction, FileImportFormat } from "@/types";

export type ParserResult = {
  success: boolean;
  data?: Omit<Transaction, "id">[];
  error?: string;
  sheets?: string[]; // שמות הגליונות הזמינים
  sheetInfo?: { [sheetName: string]: number }; // מידע על מספר העסקאות בכל גליון
};
