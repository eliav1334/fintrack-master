import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TransactionPreview } from './TransactionPreview';
import { ImportedTransaction } from '@/types/finance';
import { FileService } from '@/services/fileService';

interface FileUploaderProps {
  onImport: (transactions: ImportedTransaction[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onImport }): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transactions, setTransactions] = useState<ImportedTransaction[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileUpload = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) {
      toast.error('לא נבחר קובץ');
      return;
    }

    console.log('התחלת עיבוד קובץ:', file.name);
    setIsLoading(true);
    setProgress(0);

    try {
      // בדיקת תקינות הקובץ
      console.log('מתחיל בדיקת תקינות הקובץ');
      const result = await FileService.validateFile(file);

      if (!result.isValid) {
        console.error('שגיאה בבדיקת תקינות:', result.error);
        toast.error(result.error || 'שגיאה בקריאת הקובץ');
        return;
      }

      console.log('הקובץ תקין, מתחיל בעיבוד');
      setProgress(50);
      
      // עיבוד הקובץ
      const parsedData = await FileService.parseFile(file);
      console.log('סיום עיבוד הקובץ, נמצאו עסקאות:', parsedData.transactions.length);
      setProgress(100);

      if (!parsedData.transactions || parsedData.transactions.length === 0) {
        console.error('לא נמצאו עסקאות בקובץ');
        toast.error('לא נמצאו עסקאות בקובץ');
        return;
      }

      setTransactions(parsedData.transactions);
      setShowPreview(true);
      toast.success(`נמצאו ${parsedData.transactions.length} עסקאות בקובץ`);
    } catch (error) {
      console.error('שגיאה בעיבוד הקובץ:', error);
      const errorMessage = error instanceof Error ? error.message : 'שגיאה בעיבוד הקובץ';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  }, []);

  const handleConfirmImport = useCallback(() => {
    if (!transactions.length) {
      toast.error('אין עסקאות לייבוא');
      return;
    }

    console.log('מייבא עסקאות:', transactions.length);
    onImport(transactions);
    setShowPreview(false);
    setTransactions([]);
    toast.success('העסקאות יובאו בהצלחה');
  }, [transactions, onImport]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    onDropRejected: (fileRejections) => {
      console.error('קובץ נדחה:', fileRejections);
      const error = fileRejections[0]?.errors[0]?.message;
      toast.error(error || 'סוג הקובץ אינו נתמך');
    },
    onError: (error) => {
      console.error('שגיאה בהעלאת הקובץ:', error);
      toast.error('שגיאה בהעלאת הקובץ');
    }
  });

  return (
    <>
      <Card
        {...getRootProps()}
        className={`p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-secondary/10' : ''
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <Upload className="w-12 h-12 text-muted-foreground" />
          {isLoading ? (
            <div className="w-full max-w-xs space-y-4">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">מעבד קובץ...</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-lg font-medium">גרור קובץ לכאן או לחץ לבחירת קובץ</p>
                <p className="text-sm text-muted-foreground mt-1">
                  תומך בקבצי CSV ו-Excel (.xlsx, .xls)
                </p>
              </div>
              <Button variant="outline">בחר קובץ</Button>
            </>
          )}
        </div>
      </Card>

      <TransactionPreview
        open={showPreview}
        onOpenChange={setShowPreview}
        transactions={transactions}
        onConfirmImport={handleConfirmImport}
      />
    </>
  );
};
