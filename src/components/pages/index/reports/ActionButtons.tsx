
import React from "react";
import { Button } from "@/components/ui/button";
import { RotateCw, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ActionButtonsProps {
  backupsCount: number;
  onShowBackupDialog: () => void;
  onShowResetDialog: () => void;
  isResetting: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  backupsCount,
  onShowBackupDialog,
  onShowResetDialog,
  isResetting
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* כפתור שחזור גיבויים - מוצג רק אם יש גיבויים זמינים */}
      {backupsCount > 0 && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onShowBackupDialog}
          className="flex gap-2 items-center"
        >
          <RotateCw className="h-4 w-4" />
          שחזור מגיבוי ({backupsCount})
        </Button>
      )}
      
      {/* כפתור איפוס המערכת */}
      <Button 
        variant="destructive" 
        size="sm"
        onClick={onShowResetDialog}
        className="flex gap-2 items-center"
        disabled={isResetting}
      >
        <Trash2 className="h-4 w-4" />
        איפוס מערכת מלא
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
  );
};

export default ActionButtons;
