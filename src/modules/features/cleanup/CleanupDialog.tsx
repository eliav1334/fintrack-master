
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useFinance } from "@/modules/core/finance/FinanceContext";
import { toast } from "sonner";
import { useLocalStorage } from "@/modules/features/storage/useLocalStorage";

// קבועים להודעות
const CLEANUP_DIALOG_MESSAGES = {
  TITLE: "ניקוי עסקאות",
  DESCRIPTION: "פעולה זו תזהה ותסיר עסקאות כפולות במערכת, וכן תעביר עסקאות ישנות לארכיון.",
  WARNING: "מומלץ לגבות את הנתונים לפני ביצוע פעולה זו.",
  OPTIONS: {
    TITLE: "אפשרויות ניקוי",
    DUPLICATES: "הסרת עסקאות כפולות",
    ARCHIVE: "העברת עסקאות ישנות לארכיון (שומר רק 12 חודשים אחרונים)"
  },
  BUTTONS: {
    CANCEL: "ביטול",
    CLEAN: "בצע ניקוי",
    CLEANING: "מנקה..."
  },
  RESULTS: {
    SUCCESS: "הניקוי הושלם בהצלחה",
    REMOVED_DUPLICATES: "הוסרו {0} עסקאות כפולות",
    ARCHIVED: "הועברו {1} עסקאות ישנות לארכיון"
  }
};

interface CleanupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CleanupDialog: React.FC<CleanupDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [isCleaning, setIsCleaning] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [archiveOld, setArchiveOld] = useState(false);
  const { state, addTransactions } = useFinance();
  const { removeDuplicateTransactions, archiveOldTransactions } = useLocalStorage();
  
  const handleCleanup = async () => {
    try {
      setIsCleaning(true);
      toast.loading("מבצע ניקוי נתונים...");
      
      let removedCount = 0;
      let archivedCount = 0;
      let newTransactions = [...state.transactions];
      
      // הסרת עסקאות כפולות
      if (removeDuplicates) {
        const originalCount = newTransactions.length;
        newTransactions = removeDuplicateTransactions(newTransactions);
        removedCount = originalCount - newTransactions.length;
      }
      
      // ארכוב עסקאות ישנות
      if (archiveOld) {
        const originalCount = newTransactions.length;
        newTransactions = archiveOldTransactions(newTransactions, 12); // שומר עסקאות מ-12 חודשים אחרונים
        archivedCount = originalCount - newTransactions.length;
      }
      
      // הוספת עיכוב קצר לתצוגת טעינה
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // עדכון ה-state רק אם יש שינוי
      if (removedCount > 0 || archivedCount > 0) {
        addTransactions(newTransactions);
        
        toast.success(CLEANUP_DIALOG_MESSAGES.RESULTS.SUCCESS, {
          description: 
            CLEANUP_DIALOG_MESSAGES.RESULTS.REMOVED_DUPLICATES.replace("{0}", removedCount.toString()) + 
            ", " + 
            CLEANUP_DIALOG_MESSAGES.RESULTS.ARCHIVED.replace("{1}", archivedCount.toString())
        });
      } else {
        toast.success("הניקוי הושלם", {
          description: "לא נמצאו נתונים לניקוי"
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("שגיאה בניקוי נתונים:", error);
      toast.error("שגיאה בניקוי נתונים", {
        description: "אירעה שגיאה בתהליך הניקוי. נסה שוב מאוחר יותר."
      });
    } finally {
      setIsCleaning(false);
      toast.dismiss();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newState) => {
      // מונע סגירה של הדיאלוג כאשר הניקוי בתהליך
      if (isCleaning && newState === false) {
        return;
      }
      onOpenChange(newState);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            {CLEANUP_DIALOG_MESSAGES.TITLE}
          </DialogTitle>
          <DialogDescription>
            {CLEANUP_DIALOG_MESSAGES.DESCRIPTION}
            <br />
            <span className="text-amber-500 flex items-center gap-1 mt-2">
              <AlertTriangle className="h-4 w-4" />
              {CLEANUP_DIALOG_MESSAGES.WARNING}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <h4 className="text-sm font-medium mb-2">{CLEANUP_DIALOG_MESSAGES.OPTIONS.TITLE}</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
                disabled={isCleaning}
              />
              <span>{CLEANUP_DIALOG_MESSAGES.OPTIONS.DUPLICATES}</span>
            </label>
            <label className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                checked={archiveOld}
                onChange={(e) => setArchiveOld(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
                disabled={isCleaning}
              />
              <span>{CLEANUP_DIALOG_MESSAGES.OPTIONS.ARCHIVE}</span>
            </label>
          </div>
        </div>
        
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isCleaning} 
            className="w-full sm:w-auto"
          >
            {CLEANUP_DIALOG_MESSAGES.BUTTONS.CANCEL}
          </Button>
          <Button 
            variant="default"
            onClick={handleCleanup}
            disabled={isCleaning || (!removeDuplicates && !archiveOld)}
            className="w-full sm:w-auto"
          >
            {isCleaning ? CLEANUP_DIALOG_MESSAGES.BUTTONS.CLEANING : CLEANUP_DIALOG_MESSAGES.BUTTONS.CLEAN}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CleanupDialog;
