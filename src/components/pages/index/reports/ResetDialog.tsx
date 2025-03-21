
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

// קבועים להודעות
const RESET_DIALOG_MESSAGES = {
  TITLE: "איפוס מערכת",
  DESCRIPTION: "פעולה זו תמחק את כל הנתונים במערכת ותחזיר את המערכת למצב הראשוני.",
  WARNING: "כל העסקאות, התקציבים והמיפויים יימחקו אך הגיבויים יישמרו.",
  CONFIRMATION: "האם אתה בטוח שברצונך להמשיך?",
  BUTTONS: {
    ENABLE_IMPORT: "הפעל ייבוא נתונים מחדש",
    CANCEL: "ביטול",
    RESET: "אפס מערכת",
    RESETTING: "מאפס..."
  }
};

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
  // מניעת פעולות נוספות כאשר האיפוס בתהליך
  const handleResetClick = () => {
    if (!isResetting) {
      onReset();
    }
  };
  
  const handleEnableImport = () => {
    if (enableImport && !isResetting) {
      enableImport();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newState) => {
      // מונע סגירה של הדיאלוג כאשר האיפוס בתהליך
      if (isResetting && newState === false) {
        return;
      }
      onOpenChange(newState);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {RESET_DIALOG_MESSAGES.TITLE}
          </DialogTitle>
          <DialogDescription>
            {RESET_DIALOG_MESSAGES.DESCRIPTION}
            <br />
            <strong>{RESET_DIALOG_MESSAGES.WARNING}</strong>
            <br />
            <strong>{RESET_DIALOG_MESSAGES.CONFIRMATION}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {isImportBlocked && enableImport && (
            <Button 
              variant="secondary" 
              onClick={handleEnableImport}
              disabled={isResetting}
              className="w-full sm:w-auto"
            >
              {RESET_DIALOG_MESSAGES.BUTTONS.ENABLE_IMPORT}
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isResetting} 
            className="w-full sm:w-auto"
          >
            {RESET_DIALOG_MESSAGES.BUTTONS.CANCEL}
          </Button>
          <Button 
            variant="destructive"
            onClick={handleResetClick}
            disabled={isResetting}
            className="w-full sm:w-auto"
          >
            {isResetting ? RESET_DIALOG_MESSAGES.BUTTONS.RESETTING : RESET_DIALOG_MESSAGES.BUTTONS.RESET}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetDialog;
