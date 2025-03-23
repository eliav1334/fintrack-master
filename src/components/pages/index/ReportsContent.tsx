
import React, { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, BarChart3, PiggyBank } from "lucide-react";
import { ReportContent } from "@/modules/features/reports/ReportContent";

interface ReportsContentProps {
  handleAddTransaction: () => void;
  handleNavigateToBudgets: () => void;
}

const ReportsContent: React.FC<ReportsContentProps> = ({
  handleAddTransaction,
  handleNavigateToBudgets
}) => {
  const [activeSection, setActiveSection] = useState<"main" | "transactions" | "budgets">("main");

  const renderContent = () => {
    switch (activeSection) {
      case "main":
        return <ReportContent />;
      case "transactions":
        return (
          <div className="space-y-4">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setActiveSection("main")}
            >
              <ChevronLeft className="h-4 w-4" />
              חזרה לדוחות
            </Button>
            <div>
              <h2 className="text-xl font-bold mb-4">ניהול תנועות</h2>
              <p className="mb-4">
                כאן ניתן להוסיף תנועות חדשות, לערוך תנועות קיימות או לנהל קטגוריות.
              </p>
              <Button onClick={handleAddTransaction}>הוספת תנועה חדשה</Button>
            </div>
          </div>
        );
      case "budgets":
        return (
          <div className="space-y-4">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setActiveSection("main")}
            >
              <ChevronLeft className="h-4 w-4" />
              חזרה לדוחות
            </Button>
            <div>
              <h2 className="text-xl font-bold mb-4">ניהול תקציבים</h2>
              <p className="mb-4">
                כאן ניתן לצפות בתקציבים שלך, להוסיף תקציבים חדשים או לערוך תקציבים קיימים.
              </p>
              <Button onClick={handleNavigateToBudgets}>ניהול תקציבים</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {activeSection === "main" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col items-center gap-2"
            onClick={() => setActiveSection("transactions")}
          >
            <BarChart3 className="h-12 w-12 mb-2" />
            <span className="text-lg font-medium">ניהול תנועות</span>
            <span className="text-sm text-muted-foreground text-center">
              הוספה, עריכה ומחיקה של תנועות קיימות
            </span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col items-center gap-2"
            onClick={() => setActiveSection("budgets")}
          >
            <PiggyBank className="h-12 w-12 mb-2" />
            <span className="text-lg font-medium">ניהול תקציבים</span>
            <span className="text-sm text-muted-foreground text-center">
              הגדרה וניהול של תקציבים חודשיים
            </span>
          </Button>
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default ReportsContent;
