import { Transaction, Budget, FinancialSummary, TransactionCategory, BudgetException } from "@/types/finance";
import { normalizeCategory } from "@/services/import/importUtils";

export const getFinancialSummary = (transactions: Transaction[], budgets?: Budget[]): FinancialSummary => {
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
      const normalizedCategory = normalizeCategory(t.category);
      if (expensesByCategory[normalizedCategory]) {
        expensesByCategory[normalizedCategory] += t.amount;
      } else {
        expensesByCategory[normalizedCategory] = t.amount;
      }
    });

  let largestExpenseCategory: TransactionCategory = "other";
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

  // חישוב חריגות תקציב
  const budgetExceptions: BudgetException[] = [];
  if (budgets) {
    const monthlyBudgets = budgets.filter(
      (b) => !b.period || b.period === "monthly"
    );

    monthlyBudgets.forEach((budget) => {
      const normalizedCategory = normalizeCategory(budget.category);
      const categoryExpense = expensesByCategory[normalizedCategory] || 0;
      if (categoryExpense > budget.amount) {
        budgetExceptions.push({
          category: normalizedCategory,
          amount: categoryExpense - budget.amount
        });
      }
    });
  }

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
      incomeChange,
      expenseChange,
    },
    budgetExceptions: budgetExceptions.length > 0 ? budgetExceptions : undefined
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
    category: "housing",
    type: "expense",
    status: "completed",
  },
  {
    id: "2",
    description: "משכורת",
    date: "2023-06-05",
    amount: 5430,
    category: "other",
    type: "income",
    status: "completed",
  },
  {
    id: "3",
    description: "סופרמרקט",
    date: "2023-06-08",
    amount: 230,
    category: "food",
    type: "expense",
    status: "completed",
  },
  {
    id: "4",
    description: "תדלוק",
    date: "2023-06-12",
    amount: 150,
    category: "transportation",
    type: "expense",
    status: "completed",
  },
  {
    id: "5",
    description: "נטפליקס",
    date: "2023-06-15",
    amount: 45,
    category: "entertainment",
    type: "expense",
    status: "completed",
  },
];

export const defaultBudgets: Budget[] = [
  {
    id: "1",
    category: "housing",
    amount: 1500,
    period: "monthly",
    currentSpent: 1200,
  },
  {
    id: "2",
    category: "food",
    amount: 1000,
    period: "monthly",
    currentSpent: 800,
  },
  {
    id: "3",
    category: "transportation",
    amount: 600,
    period: "monthly",
    currentSpent: 500,
  },
  {
    id: "4",
    category: "entertainment",
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
