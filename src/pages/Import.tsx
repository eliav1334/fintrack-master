import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useFinanceStore } from '@/stores/financeStore'
import { useToast } from '@/components/ui/use-toast'
import { FileUp, Upload, History } from 'lucide-react'
import { processExcelFile } from '@/services/import/excelImporter'
import { processJsonFile } from '@/services/import/jsonImporter'
import { Button } from '@/components/ui/button'
import ImportHistory from '@/components/ImportHistory'
import { format } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Transaction } from '@/types/finance'
import { generateId } from '@/utils/generateId'

const Import: React.FC = () => {
  const { importTransactions } = useFinanceStore()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'import' | 'history'>('import')
  const [importedTransactions, setImportedTransactions] = useState<Transaction[]>([])

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
            const transactionsWithIds = transactions.map(tx => ({
              ...tx,
              id: generateId('transaction')
            }))
            
            setImportedTransactions(transactionsWithIds)
            
            importTransactions(transactionsWithIds)
            
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

  // פורמט סכום
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount)
  }

  // פונקציה להמרת קטגוריה לעברית
  const translateCategory = (category: string) => {
    const categoryTranslations: Record<string, string> = {
      'housing': 'דיור',
      'food': 'מזון',
      'transportation': 'תחבורה',
      'utilities': 'חשבונות',
      'healthcare': 'בריאות',
      'entertainment': 'בידור',
      'shopping': 'קניות',
      'education': 'חינוך',
      'savings': 'חסכונות',
      'other': 'אחר'
    }
    return categoryTranslations[category] || category
  }

  return (
    <div className="container mx-auto p-4 mt-16">
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant={activeTab === 'import' ? 'default' : 'outline'}
          onClick={() => setActiveTab('import')}
          className="flex items-center"
        >
          <Upload className="h-4 w-4 ml-2" />
          ייבוא חדש
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'outline'}
          onClick={() => setActiveTab('history')}
          className="flex items-center"
        >
          <History className="h-4 w-4 ml-2" />
          היסטוריית ייבוא
        </Button>
      </div>

      {activeTab === 'import' ? (
        <>
          <Card className="max-w-2xl mx-auto mb-6">
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
                        <li>תאריך חיוב</li>
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

          {importedTransactions.length > 0 && (
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>עסקאות ({importedTransactions.length})</CardTitle>
                  <CardDescription>
                    {importedTransactions.length} עסקאות יובאו בהצלחה
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-right">
                        <TableHead>תאריך</TableHead>
                        <TableHead>קטגוריה</TableHead>
                        <TableHead>שם בית עסק</TableHead>
                        <TableHead>סוג</TableHead>
                        <TableHead>סכום</TableHead>
                        <TableHead>סוג עסקה</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importedTransactions.map((tx, index) => (
                        <TableRow key={index} className="text-right">
                          <TableCell>{format(new Date(tx.date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{translateCategory(tx.category)}</TableCell>
                          <TableCell>{tx.businessName || 'לא צוין'}</TableCell>
                          <TableCell>{tx.type === 'income' ? 'הכנסה' : 'הוצאה'}</TableCell>
                          <TableCell className={tx.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(tx.amount)}
                          </TableCell>
                          <TableCell>{tx.transactionType || 'לא צוין'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <ImportHistory />
      )}
    </div>
  )
}

export default Import
