import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarIcon, DownloadIcon, ArrowDownUp, BarChart3, PieChart, CreditCard } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import { useCurrencyFormatter } from "@/hooks/finance/useCurrencyFormatter";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Transaction } from "@/types";
import * as XLSX from "xlsx";
import { ReportTypesSheet } from "./ReportTypesSheet";
import { he } from "date-fns/locale";

interface ExportOptions {
  format: "excel" | "csv" | "pdf";
  includeNotes: boolean;
  groupBy: "none" | "category" | "month";
}

export const AdvancedReportView: React.FC = () => {
  const { state } = useFinance();
  const { formatCurrency } = useCurrencyFormatter();
  const [reportType, setReportType] = useState<string>("monthly");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "excel",
    includeNotes: true,
    groupBy: "none"
  });

  const handleExport = () => {
    // יצירת דוח אקסל בסיסי
    if (exportOptions.format === "excel" || exportOptions.format === "csv") {
      const workbook = XLSX.utils.book_new();
      
      // הכנת הנתונים לייצוא
      const data = prepareExportData(state.transactions, exportOptions);
      
      // יצירת גיליון עבודה
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // הוספת הגיליון לחוברת העבודה
      XLSX.utils.book_append_sheet(workbook, worksheet, "דוח עסקאות");
      
      // הורדת הקובץ
      const fileExtension = exportOptions.format === "excel" ? "xlsx" : "csv";
      const fileName = `דוח_פיננסי_${format(new Date(), "yyyy-MM-dd")}.${fileExtension}`;
      
      if (exportOptions.format === "excel") {
        XLSX.writeFile(workbook, fileName);
      } else {
        const csvContent = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
      }
    } else if (exportOptions.format === "pdf") {
      alert("ייצוא ל-PDF ייתמך בעתיד");
    }
  };
  
  const prepareExportData = (transactions: Transaction[], options: ExportOptions) => {
    let result = [...transactions];
    
    // סינון לפי טווח תאריכים אם קיים
    if (dateRange.from) {
      result = result.filter(tx => 
        new Date(tx.date) >= dateRange.from!
      );
    }
    
    if (dateRange.to) {
      result = result.filter(tx => 
        new Date(tx.date) <= dateRange.to!
      );
    }
    
    // מיפוי הנתונים לפורמט הייצוא
    return result.map(tx => {
      const category = state.categories.find(cat => cat.id === tx.categoryId);
      
      const baseData = {
        תאריך: format(new Date(tx.date), "dd/MM/yyyy"),
        תיאור: tx.description,
        סכום: tx.amount,
        סוג: tx.type === "income" ? "הכנסה" : "הוצאה",
        קטגוריה: category?.name || "ללא קטגוריה",
        תשלומים: tx.isInstallment ? `${tx.installmentDetails?.currentInstallment || 1}/${tx.installmentDetails?.totalInstallments || 1}` : "-",
      };
      
      // הוספת שדה הערות אם נדרש
      if (options.includeNotes) {
        return {
          ...baseData,
          הערות: tx.notes || ""
        };
      }
      
      return baseData;
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>דוחות מתקדמים</span>
          <div className="flex space-x-2 space-x-reverse">
            <ReportTypesSheet />
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>בחר תאריכים</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to,
                  }}
                  onSelect={(range) => setDateRange({ 
                    from: range?.from, 
                    to: range?.to 
                  })}
                  numberOfMonths={2}
                  locale={he}
                  dir="rtl"
                />
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="default"
              size="sm"
              className="gap-1"
              onClick={handleExport}
            >
              <DownloadIcon className="h-4 w-4" />
              <span>ייצוא דוח</span>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monthly" value={reportType} onValueChange={setReportType}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="monthly">דוח חודשי</TabsTrigger>
            <TabsTrigger value="category">לפי קטגוריות</TabsTrigger>
            <TabsTrigger value="installments">דוח תשלומים</TabsTrigger>
            <TabsTrigger value="trends">מגמות</TabsTrigger>
            <TabsTrigger value="export">ייצוא מותאם</TabsTrigger>
          </TabsList>
          
          <TabsContent value="monthly" className="space-y-4">
            <h3 className="text-lg font-semibold">סיכום חודשי</h3>
            <p className="text-muted-foreground">הצגת סיכום הכנסות והוצאות לפי חודשים</p>
            <div className="h-64 flex items-center justify-center border rounded-lg">
              <BarChart3 className="h-16 w-16 text-muted-foreground" />
              <span className="mr-2 text-muted-foreground">נתוני הגרף יוצגו כאן</span>
            </div>
          </TabsContent>
          
          <TabsContent value="category" className="space-y-4">
            <h3 className="text-lg font-semibold">הוצאות לפי קטגוריה</h3>
            <p className="text-muted-foreground">ניתוח הוצאות מפורט לפי קטגוריות</p>
            <div className="h-64 flex items-center justify-center border rounded-lg">
              <PieChart className="h-16 w-16 text-muted-foreground" />
              <span className="mr-2 text-muted-foreground">נתוני הגרף יוצגו כאן</span>
            </div>
          </TabsContent>
          
          <TabsContent value="installments" className="space-y-4">
            <h3 className="text-lg font-semibold">דוח עסקאות בתשלומים</h3>
            <p className="text-muted-foreground">ניתוח של עסקאות המשולמות בתשלומים לאורך זמן</p>
            <div className="h-64 flex items-center justify-center border rounded-lg">
              <CreditCard className="h-16 w-16 text-muted-foreground" />
              <span className="mr-2 text-muted-foreground">
                דוח תשלומים יאפשר מעקב אחר עסקאות בתשלומים והצגת התשלומים העתידיים הצפויים בכל חודש
              </span>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-sm">
              <strong>הערה חשובה:</strong> במערכת נרשם רק התשלום החודשי עבור כל חודש, ולא הסכום המלא של העסקה בתשלומים.
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-4">
            <h3 className="text-lg font-semibold">מגמות לאורך זמן</h3>
            <p className="text-muted-foreground">ניתוח מגמות ההכנסות וההוצאות לאורך זמן</p>
            <div className="h-64 flex items-center justify-center border rounded-lg">
              <ArrowDownUp className="h-16 w-16 text-muted-foreground" />
              <span className="mr-2 text-muted-foreground">נתוני מגמות יוצגו כאן</span>
            </div>
          </TabsContent>
          
          <TabsContent value="export" className="space-y-4">
            <h3 className="text-lg font-semibold">הגדרות ייצוא</h3>
            <p className="text-muted-foreground">התאם את הדוח שברצונך לייצא</p>
            
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <label className="text-sm font-medium">פורמט קובץ</label>
                <Select
                  value={exportOptions.format}
                  onValueChange={(val) => setExportOptions({ ...exportOptions, format: val as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר פורמט" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excel">Excel (xlsx)</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">קיבוץ נתונים</label>
                <Select
                  value={exportOptions.groupBy}
                  onValueChange={(val) => setExportOptions({ ...exportOptions, groupBy: val as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר שיטת קיבוץ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ללא קיבוץ</SelectItem>
                    <SelectItem value="category">לפי קטגוריה</SelectItem>
                    <SelectItem value="month">לפי חודש</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* כפתור הפעלת הייצוא */}
              <Button 
                onClick={handleExport}
                className="w-full mt-4"
              >
                <DownloadIcon className="h-4 w-4 ml-2" />
                ייצא דוח
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
