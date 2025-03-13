
import React, { useState } from "react";
import { format, subMonths, addMonths, getYear, setMonth } from "date-fns";
import { he } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthPickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

const MonthPicker: React.FC<MonthPickerProps> = ({ selectedDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // מקבל את החודש הנוכחי (0-11)
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  
  // פונקציה לשינוי החודש
  const changeMonth = (direction: "prev" | "next") => {
    const newDate = direction === "prev" 
      ? subMonths(selectedDate, 1)
      : addMonths(selectedDate, 1);
    onChange(newDate);
  };
  
  // פונקציה לשינוי החודש באמצעות הבוחר
  const handleMonthChange = (monthIndex: string) => {
    // יצירת עותק של התאריך ושינוי החודש בלבד
    const newDate = new Date(selectedDate);
    newDate.setMonth(parseInt(monthIndex));
    onChange(newDate);
    setIsOpen(false);
  };

  // פונקציה לשינוי השנה
  const handleYearChange = (year: string) => {
    // יצירת עותק של התאריך ושינוי השנה בלבד
    const newDate = new Date(selectedDate);
    newDate.setFullYear(parseInt(year));
    onChange(newDate);
  };
  
  // יצירת אפשרויות שנים מ-2020 עד 2025
  const yearOptions = [];
  for (let year = 2020; year <= 2025; year++) {
    yearOptions.push(year);
  }

  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-lg shadow-sm">
      <div className="flex items-center space-x-2 space-x-reverse">
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            changeMonth("prev");
          }}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">החודש הקודם</span>
        </Button>
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              type="button"
              className="flex items-center justify-between min-w-[200px]"
              onClick={(e) => e.preventDefault()}
            >
              <span>
                {HEBREW_MONTHS[currentMonth]} {currentYear}
              </span>
              <CalendarIcon className="ml-2 h-4 w-4 opacity-70" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-2 w-auto" align="center">
            <div className="grid gap-2">
              <div className="flex justify-between gap-2">
                <Select
                  value={currentMonth.toString()}
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="חודש" />
                  </SelectTrigger>
                  <SelectContent>
                    {HEBREW_MONTHS.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={currentYear.toString()}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="שנה" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    onChange(date);
                    setIsOpen(false);
                  }
                }}
                className={cn("p-3 pointer-events-auto")}
                locale={he}
                month={selectedDate}
                onMonthChange={onChange}
                captionLayout="dropdown-buttons"
                fromMonth={new Date(2020, 0)}
                toMonth={new Date(2025, 11)}
              />
            </div>
          </PopoverContent>
        </Popover>
        
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            changeMonth("next");
          }}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">החודש הבא</span>
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground">
        {format(selectedDate, "'נתונים עבור חודש' MMMM yyyy", { locale: he })}
      </div>
    </div>
  );
};

export default MonthPicker;
