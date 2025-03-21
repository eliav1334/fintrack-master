
import React, { useState, useEffect } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, ArrowUpDown, FileText, Trash, Info } from "lucide-react";
import { Transaction } from "@/types";
import { detectDuplicateTransactions } from "@/hooks/finance/storage/dataValidation";

const ImportHistory = () => {
  const { state, deleteTransaction } = useFinance();
  const [selectedImport, setSelectedImport] = useState<{
    date: string;
    source: string;
    transactions: Transaction[];
  } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [duplicatesCount, setDuplicatesCount] = useState(0);
  
  // בדיקת כפילויות בטעינה ראשונית
  useEffect(() => {
    const count = detectDuplicateTransactions(state.transactions);
    setDuplicatesCount(count);
  }, [state.transactions]);
  
  // ארגון העסקאות לפי קבוצות ייבוא
  const imports = React.useMemo(() => {
    // חיפוש עסקאות שיובאו (שיש להן הערה המציינת ייבוא)
    const importedTransactions = state.transactions.filter(
      tx => tx.notes?.includes('יובא מ')
    );
    
    // מיון לפי תאריך יצירה (מהחדש לישן)
    const sortedTransactions = [...importedTransactions].sort(
      (a, b) => {
        // שימוש בתאריך יצירה אם קיים, אחרת בתאריך העסקה
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
        return dateB - dateA;
      }
    );
    
    // קיבוץ עסקאות לפי מקור הייבוא ותאריך
    const groupedImports: Record<string, Transaction[]> = {};
    
    sortedTransactions.forEach(tx => {
      // חילוץ מקור הייבוא מההערות
      const source = tx.notes?.includes('כרטיס אשראי') 
        ? 'כרטיס אשראי' 
        : tx.notes?.includes('אקסל') 
          ? 'קובץ אקסל' 
          : 'ייבוא';
      
      // יצירת מזהה ייחודי לקבוצת הייבוא (תאריך + מקור)
      const importDate = tx.createdAt || tx.date;
      const importId = `${importDate}-${source}`;
      
      if (!groupedImports[importId]) {
        groupedImports[importId] = [];
      }
      
      groupedImports[importId].push(tx);
    });
    
    // המרה למערך
    return Object.entries(groupedImports).map(([key, transactions]) => {
      const [dateStr, source] = key.split('-');
      return {
        date: dateStr,
        source,
        transactions
      };
    }).sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [state.transactions]);
  
  // פונקציה לביטול ייבוא
  const handleCancelImport = () => {
    if (!selectedImport) return;
    
    // מחיקת כל העסקאות בקבוצת הייבוא
    selectedImport.transactions.forEach(tx => {
      deleteTransaction(tx.id);
    });
    
    setShowConfirmDialog(false);
    setSelectedImport(null);
  };
  
  // פורמט תאריך
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy');
    } catch (error) {
      return dateStr;
    }
  };
  
  // פורמט כסף
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };
  
  // הצגת התראה על כפילויות
  const DuplicatesWarning = () => {
    if (duplicatesCount === 0) return null;
    
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 flex items-start gap-2">
        <Info className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-amber-800">זוהו {duplicatesCount} עסקאות כפולות</p>
          <p className="text-sm text-amber-700 mt-1">
            ייתכן שיש עסקאות זהות שהתווספו בטעות. מומלץ לבצע איפוס מערכת וייבוא מחדש של הנתונים.
          </p>
        </div>
      </div>
    );
  };
  
  if (imports.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center py-10 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p>אין היסטוריית ייבוא</p>
            <p className="text-sm mt-1">עסקאות שיובאו מקבצים יופיעו כאן</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>היסטוריית ייבוא</CardTitle>
        </CardHeader>
        <CardContent>
          <DuplicatesWarning />
          
          <div className="space-y-4">
            {imports.map((importGroup, index) => {
              // חישוב סכומי הכנסות והוצאות
              const income = importGroup.transactions
                .filter(tx => tx.type === 'income')
                .reduce((sum, tx) => sum + tx.amount, 0);
              
              const expense = importGroup.transactions
                .filter(tx => tx.type === 'expense')
                .reduce((sum, tx) => sum + tx.amount, 0);
              
              return (
                <div 
                  key={index} 
                  className="p-4 border rounded-lg hover:border-primary/30 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-medium">
                        {importGroup.source} | {formatDate(importGroup.date)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {importGroup.transactions.length} עסקאות
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedImport(importGroup)}
                      >
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                        הצג עסקאות
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          setSelectedImport(importGroup);
                          setShowConfirmDialog(true);
                        }}
                      >
                        <Trash className="h-4 w-4 ml-1" />
                        בטל ייבוא
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-start gap-4 mt-2">
                    <div className="text-finance-income">
                      <span className="text-sm">הכנסות: </span>
                      <span className="font-medium">{formatCurrency(income)}</span>
                    </div>
                    <div className="text-finance-expense">
                      <span className="text-sm">הוצאות: </span>
                      <span className="font-medium">{formatCurrency(expense)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* דיאלוג תצוגת עסקאות */}
      <Dialog open={!!selectedImport && !showConfirmDialog} onOpenChange={open => !open && setSelectedImport(null)}>
        <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>עסקאות מיובאות</DialogTitle>
            <DialogDescription>
              {selectedImport?.source} | {selectedImport?.date && formatDate(selectedImport.date)} | {selectedImport?.transactions.length} עסקאות
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 mt-4">
            <div className="space-y-2">
              {selectedImport?.transactions.map(tx => (
                <div key={tx.id} className="border p-3 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(tx.date)}</p>
                    </div>
                    <p className={tx.type === 'income' ? 'text-finance-income' : 'text-finance-expense'}>
                      {formatCurrency(tx.amount)}
                    </p>
                  </div>
                  {tx.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{tx.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSelectedImport(null)}>
              סגור
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                setShowConfirmDialog(true);
              }}
            >
              בטל ייבוא
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* דיאלוג אישור ביטול */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>אישור ביטול ייבוא</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך לבטל את הייבוא של {selectedImport?.transactions.length} עסקאות?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-md flex gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-300">פעולה זו אינה ניתנת לביטול</p>
                <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                  כל העסקאות שיובאו בייבוא זה יימחקו לצמיתות. ניתן לייבא אותן מחדש מהקובץ המקורי.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
            >
              ביטול
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelImport}
            >
              אני מאשר/ת
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImportHistory;
