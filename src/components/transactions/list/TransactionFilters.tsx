import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryType } from "@/modules/core/finance/types";

interface TransactionFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  categories: CategoryType[];
  resetFilters: () => void;
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
  categories,
  resetFilters,
}) => {
  return (
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
            <SelectItem key={category.id} value={category.name}>
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
          <SelectItem value="הכנסה">הכנסה</SelectItem>
          <SelectItem value="הוצאה">הוצאה</SelectItem>
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
      <Button 
        variant="outline"
        size="sm"
        onClick={resetFilters}
        className="md:col-span-4"
      >
        איפוס סינון
      </Button>
    </div>
  );
};

export default TransactionFilters;
