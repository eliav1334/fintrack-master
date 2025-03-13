
import { Transaction, TransactionType } from "@/types";

export interface TransactionFormData {
  description: string;
  amount: string;
  type: TransactionType;
  date: string;
  categoryId: string;
  notes: string;
  // שדות חדשים לתחשיב חשמל
  isElectricityBill?: boolean;
  mainMeterReading?: {
    current: number;
    previous: number;
    date: string;
  };
  secondaryMeterReading?: {
    current: number;
    previous: number;
    date: string;
  };
  electricityRate?: number;
  vatRate?: number;
}

export interface UseTransactionFormParams {
  initialTransaction?: Transaction;
  onClose?: () => void;
}

export interface UseTransactionFormResult {
  formData: TransactionFormData;
  isEditing: boolean;
  filteredCategories: any[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSwitchChange: (name: string, checked: boolean) => void;
  handleElectricityChange: (type: string, field: string, value: string) => void;
  calculateElectricityAmount: () => void;
  handleSubmit: (e: React.FormEvent) => void;
}
