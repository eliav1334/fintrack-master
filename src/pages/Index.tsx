
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFinance } from "@/contexts/FinanceContext";
import Dashboard from "@/components/Dashboard";
import TransactionList from "@/components/TransactionList";
import TransactionForm from "@/components/TransactionForm";
import FileImport from "@/components/FileImport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  BarChart3, PlusCircle, FileText, 
  PieChart, Settings, ArrowDownUp 
} from "lucide-react";

const Index = () => {
  const { state } = useFinance();
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* כותרת ראשית */}
      <header className="border-b border-border py-4 px-6 bg-card">
        <h1 className="text-2xl font-bold text-center">ניהול תקציב אישי</h1>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Tabs 
          defaultValue="dashboard" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          {/* תפריט ניווט */}
          <TabsList className="grid grid-cols-5 mb-8 w-full max-w-4xl mx-auto">
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
          </TabsList>

          {/* תוכן הלשוניות */}
          <div className="mt-4">
            {/* דשבורד */}
            <TabsContent value="dashboard" className="animate-enter">
              <Dashboard />
            </TabsContent>

            {/* רשימת תנועות */}
            <TabsContent value="transactions" className="animate-enter">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">היסטוריית תנועות</h2>
                <TransactionList />
              </Card>
            </TabsContent>

            {/* טופס הוספת תנועה */}
            <TabsContent value="add-transaction" className="animate-enter">
              <Card className="p-6 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">הוספת תנועה חדשה</h2>
                <TransactionForm />
              </Card>
            </TabsContent>

            {/* ייבוא קבצים */}
            <TabsContent value="import" className="animate-enter">
              <Card className="p-6 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">ייבוא תנועות מקובץ</h2>
                <FileImport />
              </Card>
            </TabsContent>

            {/* דוחות */}
            <TabsContent value="reports" className="animate-enter">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">דוחות וניתוח נתונים</h2>
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
                          onClick={() => setActiveTab("add-transaction")}
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
                        >
                          הגדר תקציב חדש
                        </button>
                      </div>
                    )}
                  </Card>
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
