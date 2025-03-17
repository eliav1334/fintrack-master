
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useFinance } from "@/contexts/FinanceContext";

export const useBackupManager = () => {
  const [backups, setBackups] = useState<{key: string, date: string}[]>([]);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string>("");
  const { resetState } = useFinance();

  // לבדוק אם יש גיבויים זמינים
  useEffect(() => {
    loadBackups();
  }, []);
  
  // פונקציה לטעינת גיבויים
  const loadBackups = () => {
    const availableBackups: {key: string, date: string}[] = [];
    
    // בדיקת כל המפתחות ב-localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("financeState_backup_") || key.startsWith("financeState_daily_backup_"))) {
        // חילוץ תאריך הגיבוי מהמפתח
        let date = "לא ידוע";
        
        if (key.startsWith("financeState_daily_backup_")) {
          date = key.replace("financeState_daily_backup_", "");
        } else {
          try {
            const timestamp = key.replace("financeState_backup_", "");
            date = new Date(timestamp).toLocaleString("he-IL");
          } catch (e) {
            console.error("שגיאה בפרסור תאריך גיבוי:", e);
          }
        }
        
        availableBackups.push({key, date});
      }
    }
    
    // מיון הגיבויים מהחדש לישן
    availableBackups.sort((a, b) => b.key.localeCompare(a.key));
    setBackups(availableBackups);
  };
  
  const restoreBackup = () => {
    if (!selectedBackup) return;
    
    try {
      const backupData = localStorage.getItem(selectedBackup);
      if (!backupData) {
        toast.error("לא נמצא גיבוי לשחזור");
        return;
      }
      
      // שמירת הנתונים הנוכחיים כגיבוי לפני השחזור
      const currentData = localStorage.getItem("financeState");
      if (currentData) {
        const timestamp = new Date().toISOString();
        localStorage.setItem(`financeState_before_restore_${timestamp}`, currentData);
      }
      
      // שחזור הגיבוי
      localStorage.setItem("financeState", backupData);
      
      // איפוס המצב הנוכחי כדי שיטען מחדש מהגיבוי
      resetState();
      
      toast.success("הגיבוי שוחזר בהצלחה", {
        description: "הנתונים שוחזרו מהגיבוי. האפליקציה תתרענן."
      });
      
      // רענון הדף לאחר השחזור
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
      setShowBackupDialog(false);
    } catch (error) {
      console.error("שגיאה בשחזור גיבוי:", error);
      toast.error("שגיאה בשחזור הגיבוי", {
        description: "לא ניתן היה לשחזר את הגיבוי. נסה שוב."
      });
    }
  };

  return {
    backups,
    showBackupDialog,
    setShowBackupDialog,
    selectedBackup,
    setSelectedBackup,
    restoreBackup
  };
};
