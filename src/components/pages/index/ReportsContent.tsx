
import { useEffect } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { 
  SystemStats, 
  ActionButtons, 
  ReportContent, 
  BackupDialog, 
  ResetDialog,
  useBackupManager,
  useSystemReset
} from "./reports";

interface ReportsContentProps {
  handleAddTransaction?: () => void;
  handleNavigateToBudgets?: () => void;
}

const ReportsContent = ({ handleAddTransaction, handleNavigateToBudgets }: ReportsContentProps) => {
  const { state } = useFinance();
  
  // Custom hooks for backup and reset functionality
  const { 
    backups, 
    showBackupDialog, 
    setShowBackupDialog, 
    selectedBackup, 
    setSelectedBackup, 
    restoreBackup 
  } = useBackupManager();
  
  const {
    showResetDialog,
    setShowResetDialog,
    isResetting,
    resetFullSystem
  } = useSystemReset();
  
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
          
          {/* System Statistics Component */}
          <SystemStats />
          
          {/* Action Buttons Component */}
          <ActionButtons
            backupsCount={backups.length}
            onShowBackupDialog={() => setShowBackupDialog(true)}
            onShowResetDialog={() => setShowResetDialog(true)}
            isResetting={isResetting}
          />
          
          {/* Report Content Component */}
          <ReportContent />
        </div>
      </div>
      
      {/* Backup Dialog Component */}
      <BackupDialog
        open={showBackupDialog}
        onOpenChange={setShowBackupDialog}
        backups={backups}
        selectedBackup={selectedBackup}
        onBackupChange={setSelectedBackup}
        onRestore={restoreBackup}
      />
      
      {/* Reset Dialog Component */}
      <ResetDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        onReset={resetFullSystem}
        isResetting={isResetting}
      />
    </div>
  );
};

export default ReportsContent;
