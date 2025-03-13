
import { Budget, CategoryType } from "@/types";
import BudgetCard from "./BudgetCard";
import BudgetEmpty from "./BudgetEmpty";

interface BudgetListProps {
  budgets: Budget[];
  categories: CategoryType[];
  calculateExpenses: (categoryId: string) => number;
  onDelete: (id: string) => void;
  onSubmit: (budget: Omit<Budget, "id">) => void;
}

const BudgetList = ({ 
  budgets, 
  categories, 
  calculateExpenses, 
  onDelete,
  onSubmit 
}: BudgetListProps) => {
  const expenseCategories = categories.filter(cat => cat.type === "expense");

  if (!budgets || budgets.length === 0) {
    return <BudgetEmpty expenseCategories={expenseCategories} onSubmit={onSubmit} />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {budgets.map(budget => {
        const category = categories.find(c => c.id === budget.categoryId);
        const expenses = calculateExpenses(budget.categoryId);
        
        return (
          <BudgetCard 
            key={budget.id}
            budget={budget}
            category={category}
            expenses={expenses}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
};

export default BudgetList;
