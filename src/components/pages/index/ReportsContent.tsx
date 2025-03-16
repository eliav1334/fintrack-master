
import React from "react";
import { Card } from "@/components/ui/card";
import { useFinance } from "@/contexts/FinanceContext";
import { useNavigate } from "react-router-dom";
import { PieChart, BarChart3 } from "lucide-react";

interface ReportsContentProps {
  handleAddTransaction: () => void;
  handleNavigateToBudgets: () => void;
}

const ReportsContent: React.FC<ReportsContentProps> = ({
  handleAddTransaction,
  handleNavigateToBudgets
}) => {
  const { state } = useFinance();
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="finance-card finance-card-hover p-6">
        <h3 className="text-xl font-semibold mb-3">התפלגות הוצאות לפי קטגוריה</h3>
        <p className="text-muted-foreground mb-6">גרף עוגה המציג את חלוקת ההוצאות לפי קטגוריות</p>
        {state.transactions.length > 0 ? (
          <div className="h-64 flex items-center justify-center">
            <PieChart className="h-16 w-16 text-muted-foreground" />
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <p>אין נתונים להצגה</p>
            <button 
              className="mt-4 text-primary hover:underline"
              onClick={handleAddTransaction}
            >
              הוסף תנועה ראשונה
            </button>
          </div>
        )}
      </Card>
      
      <Card className="finance-card finance-card-hover p-6">
        <h3 className="text-xl font-semibold mb-3">מעקב תקציב</h3>
        <p className="text-muted-foreground mb-6">השוואה בין התקציב המתוכנן להוצאות בפועל</p>
        {state.budgets.length > 0 ? (
          <div className="h-64 flex items-center justify-center">
            <BarChart3 className="h-16 w-16 text-muted-foreground" />
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <p>לא הוגדרו תקציבים</p>
            <button 
              className="mt-4 text-primary hover:underline"
              onClick={handleNavigateToBudgets}
            >
              הגדר תקציב חדש
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReportsContent;
