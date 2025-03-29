import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFinanceStore } from '@/stores/financeStore'
import { Progress } from '@/components/ui/progress'

const categoryTranslations: Record<string, string> = {
  'income': 'הכנסה',
  'housing': 'דיור',
  'food': 'מזון',
  'transportation': 'תחבורה',
  'utilities': 'חשבונות',
  'healthcare': 'בריאות',
  'entertainment': 'בידור',
  'other': 'אחר'
}

const Reports: React.FC = () => {
  const { summary } = useFinanceStore()

  if (!summary) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold">אין נתונים להצגה</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>סיכום חודשי</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>הכנסות</span>
                <span className="text-green-600">₪{summary.totalIncome.toLocaleString()}</span>
              </div>
              <Progress value={(summary.totalIncome / (summary.totalIncome + summary.totalExpenses)) * 100} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>הוצאות</span>
                <span className="text-red-600">₪{summary.totalExpenses.toLocaleString()}</span>
              </div>
              <Progress value={(summary.totalExpenses / (summary.totalIncome + summary.totalExpenses)) * 100} />
            </div>
            <div className="pt-4">
              <div className="flex justify-between font-bold">
                <span>יתרה</span>
                <span className={summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ₪{summary.balance.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>השוואה לחודש קודם</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>שינוי בהכנסות</span>
                <span className={summary.monthlyComparison.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {summary.monthlyComparison.incomeChange > 0 ? '+' : ''}
                  {summary.monthlyComparison.incomeChange.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={50 + (summary.monthlyComparison.incomeChange / 2)}
                className={summary.monthlyComparison.incomeChange >= 0 ? 'bg-green-200' : 'bg-red-200'}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>שינוי בהוצאות</span>
                <span className={summary.monthlyComparison.expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}>
                  {summary.monthlyComparison.expenseChange > 0 ? '+' : ''}
                  {summary.monthlyComparison.expenseChange.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={50 + (summary.monthlyComparison.expenseChange / 2)}
                className={summary.monthlyComparison.expenseChange <= 0 ? 'bg-green-200' : 'bg-red-200'}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>התפלגות הוצאות לפי קטגוריה</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.expensesByCategory.map((category) => (
              <div key={category.category}>
                <div className="flex justify-between mb-2">
                  <span>{categoryTranslations[category.category] || category.category}</span>
                  <div className="text-right">
                    <div>₪{category.amount.toLocaleString()}</div>
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