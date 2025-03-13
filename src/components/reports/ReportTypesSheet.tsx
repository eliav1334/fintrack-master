
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export const ReportTypesSheet: React.FC = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <HelpCircle className="h-4 w-4" />
          <span>סוגי דוחות</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:max-w-[540px] overflow-y-auto" side="left">
        <SheetHeader>
          <SheetTitle>סוגי דוחות במערכת</SheetTitle>
          <SheetDescription>
            המערכת מציעה מגוון דוחות לניתוח וניהול התקציב שלך
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">דוחות סיכום</h3>
            <ul className="list-disc pr-5 space-y-1">
              <li>
                <strong>סיכום חודשי</strong> - הצגת סיכום הכנסות והוצאות לפי חודשים
              </li>
              <li>
                <strong>סיכום שנתי</strong> - ניתוח שנתי של הכנסות והוצאות
              </li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">דוחות לפי קטגוריות</h3>
            <ul className="list-disc pr-5 space-y-1">
              <li>
                <strong>התפלגות הוצאות</strong> - הצגת התפלגות ההוצאות לפי קטגוריות
              </li>
              <li>
                <strong>השוואת קטגוריות</strong> - השוואה בין הוצאות בקטגוריות שונות
              </li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">דוחות תשלומים</h3>
            <ul className="list-disc pr-5 space-y-1">
              <li>
                <strong>סיכום עסקאות בתשלומים</strong> - ניתוח של עסקאות המשולמות בתשלומים
              </li>
              <li>
                <strong>תחזית תשלומים עתידיים</strong> - צפי תשלומים צפויים בחודשים הבאים
              </li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">דוחות חשמל</h3>
            <ul className="list-disc pr-5 space-y-1">
              <li>
                <strong>צריכת חשמל</strong> - ניתוח צריכת החשמל לאורך זמן
              </li>
              <li>
                <strong>עלויות חשמל</strong> - ניתוח עלויות החשמל לפי תקופות
              </li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">דוחות ייצוא</h3>
            <ul className="list-disc pr-5 space-y-1">
              <li>
                <strong>ייצוא לאקסל</strong> - ייצוא נתוני עסקאות בפורמט אקסל
              </li>
              <li>
                <strong>ייצוא CSV</strong> - ייצוא נתונים בפורמט CSV
              </li>
              <li>
                <strong>ייצוא לPDF</strong> - הפקת דוחות מעוצבים בפורמט PDF
              </li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">דוחות מגמות</h3>
            <ul className="list-disc pr-5 space-y-1">
              <li>
                <strong>ניתוח מגמות</strong> - ניתוח מגמות הכנסות והוצאות לאורך זמן
              </li>
              <li>
                <strong>תחזית תקציבית</strong> - תחזית עתידית על בסיס נתוני העבר
              </li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
