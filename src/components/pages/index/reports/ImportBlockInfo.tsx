
import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useImportBlocker } from "@/hooks/finance/storage/useImportBlocker";

// קבועים להודעות
const IMPORT_BLOCK_MESSAGES = {
  TITLE: "ייבוא נתונים חסום",
  DESCRIPTION: "המערכת עברה איפוס לאחרונה או שיש יותר מדי עסקאות (מעל 50,000 עסקאות). " +
               "ניתן לאפשר ייבוא נתונים מחדש בלחיצה על הכפתור למטה. " +
               "האישור יישאר בתוקף למשך 48 שעות.",
  BUTTON_TEXT: "אפשר ייבוא נתונים מחדש"
};

interface ImportBlockInfoProps {
  onEnableImport: () => void;
}

const ImportBlockInfo: React.FC<ImportBlockInfoProps> = ({ onEnableImport }) => {
  // שימוש בהוק החדש לניהול מצב החסימה
  const { checkImportBlockStatus } = useImportBlocker();
  
  // שמירת מצב התצוגה בקומפוננטה
  const [showAlert, setShowAlert] = useState<boolean>(false);
  
  // בדיקת מצב החסימה בטעינה ובכל רענון
  useEffect(() => {
    const isBlocked = checkImportBlockStatus();
    setShowAlert(isBlocked);
    
    // התחלת מעקב בזמן אמת אחר שינויים ב-localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "data_import_blocked" || e.key === null) {
        const currentBlockStatus = checkImportBlockStatus();
        setShowAlert(currentBlockStatus);
      }
    };
    
    // הוספת מאזין לשינויים ב-localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // ניקוי המאזין בסיום
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkImportBlockStatus]);
  
  // אם לא צריך להציג את האלרט, אין מה להציג
  if (!showAlert) return null;
  
  // טיפול בלחיצה על הכפתור - מפעיל את הפונקציה החיצונית ומסתיר את האלרט
  const handleEnableImport = () => {
    onEnableImport();
    setShowAlert(false);
    console.log("ImportBlockInfo - import enabled, hiding alert");
  };
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{IMPORT_BLOCK_MESSAGES.TITLE}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          {IMPORT_BLOCK_MESSAGES.DESCRIPTION}
        </p>
        <div className="flex justify-end mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEnableImport}
            className="text-sm"
          >
            {IMPORT_BLOCK_MESSAGES.BUTTON_TEXT}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ImportBlockInfo;
