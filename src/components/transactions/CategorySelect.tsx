
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CategoryType } from "@/types";

interface CategorySelectProps {
  categories: CategoryType[];
  selectedCategoryId: string;
  onChange: (value: string) => void;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  categories,
  selectedCategoryId,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="category">קטגוריה</Label>
      <Select value={selectedCategoryId} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="בחר קטגוריה" />
        </SelectTrigger>
        <SelectContent className="max-h-[var(--radix-select-content-available-height)]">
          <ScrollArea className="h-[200px]">
            {categories.length > 0 ? (
              categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center">
                    <span
                      className="w-2 h-2 rounded-full ml-2"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled value="none">
                אין קטגוריות זמינות לסוג זה
              </SelectItem>
            )}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
};
