
import React from "react";
import { useNavigate } from "react-router-dom";
import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import Dashboard from "@/components/Dashboard";
import { RecommendationsCard } from "@/components/dashboard";
import { useFinance } from "@/modules/core/finance/FinanceContext";
import ReportsContent from "./ReportsContent";
import TransactionsModule from "@/modules/features/transactions/TransactionsModule";
import { AdvancedReportView } from "@/components/reports";

interface TabContentProps {
  activeTab: string;
  stats: {
    balance: number;
    income: number;
    expense: number;
    incomeChange: number;
    expenseChange: number;
    balanceChange: number;
  };
  recommendations: {
    recommendations: Array<{
      title: string;
      description: string;
      savingPotential: number;
      priority: "high" | "medium" | "low";
    }>;
    hasRecommendations: boolean;
    savingsPotential: number;
  };
}

const TabContent: React.FC<TabContentProps> = ({ 
  activeTab, 
  stats, 
  recommendations 
}) => {
  const navigate = useNavigate();

  const handleNavigateToBudgets = () => {
    navigate('/budgets');
  };

  const handleAddTransaction = () => {
    navigate('/?tab=add-transaction');
  };

  return (
    <div className="mt-4">
      {/* דשבורד */}
      <TabsContent value="dashboard" className="animate-enter">
        <Dashboard />
        
        {/* קומפוננטת המלצות חדשה */}
        {stats.balance < 0 && (
          <div className="mt-6">
            <RecommendationsCard recommendations={recommendations} />
          </div>
        )}
      </TabsContent>

      {/* מודול עסקאות המאוחד */}
      <TabsContent value="transactions" className="animate-enter">
        <TransactionsModule activeTab="transactions" />
      </TabsContent>

      {/* טופס הוספת תנועה */}
      <TabsContent value="add-transaction" className="animate-enter">
        <TransactionsModule activeTab="add-transaction" />
      </TabsContent>

      {/* ייבוא קבצים */}
      <TabsContent value="import" className="animate-enter">
        <TransactionsModule activeTab="import" />
      </TabsContent>

      {/* דוחות */}
      <TabsContent value="reports" className="animate-enter">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">דוחות וניתוח נתונים</h2>
          <ReportsContent 
            handleAddTransaction={handleAddTransaction}
            handleNavigateToBudgets={handleNavigateToBudgets}
          />
        </Card>
      </TabsContent>
      
      {/* דוחות מתקדמים */}
      <TabsContent value="advanced-reports" className="animate-enter">
        <AdvancedReportView />
      </TabsContent>
    </div>
  );
};

export default TabContent;
