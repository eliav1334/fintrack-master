
import React from "react";
import ActionButtons from "./ActionButtons";
import SystemStats from "./SystemStats";
import BackupDialog from "./BackupDialog";
import ResetDialog from "./ResetDialog";
import ImportBlockInfo from "./ImportBlockInfo";
import { useSystemReset } from "./SystemReset";
import { useBackupManager } from "./BackupManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportContent() {
  const { 
    showResetDialog, 
    setShowResetDialog, 
    isResetting, 
    resetFullSystem,
    enableDataImport,
    isImportBlocked
  } = useSystemReset();
  
  // Adding the backup manager hook
  const {
    backups,
    showBackupDialog,
    setShowBackupDialog,
    selectedBackup,
    setSelectedBackup,
    restoreBackup
  } = useBackupManager();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>סטטיסטיקות מערכת</CardTitle>
          <CardDescription>
            מידע על הנתונים שלך במערכת
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* הוספת רכיב התראת חסימת ייבוא */}
          <ImportBlockInfo 
            onEnableImport={enableDataImport}
          />
          
          <SystemStats />
          <ActionButtons 
            backupsCount={backups.length}
            onShowBackupDialog={() => setShowBackupDialog(true)} 
            onShowResetDialog={() => setShowResetDialog(true)}
            isResetting={isResetting}
          />
        </CardContent>
      </Card>

      {/* עדכון הדיאלוג עם האפשרויות החדשות */}
      <ResetDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        onReset={resetFullSystem}
        isResetting={isResetting}
        enableImport={enableDataImport}
        isImportBlocked={isImportBlocked}
      />
      
      <BackupDialog 
        open={showBackupDialog}
        onOpenChange={setShowBackupDialog}
        backups={backups}
        selectedBackup={selectedBackup}
        onBackupChange={setSelectedBackup}
        onRestore={restoreBackup}
      />
    </div>
  );
}
