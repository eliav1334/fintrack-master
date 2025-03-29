
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TransactionCategory, TransactionType } from "@/types/finance";
import { X } from "lucide-react";

interface TransactionFiltersProps {
  onClose: () => void;
  onApplyFilters?: (filters: any) => void;
}

export const TransactionFilters = ({ onClose, onApplyFilters }: TransactionFiltersProps) => {
  const [filters, setFilters] = useState({
    description: "",
    category: "",
    minAmount: "",
    maxAmount: "",
    dateFrom: "",
    dateTo: "",
    status: "",
  });
  
  const handleChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    onClose();
  };
  
  const handleReset = () => {
    setFilters({
      description: "",
      category: "",
      minAmount: "",
      maxAmount: "",
      dateFrom: "",
      dateTo: "",
      status: "",
    });
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">סינון עסקאות</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="description">תיאור</Label>
            <Input
              id="description"
              value={filters.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="חיפוש בתיאור"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">קטגוריה</Label>
            <Select 
              value={filters.category}
              onValueChange={(value) => handleChange("category", value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="כל הקטגוריות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">כל הקטגוריות</SelectItem>
                <SelectItem value="דיור">דיור</SelectItem>
                <SelectItem value="מזון">מזון</SelectItem>
                <SelectItem value="תחבורה">תחבורה</SelectItem>
                <SelectItem value="בידור">בידור</SelectItem>
                <SelectItem value="חשבונות">חשבונות</SelectItem>
                <SelectItem value="הכנסה">הכנסה</SelectItem>
                <SelectItem value="אחר">אחר</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">סטטוס</Label>
            <Select 
              value={filters.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="כל הסטטוסים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">כל הסטטוסים</SelectItem>
                <SelectItem value="הושלם">הושלם</SelectItem>
                <SelectItem value="מתוכנן">מתוכנן</SelectItem>
                <SelectItem value="בוטל">בוטל</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="min-amount">סכום מינימלי</Label>
            <Input
              id="min-amount"
              type="number"
              value={filters.minAmount}
              onChange={(e) => handleChange("minAmount", e.target.value)}
              placeholder="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="max-amount">סכום מקסימלי</Label>
            <Input
              id="max-amount"
              type="number"
              value={filters.maxAmount}
              onChange={(e) => handleChange("maxAmount", e.target.value)}
              placeholder="ללא הגבלה"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date-from">מתאריך</Label>
            <Input
              id="date-from"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleChange("dateFrom", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date-to">עד תאריך</Label>
            <Input
              id="date-to"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleChange("dateTo", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleReset}>איפוס</Button>
        <Button onClick={handleApplyFilters}>החל סינון</Button>
      </CardFooter>
    </Card>
  );
};
