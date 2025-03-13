
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Budget, CategoryType } from "@/types";
import { Trash2 } from "lucide-react";

interface BudgetCardProps {
  budget: Budget;
  category: CategoryType | undefined;
  expenses: number;
  onDelete: (id: string) => void;
}

const BudgetCard = ({ budget, category, expenses, onDelete }: BudgetCardProps) => {
  const percentage = Math.min(Math.round((expenses / budget.amount) * 100), 100);
  const isOverBudget = expenses > budget.amount;
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">
            {category ? category.name : 'קטגוריה לא ידועה'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {budget.period === "monthly" && "תקציב חודשי"}
            {budget.period === "yearly" && "תקציב שנתי"}
            {budget.period === "weekly" && "תקציב שבועי"}
            {budget.period === "daily" && "תקציב יומי"}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onDelete(budget.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>
            {isOverBudget ? 
              <span className="text-destructive font-medium">חריגה מהתקציב!</span> : 
              `${percentage}% מנוצל`
            }
          </span>
          <span>
            {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(expenses)} / 
            {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(budget.amount)}
          </span>
        </div>
        
        <Progress 
          value={percentage} 
          className={isOverBudget ? "bg-red-200" : ""}
        />
      </div>
    </Card>
  );
};

export default BudgetCard;
