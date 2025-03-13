
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Budget, CategoryType } from "@/types";
import { Trash2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface BudgetCardProps {
  budget: Budget;
  category: CategoryType | undefined;
  expenses: number;
  onDelete: (id: string) => void;
}

const BudgetCard = ({ budget, category, expenses, onDelete }: BudgetCardProps) => {
  const percentage = expenses > 0 ? Math.min(Math.round((expenses / budget.amount) * 100), 100) : 0;
  const isOverBudget = expenses > budget.amount;
  const warningThreshold = 85; // התראה כשמגיעים ל-85% מהתקציב
  const isNearBudgetLimit = percentage >= warningThreshold && !isOverBudget;
  const [hasNotified, setHasNotified] = useState(false);
  
  // שליחת התראה כאשר מגיעים לסף האזהרה או חורגים מהתקציב - רק פעם אחת ורק אם יש הוצאות
  useEffect(() => {
    if (!hasNotified && expenses > 0) {
      if (isOverBudget) {
        toast({
          title: "חריגה מהתקציב",
          description: `חרגת מהתקציב בקטגוריית ${category?.name || 'לא ידוע'}`,
          variant: "destructive",
        });
        setHasNotified(true);
      } else if (isNearBudgetLimit) {
        toast({
          title: "אזהרה",
          description: `הגעת ל-${percentage}% מהתקציב בקטגוריית ${category?.name || 'לא ידוע'}`,
          variant: "default",
        });
        setHasNotified(true);
      }
    }
  }, [isOverBudget, isNearBudgetLimit, percentage, category?.name, hasNotified, expenses]);

  // איפוס דגל ההתראה כאשר משתנה אחוז הניצול (למשל בכל חודש חדש)
  useEffect(() => {
    if (percentage < warningThreshold) {
      setHasNotified(false);
    }
  }, [percentage, warningThreshold]);
  
  return (
    <Card className={`p-6 ${isOverBudget ? 'border-[#ea384c]/30' : isNearBudgetLimit ? 'border-amber-300' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            {category ? category.name : 'קטגוריה לא ידועה'}
            {isOverBudget && expenses > 0 && <AlertCircle className="h-5 w-5 text-[#ea384c]" />}
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
            {expenses === 0 ? 
              "0% מנוצל" :
              isOverBudget ? 
                <span className="text-[#ea384c] font-medium">חריגה מהתקציב!</span> : 
                isNearBudgetLimit ?
                  <span className="text-amber-500 font-medium">{percentage}% מנוצל</span> :
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
          className={isOverBudget && expenses > 0 ? "bg-red-100" : isNearBudgetLimit && expenses > 0 ? "bg-amber-100" : ""}
          indicatorClassName={
            isOverBudget && expenses > 0
              ? "bg-[#ea384c]" 
              : isNearBudgetLimit && expenses > 0
                ? "bg-amber-500" 
                : undefined
          }
        />
      </div>
    </Card>
  );
};

export default BudgetCard;
