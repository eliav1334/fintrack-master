
import React from "react";
import { useFinance } from "@/contexts/FinanceContext";

const SystemStats = () => {
  const { state } = useFinance();
  
  // סטטיסטיקה על המערכת
  const systemStats = {
    transactions: state.transactions.length,
    budgets: state.budgets.length,
    categories: state.categories.length,
    mappings: state.categoryMappings.length,
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold leading-none tracking-tight mb-4">
        סטטיסטיקות מערכת
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
          <span className="text-2xl font-bold">{systemStats.transactions}</span>
          <span className="text-sm text-muted-foreground">עסקאות</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
          <span className="text-2xl font-bold">{systemStats.budgets}</span>
          <span className="text-sm text-muted-foreground">תקציבים</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
          <span className="text-2xl font-bold">{systemStats.categories}</span>
          <span className="text-sm text-muted-foreground">קטגוריות</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
          <span className="text-2xl font-bold">{systemStats.mappings}</span>
          <span className="text-sm text-muted-foreground">מיפויי קטגוריות</span>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;
