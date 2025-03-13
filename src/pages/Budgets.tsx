
import { useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Budget } from "@/types";
import { PlusCircle } from "lucide-react";
import BudgetForm from "@/components/budgets/BudgetForm";
import BudgetList from "@/components/budgets/BudgetList";

const Budgets = () => {
  const { state, setBudget, deleteBudget } = useFinance();
  
  // חישוב סכום ההוצאות לפי קטגוריה וחודש
  const calculateExpenses = (categoryId: string) => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return state.transactions
      .filter(t => 
        t.categoryId === categoryId && 
        t.type === "expense" &&
        new Date(t.date) >= firstDay &&
        new Date(t.date) <= lastDay
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // סינון רק קטגוריות מסוג הוצאה
  const expenseCategories = state.categories.filter(cat => cat.type === "expense");

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">ניהול תקציבים</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              <span>תקציב חדש</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הגדרת תקציב חדש</DialogTitle>
            </DialogHeader>
            <BudgetForm 
              expenseCategories={expenseCategories} 
              onSubmit={setBudget} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <BudgetList 
        budgets={state.budgets}
        categories={state.categories}
        calculateExpenses={calculateExpenses}
        onDelete={deleteBudget}
        onSubmit={setBudget}
      />
    </div>
  );
};

export default Budgets;
