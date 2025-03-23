
import React from "react";
import { Card } from "@/components/ui/card";
import TransactionList from "@/components/TransactionList";
import { TransactionForm } from "@/components/transactions";
import FileImport from "@/components/FileImport";

interface TransactionsModuleProps {
  activeTab: string;
}

const TransactionsModule: React.FC<TransactionsModuleProps> = ({ activeTab }) => {
  return (
    <>
      {/* רשימת תנועות */}
      {activeTab === "transactions" && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">היסטוריית תנועות</h2>
          <TransactionList />
        </Card>
      )}

      {/* טופס הוספת תנועה */}
      {activeTab === "add-transaction" && (
        <Card className="p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">הוספת תנועה חדשה</h2>
          <TransactionForm />
        </Card>
      )}

      {/* ייבוא קבצים */}
      {activeTab === "import" && (
        <Card className="p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">ייבוא תנועות מקובץ</h2>
          <FileImport />
        </Card>
      )}
    </>
  );
};

export default TransactionsModule;
