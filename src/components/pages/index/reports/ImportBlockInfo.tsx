
import React, { useState, useEffect, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useImportBlocker } from "@/hooks/finance/storage/useImportBlocker";
import { toast } from "sonner";

// קבועים להודעות
const IMPORT_BLOCK_MESSAGES = {
  TITLE: "ייבוא נתונים חסום",
  DESCRIPTION: "המערכת עברה איפוס לאחרונה או שיש יותר מדי עסקאות (מעל 50,000 עסקאות). " +
               "ניתן לאפשר ייבוא נתונים מחדש בלחיצה על הכפתור למטה. " +
               "האישור יישאר בתוקף למשך 48 שעות.",
  BUTTON_TEXT: "אפשר ייבוא נתונים מחדש"
};

const ImportBlockInfo: React.FC = () => {
  // שימוש ישיר בהוק במקום להעביר דרך props
  const { isImportBlocked, enableDataImport } = useImportBlocker();
  // מצב מקומי למניעת רינדורים מיותרים וטיפול בלופים אפשריים
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  
  // פונקציית עזר ממוקדת לעדכון מצב תצוגת האלרט
  const updateAlertVisibility = useCallback(() => {
    if (isImportBlocked !== showAlert) {
      console.log("עדכון מצב תצוגת אלרט:", isImportBlocked);
      setShowAlert(isImportBlocked);
    }
  }, [isImportBlocked, showAlert]);
  
  // בדיקה של מצב החסימה פעם אחת בטעינה ובכל שינוי
  useEffect(() => {
    updateAlertVisibility();
  }, [isImportBlocked, updateAlertVisibility]);
  
  // אם לא צריך להציג את האלרט, אין מה להציג
  if (!showAlert) return null;
  
  // טיפול בלחיצה על הכפתור עם מניעת לחיצות מרובות
  const handleEnableImport = () => {
    if (buttonDisabled) return;
    
    try {
      // מניעת לחיצות מרובות
      setButtonDisabled(true);
      
      enableDataImport();
      console.log("ImportBlockInfo - import enabled successfully");
      
      // הצגת הודעת הצלחה
      toast.success("ייבוא נתונים הופעל מחדש ל-48 שעות");
      
      // עדכון מצב התצוגה המקומי מיד (לא מחכים לעדכון מ-useImportBlocker)
      setShowAlert(false);
      
      // שחרור נעילת הכפתור לאחר 2 שניות
      setTimeout(() => {
        setButtonDisabled(false);
      }, 2000);
    } catch (error) {
      console.error("ImportBlockInfo - error enabling import:", error);
      toast.error("שגיאה בהפעלת ייבוא נתונים");
      setButtonDisabled(false);
    }
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
            disabled={buttonDisabled}
          >
            {IMPORT_BLOCK_MESSAGES.BUTTON_TEXT}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ImportBlockInfo;
