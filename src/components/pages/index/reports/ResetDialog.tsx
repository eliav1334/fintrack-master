
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReset: () => void;
  isResetting: boolean;
  enableImport?: () => void; // אפשרות לאפשר ייבוא
  isImportBlocked?: boolean; // האם ייבוא חסום
}

const ResetDialog: React.FC<ResetDialogProps> = ({
  open,
  onOpenChange,
  onReset,
  isResetting,
  enableImport,
  isImportBlocked
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            איפוס מערכת
          </DialogTitle>
          <DialogDescription>
            פעולה זו תמחק את כל הנתונים במערכת ותחזיר את המערכת למצב הראשוני.
            <br />
            <strong>כל העסקאות, התקציבים והמיפויים יימחקו אך הגיבויים יישמרו.</strong>
            <br />
            <strong>האם אתה בטוח שברצונך להמשיך?</strong>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {isImportBlocked && enableImport && (
            <Button 
              variant="secondary" 
              onClick={() => {
                enableImport();
                onOpenChange(false);
              }}
              disabled={isResetting}
              className="w-full sm:w-auto"
            >
              הפעל ייבוא נתונים מחדש
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isResetting} className="w-full sm:w-auto">
            ביטול
          </Button>
          <Button 
            variant="destructive"
            onClick={onReset}
            disabled={isResetting}
            className="w-full sm:w-auto"
          >
            {isResetting ? "מאפס..." : "אפס מערכת"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetDialog;
