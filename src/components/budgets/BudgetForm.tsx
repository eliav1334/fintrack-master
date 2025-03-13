
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { CategoryType, Budget } from "@/types";

interface BudgetFormProps {
  expenseCategories: CategoryType[];
  onSubmit: (budget: Omit<Budget, "id">) => void;
}

const BudgetForm = ({ expenseCategories, onSubmit }: BudgetFormProps) => {
  const [newBudget, setNewBudget] = useState({
    categoryId: "",
    amount: "",
    period: "monthly" as "daily" | "weekly" | "monthly" | "yearly" // הוספת טיפוס מפורש
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBudget.categoryId || !newBudget.amount) return;
    
    const budget: Omit<Budget, "id"> = {
      categoryId: newBudget.categoryId,
      amount: parseFloat(newBudget.amount),
      period: newBudget.period,
      startDate: new Date().toISOString(),
    };
    
    onSubmit(budget);
    
    setNewBudget({
      categoryId: "",
      amount: "",
      period: "monthly"
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="category">קטגוריה</Label>
        <Select 
          value={newBudget.categoryId} 
          onValueChange={value => setNewBudget({...newBudget, categoryId: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="בחר קטגוריה" />
          </SelectTrigger>
          <SelectContent>
            {expenseCategories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">סכום תקציב</Label>
        <Input
          id="amount"
          type="number"
          min="0"
          step="0.01"
          value={newBudget.amount}
          onChange={e => setNewBudget({...newBudget, amount: e.target.value})}
          placeholder="הזן סכום תקציב"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="period">תקופה</Label>
        <Select 
          value={newBudget.period} 
          onValueChange={value => setNewBudget({...newBudget, period: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">יומי</SelectItem>
            <SelectItem value="weekly">שבועי</SelectItem>
            <SelectItem value="monthly">חודשי</SelectItem>
            <SelectItem value="yearly">שנתי</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">ביטול</Button>
        </DialogClose>
        <Button type="submit">שמור</Button>
      </DialogFooter>
    </form>
  );
};

export default BudgetForm;
