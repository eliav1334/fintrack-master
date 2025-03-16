
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, ArrowDownUp, PlusCircle, FileText, PieChart, FileBarChart } from "lucide-react";

interface TabsNavigationProps {
  activeTab: string;
}

const TabsNavigation: React.FC<TabsNavigationProps> = ({ activeTab }) => {
  return (
    <TabsList className="grid grid-cols-6 mb-8 w-full max-w-5xl mx-auto">
      <TabsTrigger value="dashboard" className="flex flex-col items-center gap-1 py-3">
        <BarChart3 className="h-5 w-5" />
        <span>דשבורד</span>
      </TabsTrigger>
      <TabsTrigger value="transactions" className="flex flex-col items-center gap-1 py-3">
        <ArrowDownUp className="h-5 w-5" />
        <span>תנועות</span>
      </TabsTrigger>
      <TabsTrigger value="add-transaction" className="flex flex-col items-center gap-1 py-3">
        <PlusCircle className="h-5 w-5" />
        <span>הוספת תנועה</span>
      </TabsTrigger>
      <TabsTrigger value="import" className="flex flex-col items-center gap-1 py-3">
        <FileText className="h-5 w-5" />
        <span>ייבוא קבצים</span>
      </TabsTrigger>
      <TabsTrigger value="reports" className="flex flex-col items-center gap-1 py-3">
        <PieChart className="h-5 w-5" />
        <span>דוחות</span>
      </TabsTrigger>
      <TabsTrigger value="advanced-reports" className="flex flex-col items-center gap-1 py-3">
        <FileBarChart className="h-5 w-5" />
        <span>דוחות מתקדמים</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default TabsNavigation;
