
import React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface TransactionFormActionsProps {
  isEditing: boolean;
  onCancel?: () => void;
}

export const TransactionFormActions: React.FC<TransactionFormActionsProps> = ({
  isEditing,
  onCancel,
}) => {
  return (
    <DialogFooter>
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel}>
          ביטול
        </Button>
      )}
      <Button type="submit" className="mr-2">
        {isEditing ? "עדכן" : "הוסף"} עסקה
      </Button>
    </DialogFooter>
  );
};
