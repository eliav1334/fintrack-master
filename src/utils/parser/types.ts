
import { Transaction, FileImportFormat } from "@/types";

export type ParserResult = {
  success: boolean;
  data?: Omit<Transaction, "id">[];
  error?: string;
  sheets?: string[]; // שמות הגליונות הזמינים
  sheetInfo?: { [sheetName: string]: number }; // מידע על מספר העסקאות בכל גליון
};

export interface InstallmentDetectionConfig {
  description: string;
  totalAmountValue?: string;
  installmentNumberValue?: string;
  totalInstallmentsValue?: string;
  originalTransactionDateValue?: string;
  chargeDateValue?: string;
  currentAmount: number;
  installmentIdentifier?: {
    enabled: boolean;
    pattern: string[];
  };
  defaultDate: string;
}
