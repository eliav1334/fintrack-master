
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// קבועים להודעות
const IMPORT_BLOCK_MESSAGES = {
  TITLE: "ייבוא נתונים חסום",
  DESCRIPTION: "המערכת עברה איפוס לאחרונה או שיש יותר מדי נתונים (מעל 50,000 עסקאות). " +
               "ניתן לאפשר ייבוא נתונים מחדש בלחיצה על הכפתור למטה. " +
               "האישור יישאר בתוקף למשך 48 שעות.",
  BUTTON_TEXT: "אפשר ייבוא נתונים מחדש"
};

interface ImportBlockInfoProps {
  onEnableImport: () => void;
  isBlocked: boolean;
}

const ImportBlockInfo: React.FC<ImportBlockInfoProps> = ({ 
  onEnableImport,
  isBlocked
}) => {
  if (!isBlocked) return null;
  
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
            onClick={onEnableImport}
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
