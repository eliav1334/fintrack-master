
import { useState, useEffect, useCallback } from 'react';
import { useFinance } from '@/modules/core/finance/FinanceContext';
import { toast } from 'sonner';

export const useBackupManager = () => {
  const [backups, setBackups] = useState<{ key: string; date: string }[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<string>('');
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const { dispatch } = useFinance();

  // Load available backups
  useEffect(() => {
    const loadBackups = () => {
      try {
        const backupsList: { key: string; date: string }[] = [];
        
        // Iterate through localStorage to find backups
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('financeState_')) {
            // Extract date from key
            const dateMatch = key.match(/financeState_daily_backup_(\d{4}-\d{2}-\d{2})/);
            if (dateMatch) {
              backupsList.push({
                key,
                date: dateMatch[1]
              });
            } else if (key.includes('backup')) {
              backupsList.push({
                key,
                date: new Date().toISOString().split('T')[0] // Use today's date if no date in key
              });
            }
          }
        }
        
        // Sort backups by date (newest first)
        backupsList.sort((a, b) => b.date.localeCompare(a.date));
        
        setBackups(backupsList);
        
        // Select the newest backup by default if available
        if (backupsList.length > 0 && !selectedBackup) {
          setSelectedBackup(backupsList[0].key);
        }
      } catch (error) {
        console.error('Error loading backups:', error);
      }
    };
    
    loadBackups();
    
    // Reload backups when dialog opens
    if (showBackupDialog) {
      loadBackups();
    }
  }, [showBackupDialog]);
  
  // Restore from selected backup
  const restoreBackup = useCallback(() => {
    if (!selectedBackup) {
      toast.error('לא נבחר גיבוי לשחזור');
      return;
    }
    
    try {
      const backupData = localStorage.getItem(selectedBackup);
      if (!backupData) {
        toast.error('לא ניתן לקרוא את נתוני הגיבוי');
        return;
      }
      
      const parsedData = JSON.parse(backupData);
      
      // Validate backup data
      if (!parsedData.transactions || !Array.isArray(parsedData.transactions)) {
        toast.error('קובץ הגיבוי פגום');
        return;
      }
      
      // Store current state as an emergency backup
      const currentData = localStorage.getItem('financeState');
      if (currentData) {
        localStorage.setItem('financeState_emergency_backup', currentData);
      }
      
      // Restore data from backup
      localStorage.setItem('financeState', backupData);
      
      // Reset the application state
      dispatch({ type: 'RESET_STATE' });
      
      toast.success('הנתונים שוחזרו בהצלחה');
      setShowBackupDialog(false);
      
      // Reload the page to ensure all components update
      window.location.reload();
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast.error('שגיאה בשחזור נתונים');
    }
  }, [selectedBackup, dispatch]);
  
  return {
    backups,
    showBackupDialog,
    setShowBackupDialog,
    selectedBackup,
    setSelectedBackup,
    restoreBackup
  };
};
