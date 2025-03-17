
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useFinance } from "@/contexts/FinanceContext";
import { RotateCw, Trash2, RefreshCw, AlertTriangle } from "lucide-react";
import { useMonthlyIncomes } from "@/hooks/finance/useMonthlyIncomes";

interface ReportsContentProps {
  handleAddTransaction?: () => void;
  handleNavigateToBudgets?: () => void;
}

const ReportsContent = ({ handleAddTransaction, handleNavigateToBudgets }: ReportsContentProps) => {
  const [backups, setBackups] = useState<{key: string, date: string}[]>([]);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string>("");
  const { resetState, state } = useFinance();
  const { resetAllStoredData } = useMonthlyIncomes();
  
  // לבדוק אם יש גיבויים זמינים
  useEffect(() => {
    loadBackups();
  }, []);
  
  // פונקציה לטעינת גיבויים
  const loadBackups = () => {
    const availableBackups: {key: string, date: string}[] = [];
    
    // בדיקת כל המפתחות ב-localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("financeState_backup_") || key.startsWith("financeState_daily_backup_"))) {
        // חילוץ תאריך הגיבוי מהמפתח
        let date = "לא ידוע";
        
        if (key.startsWith("financeState_daily_backup_")) {
          date = key.replace("financeState_daily_backup_", "");
        } else {
          try {
            const timestamp = key.replace("financeState_backup_", "");
            date = new Date(timestamp).toLocaleString("he-IL");
          } catch (e) {
            console.error("שגיאה בפרסור תאריך גיבוי:", e);
          }
        }
        
        availableBackups.push({key, date});
      }
    }
    
    // מיון הגיבויים מהחדש לישן
    availableBackups.sort((a, b) => b.key.localeCompare(a.key));
    setBackups(availableBackups);
  };
  
  const restoreBackup = () => {
    if (!selectedBackup) return;
    
    try {
      const backupData = localStorage.getItem(selectedBackup);
      if (!backupData) {
        toast.error("לא נמצא גיבוי לשחזור");
        return;
      }
      
      // שמירת הנתונים הנוכחיים כגיבוי לפני השחזור
      const currentData = localStorage.getItem("financeState");
      if (currentData) {
        const timestamp = new Date().toISOString();
        localStorage.setItem(`financeState_before_restore_${timestamp}`, currentData);
      }
      
      // שחזור הגיבוי
      localStorage.setItem("financeState", backupData);
      
      // איפוס המצב הנוכחי כדי שיטען מחדש מהגיבוי
      resetState();
      
      toast.success("הגיבוי שוחזר בהצלחה", {
        description: "הנתונים שוחזרו מהגיבוי. האפליקציה תתרענן."
      });
      
      // רענון הדף לאחר השחזור
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
      setShowBackupDialog(false);
    } catch (error) {
      console.error("שגיאה בשחזור גיבוי:", error);
      toast.error("שגיאה בשחזור הגיבוי", {
        description: "לא ניתן היה לשחזר את הגיבוי. נסה שוב."
      });
    }
  };
  
  // פונקציה לאיפוס מלא של המערכת
  const resetFullSystem = () => {
    try {
      setIsResetting(true);
      
      // מציג הודעת טעינה
      toast.loading("מאפס את המערכת...");
      
      // שלב 1: מחיקת כל הנתונים ב-localStorage
      const resetSuccess = resetAllStoredData();
      
      if (!resetSuccess) {
        throw new Error("שגיאה באיפוס נתוני LocalStorage");
      }
      
      // שלב 2: איפוס ה-state במערכת
      resetState();
      
      // שלב 3: הודעה למשתמש
      toast.success("המערכת אופסה בהצלחה", {
        description: "כל הנתונים נמחקו. האפליקציה תתרענן עם נתונים ראשוניים בלבד."
      });
      
      // רענון הדף לאחר האיפוס
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
      setShowResetDialog(false);
    } catch (error) {
      console.error("שגיאה באיפוס המערכת:", error);
      toast.error("שגיאה באיפוס המערכת", {
        description: "לא ניתן היה לאפס את המערכת. נסה שוב או פנה לתמיכה טכנית."
      });
    } finally {
      setIsResetting(false);
      toast.dismiss();
    }
  };
  
  // סטטיסטיקה על המערכת
  const systemStats = {
    transactions: state.transactions.length,
    budgets: state.budgets.length,
    categories: state.categories.length,
    mappings: state.categoryMappings.length,
  };
  
  return (
    <div className="w-full py-6">
      <div className="mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">דוחות</h1>
            <p className="text-muted-foreground">
              צפה וייצא דוחות פיננסיים
            </p>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold leading-none tracking-tight mb-4">
              סטטיסטיקות מערכת
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-2xl font-bold">{systemStats.transactions}</span>
                <span className="text-sm text-muted-foreground">עסקאות</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-2xl font-bold">{systemStats.budgets}</span>
                <span className="text-sm text-muted-foreground">תקציבים</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-2xl font-bold">{systemStats.categories}</span>
                <span className="text-sm text-muted-foreground">קטגוריות</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-2xl font-bold">{systemStats.mappings}</span>
                <span className="text-sm text-muted-foreground">מיפויי קטגוריות</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-6">
            {/* כפתור שחזור גיבויים - מוצג רק אם יש גיבויים זמינים */}
            {backups.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowBackupDialog(true)}
                className="flex gap-2 items-center"
              >
                <RotateCw className="h-4 w-4" />
                שחזור מגיבוי ({backups.length})
              </Button>
            )}
            
            {/* כפתור איפוס המערכת */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowResetDialog(true)}
              className="flex gap-2 items-center text-destructive hover:text-destructive"
              disabled={isResetting}
            >
              <Trash2 className="h-4 w-4" />
              איפוס מערכת
            </Button>
            
            {/* כפתור ניקוי כפילויות */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                toast.info("הפונקציה תתווסף בקרוב");
              }}
              className="flex gap-2 items-center"
            >
              <RefreshCw className="h-4 w-4" />
              ניקוי כפילויות
            </Button>
          </div>
          
          {/* תוכן הדוחות יבוא כאן */}
          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-lg font-semibold leading-none tracking-tight">
                  דוחות זמינים בקרוב
                </h3>
                <p className="text-sm text-muted-foreground">
                  דוחות פיננסיים יהיו זמינים בקרוב. עקוב אחר העדכונים.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* דיאלוג שחזור גיבוי */}
      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>שחזור מגיבוי</DialogTitle>
            <DialogDescription>
              בחר גיבוי לשחזור. שים לב שהנתונים הנוכחיים יוחלפו בנתונים מהגיבוי.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select value={selectedBackup} onValueChange={setSelectedBackup}>
              <SelectTrigger>
                <SelectValue placeholder="בחר גיבוי" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-40">
                  {backups.map((backup) => (
                    <SelectItem key={backup.key} value={backup.key}>
                      {backup.key.includes("daily") ? `גיבוי יומי: ${backup.date}` : `גיבוי: ${backup.date}`}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBackupDialog(false)}>
              ביטול
            </Button>
            <Button 
              onClick={restoreBackup}
              disabled={!selectedBackup}
            >
              שחזר גיבוי
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* דיאלוג איפוס מערכת */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              איפוס מערכת
            </DialogTitle>
            <DialogDescription>
              פעולה זו תמחק את כל הנתונים במערכת ותחזיר את המערכת למצב הראשוני.
              <br />
              <strong>כל העסקאות, התקציבים והמיפויים יימחקו.</strong>
              <br />
              <strong>האם אתה בטוח שברצונך להמשיך?</strong>
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)} disabled={isResetting}>
              ביטול
            </Button>
            <Button 
              variant="destructive"
              onClick={resetFullSystem}
              disabled={isResetting}
            >
              {isResetting ? "מאפס..." : "אפס מערכת"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsContent;
