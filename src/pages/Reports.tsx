import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useFinanceStore } from '@/stores/financeStore'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
]

const Reports: React.FC = () => {
  const { summary, transactions } = useFinanceStore()

  // חישוב מגמות חודשיות לגרף עמודות
  const monthlyData = useMemo(() => {
    const monthsMap = new Map<string, { month: string; הכנסות: number; הוצאות: number }>()

    transactions.forEach(t => {
      const monthKey = format(new Date(t.date), 'yyyy-MM')
      const monthLabel = format(new Date(t.date), 'MMM yyyy', { locale: he })

      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, {
          month: monthLabel,
          הכנסות: 0,
          הוצאות: 0
        })
      }

      const data = monthsMap.get(monthKey)!
      if (t.type === 'income') {
        data.הכנסות += t.amount
      } else {
        data.הוצאות += t.amount
      }
    })

    return Array.from(monthsMap.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // 6 חודשים אחרונים
  }, [transactions])

  // נתונים לגרף עוגה - 5 קטגוריות עליונות
  const pieData = useMemo(() => {
    if (!summary) return []

    return summary.expensesByCategory
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(cat => ({
        name: cat.category,
        value: cat.amount
      }))
  }, [summary])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0
    }).format(value)
  }

  const exportCSV = () => {
    if (!transactions.length) return

    const headers = ['תאריך', 'תיאור', 'קטגוריה', 'סוג', 'סכום', 'הערות']
    const rows = transactions.map(t => [
      format(new Date(t.date), 'dd/MM/yyyy'),
      t.description,
      t.category,
      t.type,
      t.amount.toString(),
      t.notes || ''
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `דוח_עסקאות_${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (!summary) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold">אין נתונים להצגה</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">דוחות וניתוחים</h1>
        <Button onClick={exportCSV} className="gap-2">
          <Download className="h-4 w-4" />
          ייצא ל-CSV
        </Button>
      </div>

      {/* כרטיסי סטטיסטיקה */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">הכנסות חודשיות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalIncome)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.monthlyComparison.incomeChange > 0 ? '+' : ''}
              {summary.monthlyComparison.incomeChange.toFixed(1)}% מחודש שעבר
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">הוצאות חודשיות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.monthlyComparison.expenseChange > 0 ? '+' : ''}
              {summary.monthlyComparison.expenseChange.toFixed(1)}% מחודש שעבר
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">יתרה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.balance >= 0 ? 'חיובי' : 'שלילי'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ממוצע יומי</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalExpenses / 30)}</div>
            <p className="text-xs text-muted-foreground">הוצאות ביום</p>
          </CardContent>
        </Card>
      </div>

      {/* גרפים */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* גרף עוגה - התפלגות הוצאות */}
        <Card>
          <CardHeader>
            <CardTitle>התפלגות הוצאות לפי קטגוריה</CardTitle>
            <CardDescription>5 הקטגוריות עם ההוצאה הגבוהה ביותר</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* גרף עמודות - מגמות חודשיות */}
        <Card>
          <CardHeader>
            <CardTitle>מגמות חודשיות</CardTitle>
            <CardDescription>השוואת הכנסות והוצאות - 6 חודשים אחרונים</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="הכנסות" fill="#10b981" />
                <Bar dataKey="הוצאות" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* פירוט קטגוריות */}
      <Card>
        <CardHeader>
          <CardTitle>פירוט הוצאות לפי קטגוריה</CardTitle>
          <CardDescription>כל הקטגוריות החודש</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.expensesByCategory.map((category) => (
              <div key={category.category}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{category.category}</span>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(category.amount)}</div>
                    <div className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}%</div>
                  </div>
                </div>
                <Progress value={category.percentage} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Reports
