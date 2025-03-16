
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/override-select";
import { Search, TrashIcon } from "lucide-react";
import { CategoryType } from "@/types";
import MonthPicker from "@/components/dashboard/MonthPicker";
import { format } from "date-fns";

interface TransactionFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
  resetFilters: () => void;
  filteredCount: number;
  monthlyIncomeCount: number;
  hasIncomeTransactions: boolean;
  onDeleteAllIncome: () => void;
  categories: CategoryType[];
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  typeFilter,
  setTypeFilter,
  dateFilter,
  setDateFilter,
  selectedMonth,
  setSelectedMonth,
  resetFilters,
  filteredCount,
  monthlyIncomeCount,
  hasIncomeTransactions,
  onDeleteAllIncome,
  categories,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-medium">סינון עסקאות לפי חודש</h2>
        <MonthPicker 
          selectedDate={selectedMonth} 
          onChange={setSelectedMonth} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="חיפוש עסקאות..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="קטגוריה" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הקטגוריות</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="סוג" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסוגים</SelectItem>
            <SelectItem value="income">הכנסה</SelectItem>
            <SelectItem value="expense">הוצאה</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger>
            <SelectValue placeholder="טווח תאריכים" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הזמן</SelectItem>
            <SelectItem value="today">היום</SelectItem>
            <SelectItem value="this-week">השבוע</SelectItem>
            <SelectItem value="this-month">החודש</SelectItem>
            <SelectItem value="this-year">השנה</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-between mt-4">
        <div className="flex gap-2">
          <div className="text-sm text-gray-500">
            נמצאו {filteredCount} עסקאות
            {monthlyIncomeCount > 0 && ` (כולל ${monthlyIncomeCount} משכורות חודשיות)`}
          </div>
          {hasIncomeTransactions && (
            <Button 
              variant="destructive"
              size="sm"
              onClick={onDeleteAllIncome}
              className="flex items-center gap-1"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              מחק את כל ההכנסות
            </Button>
          )}
        </div>
        <Button 
          variant="outline"
          size="sm"
          onClick={resetFilters}
        >
          איפוס סינון
        </Button>
      </div>
    </div>
  );
};

export default TransactionFilters;
