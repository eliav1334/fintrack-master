import { useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Budget, CategoryType } from "@/types";
import { PlusCircle, Trash2 } from "lucide-react";
import { generateId } from "@/utils/generateId";

const Budgets = () => {
  const { state, setBudget, deleteBudget } = useFinance();
  const [newBudget, setNewBudget] = useState({
    categoryId: "",
    amount: "",
    period: "monthly"
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBudget.categoryId || !newBudget.amount) return;
    
    const budget: Omit<Budget, "id"> = {
      categoryId: newBudget.categoryId,
      amount: parseFloat(newBudget.amount),
      period: newBudget.period as "daily" | "weekly" | "monthly" | "yearly",
      startDate: new Date().toISOString(),
    };
    
    setBudget(budget);
    
    setNewBudget({
      categoryId: "",
      amount: "",
      period: "monthly"
    });
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
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {state.budgets.length > 0 ? (
          state.budgets.map(budget => {
            const category = state.categories.find(c => c.id === budget.categoryId);
            const expenses = calculateExpenses(budget.categoryId);
            const percentage = Math.min(Math.round((expenses / budget.amount) * 100), 100);
            const isOverBudget = expenses > budget.amount;
            
            return (
              <Card key={budget.id} className="p-6">
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
                    onClick={() => deleteBudget(budget.id)}
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
          })
        ) : (
          <div className="col-span-full text-center py-10">
            <h3 className="text-xl font-medium mb-2">עדיין לא הוגדרו תקציבים</h3>
            <p className="text-muted-foreground mb-6">הגדר את התקציב הראשון שלך כדי לעקוב אחר ההוצאות</p>
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
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default Budgets;
