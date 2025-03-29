
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleDollarSign, Wallet, PieChart, ArrowDownUp, Upload } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ExpenseSummary from "@/components/dashboard/ExpenseSummary";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import ExpenseChart from "@/components/dashboard/ExpenseChart";

const Index = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">דשבורד פיננסי</h1>
          <p className="text-muted-foreground">נהל את ההוצאות וההכנסות שלך במקום אחד</p>
        </div>
        <div>
          <Link to="/import">
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              ייבוא נתונים
            </Button>
          </Link>
        </div>
      </header>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="dashboard">דשבורד</TabsTrigger>
          <TabsTrigger value="transactions">עסקאות</TabsTrigger>
          <TabsTrigger value="reports">דוחות</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">סה״כ הכנסות</CardTitle>
                <CircleDollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₪5,430</div>
                <p className="text-xs text-muted-foreground">+2.5% מהחודש שעבר</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">סה״כ הוצאות</CardTitle>
                <Wallet className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₪3,549</div>
                <p className="text-xs text-muted-foreground">+4.1% מהחודש שעבר</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">יתרה</CardTitle>
                <ArrowDownUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₪1,881</div>
                <p className="text-xs text-muted-foreground">-0.5% מהחודש שעבר</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">הוצאה גדולה</CardTitle>
                <PieChart className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">דיור</div>
                <p className="text-xs text-muted-foreground">₪1,200 (33.8%)</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-7 lg:col-span-4">
              <CardHeader>
                <CardTitle>סיכום הוצאות</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpenseChart />
              </CardContent>
            </Card>
            
            <Card className="col-span-7 lg:col-span-3">
              <CardHeader>
                <CardTitle>התפלגות הוצאות</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpenseSummary />
              </CardContent>
            </Card>
          </div>
          
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>עסקאות אחרונות</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentTransactions />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>עסקאות</CardTitle>
            </CardHeader>
            <CardContent>
              <p>כאן תוכל לנהל את העסקאות שלך. הוספה, עריכה ומחיקה של עסקאות פיננסיות.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>דוחות</CardTitle>
            </CardHeader>
            <CardContent>
              <p>כאן תוכל לצפות בדוחות מותאמים אישית וניתוחים מתקדמים של המצב הפיננסי שלך.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
