import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useFinanceStore } from '@/stores/financeStore'
import { useToast } from '@/components/ui/use-toast'
import { FileUp } from 'lucide-react'
import * as XLSX from 'xlsx'
import { ImportedTransaction, TransactionType } from '@/types/finance'

const Import: React.FC = () => {
  const { importTransactions } = useFinanceStore()
  const { toast } = useToast()

  const processExcelFile = (arrayBuffer: ArrayBuffer): ImportedTransaction[] => {
    console.log('Starting Excel file processing')
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    console.log('Excel sheets:', workbook.SheetNames)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false })
    console.log('Parsed Excel data:', jsonData)

    return jsonData.map((row: any) => {
      console.log('Processing row:', row)
      
      // מיפוי שמות העמודות האפשריים
      const possibleDateColumns = ['תאריך', 'תאריך עסקה', 'תאריך רכישה', 'תאריך חיוב']
      const possibleDescColumns = ['תיאור', 'פרטים', 'שם בית עסק', 'פירוט']
      const possibleAmountColumns = ['סכום', 'סכום חיוב', 'חיוב', 'סכום בש"ח']
      const possibleCategoryColumns = ['קטגוריה', 'סוג', 'סיווג']
      const possibleStatusColumns = ['סטטוס', 'מצב']

      // חיפוש ערכים בעמודות לפי השמות האפשריים
      const findValue = (columns: string[]) => {
        const column = Object.keys(row).find(key => 
          columns.some(col => key.includes(col))
        )
        return column ? row[column] : undefined
      }

      const dateStr = findValue(possibleDateColumns)
      const description = findValue(possibleDescColumns)
      const amountStr = findValue(possibleAmountColumns)
      const category = findValue(possibleCategoryColumns)
      const status = findValue(possibleStatusColumns)

      console.log('Found fields:', {
        date: dateStr,
        description,
        amount: amountStr,
        category,
        status
      })

      // טיפול בתאריך
      let date: string
      try {
        if (typeof dateStr === 'string') {
          // ניסיון לפרסר תאריך בפורמט DD/MM/YYYY
          const parts = dateStr.split('/')
          if (parts.length === 3) {
            date = new Date(+parts[2], +parts[1] - 1, +parts[0]).toISOString()
          } else {
            date = new Date(dateStr).toISOString()
          }
        } else {
          date = new Date().toISOString()
        }
      } catch (error) {
        console.warn('Failed to parse date:', dateStr)
        date = new Date().toISOString()
      }

      // טיפול בסכום
      let amount = 0
      try {
        if (amountStr) {
          // הסרת תווים מיוחדים והמרה למספר
          const cleanAmount = amountStr.toString()
            .replace(/[^\d.-]/g, '')
            .replace(/,/g, '')
          amount = Number(cleanAmount)
        }
      } catch (error) {
        console.warn('Failed to parse amount:', amountStr)
      }

      // קביעת סוג העסקה
      const type = amount >= 0 ? 'income' : 'expense'
      amount = Math.abs(amount)

      const transaction: ImportedTransaction = {
        description: description || '',
        amount,
        date,
        category: category || 'other',
        type: type as TransactionType,
        status: status || 'completed'
      }

      console.log('Created transaction:', transaction)
      return transaction
    }).filter(t => {
      if (!t.description || t.amount === 0) {
        console.warn('Filtered out transaction:', t)
        return false
      }
      return true
    })
  }

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
            console.log('Processing JSON file')
            transactions = JSON.parse(reader.result as string)
          } else {
            console.log('Processing Excel file')
            transactions = processExcelFile(reader.result as ArrayBuffer)
          }
          
          console.log('Processed transactions:', transactions)
          
          if (transactions && transactions.length > 0) {
            console.log('Importing transactions:', transactions.length)
            importTransactions(transactions)
            toast({
              title: 'ייבוא הצליח',
              description: `יובאו ${transactions.length} עסקאות בהצלחה`,
              duration: 3000 // ההודעה תעלם אחרי 3 שניות
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
