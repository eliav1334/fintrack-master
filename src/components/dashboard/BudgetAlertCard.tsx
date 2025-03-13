
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; 
import { BadgeAlert } from "lucide-react";

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
  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card className="finance-card mt-6 border-amber-200 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <BadgeAlert className="h-5 w-5" />
          התראות תקציב
        </CardTitle>
        <CardDescription>קטגוריות שמתקרבות לחריגה מהתקציב או חורגות ממנו</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert, idx) => (
            <div 
              key={idx} 
              className={cn(
                "rounded-lg p-3 border",
                alert.percentage > 100
                  ? "bg-[#FFDEE2]/50 border-[#ea384c]/30"  
                  : alert.percentage > 90
                    ? "bg-amber-50 border-amber-200"
                    : "bg-amber-50/50 border-amber-100"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn(
                    "font-medium",
                    alert.percentage > 100 ? "text-[#ea384c]" : ""
                  )}>{alert.categoryName}</p>
                  <div className="text-sm text-slate-600">
                    {formatCurrency(alert.current)} מתוך {formatCurrency(alert.limit)}
                  </div>
                </div>
                <div
                  className={cn(
                    "px-2 py-1 rounded-full text-sm font-medium",
                    alert.percentage > 100
                      ? "bg-[#ea384c] text-white"
                      : alert.percentage > 90
                      ? "bg-amber-500 text-white"
                      : "bg-amber-400 text-white"
                  )}
                >
                  {alert.percentage.toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetAlertCard;
