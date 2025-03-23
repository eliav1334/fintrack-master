
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportContent } from "@/modules/features/reports/ReportContent";
import { AdvancedReportView } from "@/components/reports";

interface ReportsContentProps {
  handleAddTransaction: () => void;
  handleNavigateToBudgets: () => void;
}

const ReportsContent: React.FC<ReportsContentProps> = ({
  handleAddTransaction,
  handleNavigateToBudgets
}) => {
  const [activeTab, setActiveTab] = React.useState("system");

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="system">מערכת</TabsTrigger>
          <TabsTrigger value="advanced">דוחות מתקדמים</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system">
          <ReportContent />
        </TabsContent>
        
        <TabsContent value="advanced">
          <AdvancedReportView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsContent;
