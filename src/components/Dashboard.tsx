
import { useState } from "react";
import { useFinanceDashboard } from "@/hooks/useFinanceDashboard";
import { Card, CardContent } from "@/components/ui/card";
import DashboardSummaryCards from "./dashboard/DashboardSummaryCards";
import DashboardCharts from "./dashboard/DashboardCharts";
import BudgetAlertCard from "./dashboard/BudgetAlertCard";
import MonthPicker from "./dashboard/MonthPicker";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowUpDown } from "lucide-react";

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { stats, timeData, categoryData, budgetAlerts, balanceAlert, formatCurrency } = useFinanceDashboard(selectedDate);
  const navigate = useNavigate();

  // פונקציה לעדכון תאריך נבחר
  const handleDateChange = (date: Date) => {
    // וידוא שמעדכנים את התאריך בצורה נכונה
    setSelectedDate(new Date(date));
  };
  
  // פונקציה למעבר למסך התנועות עם החודש הנבחר
  const navigateToTransactions = () => {
    // מעבר לדף התנועות והעברת החודש הנבחר כפרמטר
    navigate(`/?tab=transactions&month=${selectedDate.toISOString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">דשבורד פיננסי</h2>
        <div className="flex items-center gap-4">
          <MonthPicker 
            selectedDate={selectedDate} 
            onChange={handleDateChange} 
          />
          <Button 
            onClick={navigateToTransactions}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>הצג תנועות</span>
          </Button>
        </div>
      </div>

      <DashboardSummaryCards stats={stats} formatCurrency={formatCurrency} />

      <DashboardCharts 
        timeData={timeData}
        categoryData={categoryData}
        formatCurrency={formatCurrency}
      />

      {/* כרטיס התראות תקציב */}
      <BudgetAlertCard 
        alerts={budgetAlerts}
        balanceAlert={balanceAlert}
        formatCurrency={formatCurrency}
      />

      <Card className="mt-6 hidden md:block">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">טיפ: תקציב חכם</h3>
              <p className="text-sm">נסה להקצות לפחות 20% מההכנסה החודשית לחיסכון או השקעות לטווח ארוך.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">טיפ: כלל 50/30/20</h3>
              <p className="text-sm">שיטה פופולרית לתקצוב: 50% להוצאות הכרחיות, 30% לרצונות, 20% לחיסכון.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">טיפ: מעקב שוטף</h3>
              <p className="text-sm">בדוק את המצב הפיננסי שלך לפחות פעם בשבוע כדי למנוע הפתעות לא נעימות.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
