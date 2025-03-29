
import { useState, useEffect } from "react";
import { Budget } from "@/types/finance";
import { generateId, defaultBudgets } from "@/utils/financeUtils";

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    try {
      const storedBudgets = localStorage.getItem("budgets");
      
      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets));
      } else {
        setBudgets(defaultBudgets);
      }
    } catch (error) {
      console.error("Error loading budgets from localStorage:", error);
      setBudgets(defaultBudgets);
    }
  }, []);

  useEffect(() => {
    if (budgets.length > 0) {
      localStorage.setItem("budgets", JSON.stringify(budgets));
    }
  }, [budgets]);

  const addBudget = (budget: Omit<Budget, "id">) => {
    const newBudget = {
      ...budget,
      id: generateId(),
    };
    setBudgets([...budgets, newBudget]);
  };

  const updateBudget = (id: string, budget: Partial<Budget>) => {
    setBudgets(
      budgets.map((b) => (b.id === id ? { ...b, ...budget } : b))
    );
  };

  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter((b) => b.id !== id));
  };

  return {
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
  };
}
