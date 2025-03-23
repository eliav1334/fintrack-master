
import React from "react";
import ActionButtons from "@/components/pages/index/reports/ActionButtons";
import SystemStats from "@/components/pages/index/reports/SystemStats";
import BackupDialog from "@/components/pages/index/reports/BackupDialog";
import ResetDialog from "@/components/pages/index/reports/ResetDialog";
import ImportBlockInfo from "@/components/pages/index/reports/ImportBlockInfo";
import { useSystemReset } from "@/modules/features/storage/useSystemReset";
import { useBackupManager } from "./BackupManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CleanupDialog from "@/modules/features/cleanup/CleanupDialog";
import { useCleanupManager } from "@/modules/features/cleanup/useCleanupManager";

export const ReportContent: React.FC = () => {
  // שימוש בהוקים לניהול מצב המערכת
  const { 
    showResetDialog, 
    setShowResetDialog, 
    isResetting, 
    resetFullSystem,
    isImportBlocked,
    enableDataImport
  } = useSystemReset();
  
  // הוק ניהול גיבויים
  const {
    backups,
    showBackupDialog,
    setShowBackupDialog,
    selectedBackup,
    setSelectedBackup,
    restoreBackup
  } = useBackupManager();
  
  // הוק ניהול ניקוי נתונים
  const {
    showCleanupDialog,
    setShowCleanupDialog
  } = useCleanupManager();

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
          {/* ImportBlockInfo משתמש ישירות ב-useImportBlocker ואין צורך בפרופס */}
          <ImportBlockInfo />
          
          <SystemStats />
          <ActionButtons 
            backupsCount={backups.length}
            onShowBackupDialog={() => setShowBackupDialog(true)} 
            onShowResetDialog={() => setShowResetDialog(true)}
            onShowCleanupDialog={() => setShowCleanupDialog(true)}
            isResetting={isResetting}
          />
        </CardContent>
      </Card>

      {/* דיאלוגים למשימות מערכת */}
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
      
      <CleanupDialog
        open={showCleanupDialog}
        onOpenChange={setShowCleanupDialog}
      />
    </div>
  );
};

export default ReportContent;
