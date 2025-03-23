
import { useState, useCallback } from 'react';
import { useFinance } from '@/modules/core/finance/FinanceContext';
import { toast } from 'sonner';

export const useSystemReset = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { resetState } = useFinance();
  
  // Check if import is blocked
  const isImportBlocked = localStorage.getItem('import_blocked') === 'true';
  
  // Function to reset the system
  const resetFullSystem = useCallback(() => {
    setIsResetting(true);
    
    // Signal that reset is in progress
    localStorage.setItem('reset_in_progress', 'true');
    
    // Simulate a delay for UX purposes
    setTimeout(() => {
      try {
        // Reset state through context
        resetState();
        
        // Clear localStorage items related to the app
        const keysToKeep = ['theme']; // Keys to preserve
        
        // Iterate through localStorage and remove app-related items
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && !keysToKeep.includes(key)) {
            localStorage.removeItem(key);
          }
        }
        
        // Reset complete
        localStorage.removeItem('reset_in_progress');
        toast.success('איפוס המערכת הושלם בהצלחה');
      } catch (error) {
        console.error('שגיאה באיפוס המערכת:', error);
        toast.error('אירעה שגיאה באיפוס המערכת');
        localStorage.removeItem('reset_in_progress');
      } finally {
        setIsResetting(false);
        setShowResetDialog(false);
      }
    }, 1500);
  }, [resetState]);
  
  // Function to enable data import
  const enableDataImport = useCallback(() => {
    localStorage.removeItem('import_blocked');
    toast.success('ייבוא נתונים הופעל מחדש');
  }, []);
  
  return {
    showResetDialog,
    setShowResetDialog,
    isResetting,
    resetFullSystem,
    isImportBlocked,
    enableDataImport
  };
};
