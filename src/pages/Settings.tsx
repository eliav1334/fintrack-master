import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useFinanceStore } from '@/stores/financeStore'
import { useToast } from '@/components/ui/use-toast'

const Settings: React.FC = () => {
  const { exportData, importData } = useFinanceStore()
  const { toast } = useToast()

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: 'ייצוא הצליח',
      description: 'הנתונים יוצאו בהצלחה',
    })
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        importData(data)
      } catch (error) {
        console.error('Error importing data:', error)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">הגדרות</h1>
        <p className="text-muted-foreground">התאם את המערכת לצרכים שלך</p>
      </header>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>הגדרות כלליות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">התראות</Label>
              <Switch id="notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode">מצב כהה</Label>
              <Switch id="darkMode" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>גיבוי ושחזור</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                ייצא את כל הנתונים שלך לקובץ JSON שתוכל לשמור כגיבוי או להעביר למכשיר אחר.
              </p>
              <Button onClick={handleExport}>ייצא נתונים</Button>
            </div>
            <div>
              <Input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>הגדרות תקציב</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="monthlyBudget">תקציב חודשי</Label>
              <Input
                id="monthlyBudget"
                type="number"
                placeholder="הכנס סכום"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="savingsGoal">יעד חיסכון</Label>
              <Input
                id="savingsGoal"
                type="number"
                placeholder="הכנס סכום"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Settings 