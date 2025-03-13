
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { BudgetList, CategoryList, BudgetPlanner } from "@/components/budgets";
import { useFinance } from "@/contexts/FinanceContext";
import { Budget } from "@/types";

const Budgets = () => {
  const [activeTab, setActiveTab] = useState<string>("budgets");
  const { state, deleteBudget, setBudget } = useFinance();

  const calculateExpenses = (categoryId: string) => {
    return state.transactions
      .filter(t => t.type === "expense" && t.categoryId === categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleDeleteBudget = (id: string) => {
    deleteBudget(id);
  };

  const handleSubmitBudget = (budget: Omit<Budget, "id">) => {
    setBudget(budget);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4 px-6 bg-card">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" asChild className="ml-2">
              <Link to="/">
                <ArrowRight className="ml-2 h-4 w-4" />
                חזור
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">ניהול תקציבים</h1>
          </div>
          <Wallet className="h-6 w-6 text-primary" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Tabs 
          defaultValue="budgets" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-8 w-full max-w-lg mx-auto">
            <TabsTrigger value="budgets">תקציבים</TabsTrigger>
            <TabsTrigger value="categories">קטגוריות</TabsTrigger>
            <TabsTrigger value="planner">תכנון עתידי</TabsTrigger>
          </TabsList>

          <TabsContent value="budgets" className="animate-enter">
            <Card className="p-6">
              <BudgetList 
                budgets={state.budgets}
                categories={state.categories}
                calculateExpenses={calculateExpenses}
                onDelete={handleDeleteBudget}
                onSubmit={handleSubmitBudget}
              />
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="animate-enter">
            <Card className="p-6">
              <CategoryList categories={state.categories} />
            </Card>
          </TabsContent>
          
          <TabsContent value="planner" className="animate-enter">
            <BudgetPlanner />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Budgets;
