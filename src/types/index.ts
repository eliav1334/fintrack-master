export type CategoryType = {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
};

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: "income" | "expense";
  categoryId: string;
  notes?: string;
  cardNumber?: string; // הוספת שדה מספר כרטיס אשראי
};

export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  startDate: string;
};

export type FileImportFormat = {
  id: string;
  name: string;
  mapping: {
    date: string;
    amount: string;
    description: string;
    type?: string;
    category?: string;
    cardNumber?: string;
  };
  dateFormat: string;
  delimiter?: string;
  typeIdentifier: {
    column: string;
    incomeValues: string[];
    expenseValues: string[];
  };
};
