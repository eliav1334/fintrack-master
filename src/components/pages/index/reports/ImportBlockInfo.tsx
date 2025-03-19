
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSystemReset } from "@/hooks/finance/storage/useSystemReset";

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
      <AlertTitle>ייבוא נתונים חסום</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          המערכת עברה איפוס לאחרונה או שיש יותר מדי נתונים (מעל 10,000 עסקאות).
          זו הגבלה שנועדה לשמור על ביצועי המערכת.
        </p>
        <div className="flex justify-end mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEnableImport}
            className="text-sm"
          >
            אפשר ייבוא נתונים מחדש
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ImportBlockInfo;
