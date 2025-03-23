
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useFinance } from "@/modules/core/finance/FinanceContext";
import { useLocalStorage } from "@/modules/features/storage/useLocalStorage";

interface CleanupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CleanupDialog: React.FC<CleanupDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [months, setMonths] = React.useState<string>("12");
  const { state, addTransactions } = useFinance();
  const { archiveOldTransactions } = useLocalStorage();
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const handleCleanup = () => {
    setIsProcessing(true);
    
    try {
      // ניקוי עסקאות לפי מספר החודשים שנבחר
      const monthsToKeep = parseInt(months);
      const cleanedTransactions = archiveOldTransactions(state.transactions, monthsToKeep);
      
      // עדכון המערכת עם העסקאות החדשות (ללא הישנות)
      if (cleanedTransactions.length !== state.transactions.length) {
        addTransactions(cleanedTransactions);
        
        toast.success(`ניקוי עסקאות הושלם בהצלחה`, {
          description: `${state.transactions.length - cleanedTransactions.length} עסקאות הועברו לארכיון`
        });
      } else {
        toast.info(`לא נמצאו עסקאות להעברה לארכיון`);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("שגיאה בניקוי עסקאות:", error);
      toast.error("שגיאה בניקוי עסקאות");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ניקוי עסקאות ישנות</DialogTitle>
          <DialogDescription>
            העבר עסקאות ישנות לארכיון כדי לשמור על ביצועים מיטביים. עסקאות בארכיון לא יופיעו בתצוגות הרגילות אך ניתן יהיה לשחזר אותן בעתיד.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <label className="text-sm font-medium mb-2 block">שמור עסקאות מ:</label>
          <Select value={months} onValueChange={setMonths}>
            <SelectTrigger>
              <SelectValue placeholder="בחר תקופה" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6 חודשים אחרונים</SelectItem>
              <SelectItem value="12">שנה אחרונה</SelectItem>
              <SelectItem value="24">שנתיים אחרונות</SelectItem>
              <SelectItem value="36">3 שנים אחרונות</SelectItem>
            </SelectContent>
          </Select>
          
          <p className="mt-4 text-sm text-muted-foreground">
            עסקאות מלפני התקופה הנבחרת יועברו לארכיון. פעולה זו אינה מוחקת נתונים.
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button 
            onClick={handleCleanup}
            disabled={isProcessing}
          >
            {isProcessing ? "מעבד..." : "בצע ניקוי"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CleanupDialog;
