import React, { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useFinanceStore } from '@/stores/financeStore'
import { CircleDollarSign, Wallet, PieChart, ArrowDownUp, TrendingUp, AlertCircle, Clock, Home, Utensils, Car, Receipt, Heart, Gamepad2, MoreHorizontal, Book } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

// פונקציה לפורמט של סכום
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS'
  }).format(amount)
}

// פונקציה לתרגום קטגוריות
const translateCategory = (category: string) => {
  return category;
}

const categoryIcons: Record<string, any> = {
  'דיור': <Home className="h-5 w-5 text-blue-500" />,
  'מזון': <Utensils className="h-5 w-5 text-green-500" />,
  'תחבורה': <Car className="h-5 w-5 text-yellow-500" />,
  'חשבונות': <Receipt className="h-5 w-5 text-purple-500" />,
  'בריאות': <Heart className="h-5 w-5 text-red-500" />,
  'בידור': <Gamepad2 className="h-5 w-5 text-pink-500" />,
  'קניות': <Receipt className="h-5 w-5 text-pink-500" />,
  'חינוך': <Book className="h-5 w-5 text-pink-500" />,
  'אחר': <MoreHorizontal className="h-5 w-5 text-gray-500" />
}

const Dashboard: React.FC = () => {
  const { summary, calculateSummary } = useFinanceStore()

  useEffect(() => {
    calculateSummary()
  }, [calculateSummary])

  if (!summary) {
    return (
      <div className="container mx-auto p-4 pb-24">
        <h1 className="text-3xl font-bold">אין נתונים להצגה</h1>
        <p className="text-muted-foreground mt-2">התחל על ידי ייבוא או הוספת עסקאות</p>
      </div>
    )
  }

  const tips = [
    {
      title: 'חיסכון בהוצאות דיור',
      description: 'שקול מחדש את עלויות השכירות או המשכנתא, בדוק אפשרויות למעבר דירה או מיחזור משכנתא',
      icon: TrendingUp,
      color: 'text-blue-500'
    },
    {
      title: 'התראות חריגות',
      description: 'שים לב להוצאות חריגות בקטגוריות השונות ובדוק דרכים לצמצום',
      icon: AlertCircle,
      color: 'text-red-500'
    },
    {
      title: 'תזמון תשלומים',
      description: 'תזמן את התשלומים החודשיים לתחילת החודש כדי להימנע מאיחורים ועמלות',
      icon: Clock,
      color: 'text-green-500'
    }
  ]

  return (
    <div className="container mx-auto p-4 pb-24 space-y-6">
      <header className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">דשבורד פיננסי</h1>
          <p className="text-muted-foreground">נהל את ההוצאות וההכנסות שלך במקום אחד</p>
        </div>
        <div className="flex gap-2">
          <Link to="/import">
            <Button>ייבוא נתונים</Button>
          </Link>
          <Link to="/transactions">
            <Button variant="outline">צפה בעסקאות ({summary.expensesByCategory.reduce((acc, curr) => acc + 1, 0)})</Button>
          </Link>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סה״כ הכנסות</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalIncome)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.monthlyComparison.incomeChange > 0 ? '+' : ''}
              {summary.monthlyComparison.incomeChange.toFixed(1)}% מהחודש שעבר
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סה״כ הוצאות</CardTitle>
            <Wallet className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.monthlyComparison.expenseChange > 0 ? '+' : ''}
              {summary.monthlyComparison.expenseChange.toFixed(1)}% מהחודש שעבר
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">יתרה</CardTitle>
            <ArrowDownUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.balance)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.balance >= 0 ? 'חיובי' : 'שלילי'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הוצאה גדולה</CardTitle>
            <PieChart className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {categoryIcons[summary.largestExpenseCategory.category]}
              <span>{translateCategory(summary.largestExpenseCategory.category)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.largestExpenseCategory.amount)} (
              {summary.largestExpenseCategory.percentage.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>התפלגות הוצאות</CardTitle>
            <CardDescription>התפלגות ההוצאות לפי קטגוריות</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.expensesByCategory.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {categoryIcons[category.category]}
                    <span className="font-medium">{translateCategory(category.category)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{formatCurrency(category.amount)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({category.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>חריגות תקציב</CardTitle>
              <CardDescription>קטגוריות שחרגו מהתקציב החודשי</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.budgetExceptions?.map((exception) => (
                <div key={exception.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {categoryIcons[exception.category]}
                    <span className="font-medium">{translateCategory(exception.category)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-500">
                    <span>חריגה של {formatCurrency(exception.amount)}</span>
                  </div>
                </div>
              ))}
              {(!summary.budgetExceptions || summary.budgetExceptions.length === 0) && (
                <p className="text-muted-foreground">אין חריגות תקציב בחודש הנוכחי</p>
              )}
            </CardContent>
          </Card>

          {tips.map((tip, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                <tip.icon className={`h-5 w-5 ${tip.color}`} />
                <div>
                  <CardTitle className="text-lg">{tip.title}</CardTitle>
                  <CardDescription>{tip.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard 