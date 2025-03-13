
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { useFinance } from "@/contexts/FinanceContext";
import { useCurrencyFormatter } from "@/hooks/finance/useCurrencyFormatter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addMonths } from "date-fns";
import { CalendarIcon, PlusCircle, Save } from "lucide-react";

interface FutureBudgetItem {
  id: string; 
  month: string;
  categoryId: string;
  plannedAmount: number;
}

export const BudgetPlanner: React.FC = () => {
  const { state } = useFinance();
  const { formatCurrency } = useCurrencyFormatter();
  const [startMonth, setStartMonth] = useState<string>(format(new Date(), "yyyy-MM"));
  const [planningMonths, setPlanningMonths] = useState<number>(3);
  const [futureBudgets, setFutureBudgets] = useState<FutureBudgetItem[]>([]);

  // טיפול בהוספת פריט תקציב חדש לתכנון
  const handleAddBudgetItem = () => {
    const newId = `plan-${Date.now()}`;
    const newItem: FutureBudgetItem = {
      id: newId,
      month: startMonth,
      categoryId: state.categories[0]?.id || "",
      plannedAmount: 0
    };
    
    setFutureBudgets([...futureBudgets, newItem]);
  };
  
  // עדכון ערך של פריט תקציב מתוכנן
  const handleUpdateBudgetItem = (id: string, field: string, value: any) => {
    setFutureBudgets(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  // מחיקת פריט תקציב מתוכנן
  const handleDeleteBudgetItem = (id: string) => {
    setFutureBudgets(prevItems => 
      prevItems.filter(item => item.id !== id)
    );
  };

  // יצירת חודשים עתידיים לטבלה
  const futureMonths = Array.from({ length: planningMonths }).map((_, index) => {
    const monthDate = new Date(startMonth + "-01");
    return format(addMonths(monthDate, index), "yyyy-MM");
  });
  
  // שמירת התכנון
  const handleSavePlan = () => {
    // כאן תהיה הלוגיקה לשמירת התכנון בלוקל סטורג' או בעתיד בשרת
    localStorage.setItem('budgetPlan', JSON.stringify(futureBudgets));
    alert('תכנון התקציב נשמר בהצלחה!');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarIcon className="ml-2 h-5 w-5" />
          תכנון תקציב עתידי
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* הגדרות תכנון */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="startMonth">חודש התחלה</Label>
            <Input
              id="startMonth"
              type="month"
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="planningMonths">מספר חודשים</Label>
            <Select
              value={planningMonths.toString()}
              onValueChange={(value) => setPlanningMonths(parseInt(value))}
            >
              <SelectTrigger id="planningMonths">
                <SelectValue placeholder="בחר מספר חודשים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">חודש אחד</SelectItem>
                <SelectItem value="3">3 חודשים</SelectItem>
                <SelectItem value="6">6 חודשים</SelectItem>
                <SelectItem value="12">שנה</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleAddBudgetItem} className="gap-1">
              <PlusCircle className="h-4 w-4" />
              הוסף פריט לתכנון
            </Button>
          </div>
        </div>
        
        {/* טבלת תכנון */}
        {futureBudgets.length > 0 ? (
          <>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>קטגוריה</TableHead>
                    {futureMonths.map(month => (
                      <TableHead key={month}>
                        {format(new Date(month + "-01"), "MM/yyyy")}
                      </TableHead>
                    ))}
                    <TableHead>פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {futureBudgets.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Select
                          value={item.categoryId}
                          onValueChange={(value) => handleUpdateBudgetItem(item.id, "categoryId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="בחר קטגוריה" />
                          </SelectTrigger>
                          <SelectContent>
                            {state.categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      {futureMonths.map(month => (
                        <TableCell key={month}>
                          <Input
                            type="number"
                            value={item.month === month ? item.plannedAmount : ""}
                            onChange={(e) => {
                              if (item.month === month) {
                                handleUpdateBudgetItem(
                                  item.id, 
                                  "plannedAmount", 
                                  parseFloat(e.target.value) || 0
                                );
                              }
                            }}
                            placeholder="0.00"
                          />
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBudgetItem(item.id)}
                          className="text-destructive"
                        >
                          הסר
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <Button
              className="mt-4 gap-1"
              onClick={handleSavePlan}
            >
              <Save className="h-4 w-4" />
              שמור תכנון
            </Button>
          </>
        ) : (
          <div className="text-center py-10 border rounded-md">
            <p className="text-muted-foreground mb-4">
              אין פריטים בתכנון העתידי
            </p>
            <Button onClick={handleAddBudgetItem} variant="secondary" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              הוסף פריט לתכנון
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
