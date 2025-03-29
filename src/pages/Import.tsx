import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useFinanceStore } from '@/stores/financeStore'
import { useToast } from '@/components/ui/use-toast'
import { FileUp } from 'lucide-react'
import { processExcelFile } from '@/services/import/excelImporter'
import { processJsonFile } from '@/services/import/jsonImporter'

const Import: React.FC = () => {
  const { importTransactions } = useFinanceStore()
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => toast({
        title: 'שגיאה',
        description: 'קריאת הקובץ הופסקה',
        variant: 'destructive',
        duration: 3000
      })

      reader.onerror = () => toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בקריאת הקובץ',
        variant: 'destructive',
        duration: 3000
      })

      reader.onload = () => {
        try {
          console.log('File loaded:', file.name)
          let transactions
          
          if (file.name.endsWith('.json')) {
            transactions = processJsonFile(reader.result as string)
          } else {
            transactions = processExcelFile(reader.result as ArrayBuffer)
          }
          
          if (transactions && transactions.length > 0) {
            importTransactions(transactions)
            toast({
              title: 'ייבוא הצליח',
              description: `יובאו ${transactions.length} עסקאות בהצלחה`,
              duration: 3000
            })
          } else {
            toast({
              title: 'שגיאה',
              description: 'לא נמצאו עסקאות בקובץ',
              variant: 'destructive',
              duration: 3000
            })
          }
        } catch (error) {
          console.error('Error importing file:', error)
          toast({
            title: 'שגיאה',
            description: 'הקובץ אינו בפורמט תקין',
            variant: 'destructive',
            duration: 3000
          })
        }
      }

      if (file.name.endsWith('.json')) {
        reader.readAsText(file)
      } else {
        reader.readAsArrayBuffer(file)
      }
    })
  }, [importTransactions, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  })

  return (
    <div className="container mx-auto p-4 mt-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>ייבוא נתונים</CardTitle>
          <CardDescription>
            גרור קובץ אקסל או JSON או לחץ כדי לבחור קובץ לייבוא
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8
              text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary'}
            `}
          >
            <input {...getInputProps()} />
            <FileUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg">שחרר את הקובץ כאן</p>
            ) : (
              <div className="space-y-2">
                <p className="text-lg">גרור קובץ לכאן או לחץ לבחירת קובץ</p>
                <p className="text-sm text-muted-foreground">
                  הקובץ יכול להיות בפורמט Excel (.xlsx, .xls) או JSON
                </p>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p className="font-semibold mb-2">מבנה קובץ האקסל הנדרש:</p>
                  <ul className="list-disc list-inside space-y-1 text-right">
                    <li>תאריך עסקה/בית העסק</li>
                    <li>שם בית העסק</li>
                    <li>סכום חיוב</li>
                    <li>קטגוריה</li>
                    <li>סטטוס</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Import
