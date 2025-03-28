
import { TransactionType } from "@/types";

export interface TransactionFormData {
  description: string;
  amount: string;
  type: TransactionType;
  date: string;
  categoryId: string;
  notes: string;
  isElectricityBill: boolean;
  mainMeterReading: {
    current: number;
    previous: number;
    date: string;
  };
  secondaryMeterReading: {
    current: number;
    previous: number;
    date: string;
  };
  electricityRate: number;
  vatRate: number;
  isInstallment: boolean;
  installmentDetails: {
    totalAmount: number;
    currentInstallment: number;
    totalInstallments: number;
    installmentNumber?: number; // מספר תשלום נוכחי
    originalTransactionDate?: string; // תאריך עסקה מקורי
    installmentDate?: string; // תאריך תשלום
    remainingAmount?: number; // סכום נותר לתשלום
  };
  cardNumber?: string; // מספר כרטיס אשראי
  businessCategory?: string; // קטגוריית בית עסק
  transactionCode?: string; // קוד עסקה מחברת האשראי
}

export interface UseTransactionFormResult {
  formData: TransactionFormData;
  isEditing: boolean;
  filteredCategories: {
    id: string;
    name: string;
    type: "income" | "expense";
    color: string;
    icon?: string;
  }[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: string, value: any) => void;
  handleSwitchChange: (field: string, checked: boolean) => void;
  handleElectricityChange: (readingType: string, field: string, value: string | number) => void;
  handleInstallmentChange: (field: string, value: number) => void;
  calculateElectricityAmount: () => void;
  handleSubmit: (e: React.FormEvent) => void;
}
