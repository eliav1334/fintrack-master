
import { Transaction, Budget, FinancialSummary, TransactionCategory } from "@/types/finance";

export const getFinancialSummary = (transactions: Transaction[]): FinancialSummary => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    );
  });

  const totalIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const expensesByCategory: Record<TransactionCategory, number> = {} as Record<TransactionCategory, number>;
  
  currentMonthTransactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      if (expensesByCategory[t.category]) {
        expensesByCategory[t.category] += t.amount;
      } else {
        expensesByCategory[t.category] = t.amount;
      }
    });

  let largestExpenseCategory: TransactionCategory = "אחר";
  let largestExpenseAmount = 0;

  Object.entries(expensesByCategory).forEach(([category, amount]) => {
    if (amount > largestExpenseAmount) {
      largestExpenseAmount = amount;
      largestExpenseCategory = category as TransactionCategory;
    }
  });

  const formattedExpensesByCategory = Object.entries(expensesByCategory).map(
    ([category, amount]) => ({
      category: category as TransactionCategory,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    })
  );

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const prevMonthTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      transactionDate.getMonth() === prevMonth &&
      transactionDate.getFullYear() === prevMonthYear
    );
  });

  const prevMonthIncome = prevMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const prevMonthExpenses = prevMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const incomeChange =
    prevMonthIncome > 0
      ? ((totalIncome - prevMonthIncome) / prevMonthIncome) * 100
      : 0;

  const expenseChange =
    prevMonthExpenses > 0
      ? ((totalExpenses - prevMonthExpenses) / prevMonthExpenses) * 100
      : 0;

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    largestExpenseCategory: {
      category: largestExpenseCategory,
      amount: largestExpenseAmount,
      percentage:
        totalExpenses > 0
          ? (largestExpenseAmount / totalExpenses) * 100
          : 0,
    },
    expensesByCategory: formattedExpensesByCategory,
    monthlyComparison: {
      prevMonthIncome,
      prevMonthExpenses,
      incomeChange,
      expenseChange,
    },
  };
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const defaultTransactions: Transaction[] = [
  {
    id: "1",
    description: "שכירות",
    date: "2023-06-01",
    amount: 1200,
    category: "דיור",
    type: "expense",
    status: "הושלם",
  },
  {
    id: "2",
    description: "משכורת",
    date: "2023-06-05",
    amount: 5430,
    category: "הכנסה",
    type: "income",
    status: "הושלם",
  },
  {
    id: "3",
    description: "סופרמרקט",
    date: "2023-06-08",
    amount: 230,
    category: "מזון",
    type: "expense",
    status: "הושלם",
  },
  {
    id: "4",
    description: "תדלוק",
    date: "2023-06-12",
    amount: 150,
    category: "תחבורה",
    type: "expense",
    status: "הושלם",
  },
  {
    id: "5",
    description: "נטפליקס",
    date: "2023-06-15",
    amount: 45,
    category: "בידור",
    type: "expense",
    status: "הושלם",
  },
];

export const defaultBudgets: Budget[] = [
  {
    id: "1",
    category: "דיור",
    amount: 1500,
    period: "monthly",
    currentSpent: 1200,
  },
  {
    id: "2",
    category: "מזון",
    amount: 1000,
    period: "monthly",
    currentSpent: 800,
  },
  {
    id: "3",
    category: "תחבורה",
    amount: 600,
    period: "monthly",
    currentSpent: 500,
  },
  {
    id: "4",
    category: "בידור",
    amount: 400,
    period: "monthly",
    currentSpent: 300,
  },
  {
    id: "5",
    category: "חשבונות",
    amount: 500,
    period: "monthly",
    currentSpent: 450,
  },
];
