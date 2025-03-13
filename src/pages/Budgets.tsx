import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFinance } from "@/contexts/FinanceContext";
import BudgetList from "@/components/budgets/BudgetList";
import BudgetForm from "@/components/budgets/BudgetForm";
import CategoryList from "@/components/budgets/CategoryList";
import CategoryForm from "@/components/budgets/CategoryForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, ListChecks, Palette } from "lucide-react";

const Budgets = () => {
  const navigate = useNavigate();
  const { state, setBudget, deleteBudget, addCategory } = useFinance();
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  
  // מיון תקציבים לפי קטגוריות
  const expenseCategories = useMemo(() => {
    return state.categories.filter((category) => category.type === "expense");
  }, [state.categories]);

  const handleNavigateToHome = () => {
    // נשתמש ב-navigate במקום ב-window.location
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* כותרת ראשית */}
      <header className="border-b border-border py-4 px-6 bg-card">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ניהול תקציב אישי</h1>
          <Button 
            variant="outline" 
            onClick={handleNavigateToHome}
            className="hidden sm:flex"
          >
            חזרה לדף הבית
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="grid gap-6 md:grid-cols-2">
          {/* רשימת תקציבים */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">רשימת תקציבים</h2>
              <Dialog open={isAddBudgetOpen} onOpenChange={setIsAddBudgetOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <PlusCircle className="w-4 h-4 ml-2" />
                    הוסף תקציב
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>הוסף תקציב חדש</DialogTitle>
                  </DialogHeader>
                  <BudgetForm 
                    expenseCategories={expenseCategories} 
                    onSubmit={(budget) => {
                      setBudget(budget);
                      setIsAddBudgetOpen(false);
                    }} 
                  />
                </DialogContent>
              </Dialog>
            </div>
            <BudgetList budgets={state.budgets} onDelete={deleteBudget} />
          </Card>

          {/* רשימת קטגוריות */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">רשימת קטגוריות</h2>
              <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <PlusCircle className="w-4 h-4 ml-2" />
                    הוסף קטגוריה
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>הוסף קטגוריה חדשה</DialogTitle>
                  </DialogHeader>
                  <CategoryForm 
                    onSubmit={(category) => {
                      addCategory(category);
                      setIsAddCategoryOpen(false);
                    }} 
                  />
                </DialogContent>
              </Dialog>
            </div>
            <CategoryList categories={state.categories} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Budgets;
