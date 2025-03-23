
import React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Database, Archive, Trash2 } from "lucide-react";

interface ActionButtonsProps {
  onShowBackupDialog: () => void;
  onShowResetDialog: () => void;
  onShowCleanupDialog: () => void;
  backupsCount: number;
  isResetting: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onShowBackupDialog,
  onShowResetDialog,
  onShowCleanupDialog,
  backupsCount,
  isResetting
}) => {
  return (
    <div className="space-y-3 pt-4">
      <h3 className="text-lg font-semibold">פעולות מערכת</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="flex items-center gap-2 justify-center"
          onClick={onShowBackupDialog}
          disabled={backupsCount === 0}
        >
          <Database className="w-4 h-4" />
          <span>שחזור מגיבוי {backupsCount > 0 ? `(${backupsCount})` : ""}</span>
        </Button>
        
        <Button
          variant="outline"
          className="flex items-center gap-2 justify-center"
          onClick={onShowCleanupDialog}
        >
          <Archive className="w-4 h-4" />
          <span>ניקוי עסקאות</span>
        </Button>
        
        <Button
          variant="destructive"
          className="flex items-center gap-2 justify-center"
          onClick={onShowResetDialog}
          disabled={isResetting}
        >
          <RotateCcw className="w-4 h-4" />
          <span>איפוס מערכת</span>
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground mt-2">
        פעולות אלו משפיעות על הנתונים שלך. מומלץ לגבות את הנתונים לפני ביצוע פעולות אלו.
      </p>
    </div>
  );
};

export default ActionButtons;
