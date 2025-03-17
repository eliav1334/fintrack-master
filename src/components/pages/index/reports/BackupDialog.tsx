
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backups: { key: string; date: string }[];
  selectedBackup: string;
  onBackupChange: (value: string) => void;
  onRestore: () => void;
}

const BackupDialog: React.FC<BackupDialogProps> = ({
  open,
  onOpenChange,
  backups,
  selectedBackup,
  onBackupChange,
  onRestore
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>שחזור מגיבוי</DialogTitle>
          <DialogDescription>
            בחר גיבוי לשחזור. שים לב שהנתונים הנוכחיים יוחלפו בנתונים מהגיבוי.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Select value={selectedBackup} onValueChange={onBackupChange}>
            <SelectTrigger>
              <SelectValue placeholder="בחר גיבוי" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-40">
                {backups.map((backup) => (
                  <SelectItem key={backup.key} value={backup.key}>
                    {backup.key.includes("daily") ? `גיבוי יומי: ${backup.date}` : `גיבוי: ${backup.date}`}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button 
            onClick={onRestore}
            disabled={!selectedBackup}
          >
            שחזר גיבוי
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BackupDialog;
