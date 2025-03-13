
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BudgetAlertItem {
  categoryName: string;
  current: number;
  limit: number;
  percentage: number;
}

interface BudgetAlertCardProps {
  alerts: BudgetAlertItem[];
  formatCurrency: (value: number) => string;
}

const BudgetAlertCard = ({ alerts, formatCurrency }: BudgetAlertCardProps) => {
  return (
    <Card className="finance-card mt-6 border-amber-200 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="text-amber-700 dark:text-amber-400">התראות תקציב</CardTitle>
        <CardDescription>קטגוריות שמתקרבות לחריגה מהתקציב או חורגות ממנו</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{alert.categoryName}</p>
                <div className="text-sm text-slate-500">
                  {formatCurrency(alert.current)} מתוך {formatCurrency(alert.limit)}
                </div>
              </div>
              <div
                className={cn(
                  "text-white px-2 py-1 rounded-full text-sm font-medium",
                  alert.percentage > 100
                    ? "bg-finance-expense"
                    : alert.percentage > 90
                    ? "bg-amber-500"
                    : "bg-amber-400"
                )}
              >
                {alert.percentage.toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetAlertCard;
