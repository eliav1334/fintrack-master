
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/override-select";
import { CategoryType } from "@/types";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CategoryForm from "@/components/budgets/CategoryForm";
import { useFinance } from "@/contexts/FinanceContext";

interface CategorySelectProps {
  categories: CategoryType[];
  selectedCategoryId: string;
  onChange: (value: string) => void;
  transactionType?: "income" | "expense";
  description?: string;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  categories,
  selectedCategoryId,
  onChange,
  transactionType = "expense",
  description,
}) => {
  const [showAddCategory, setShowAddCategory] = useState(false);
  const { addCategory, addCategoryMapping, state } = useFinance();

  const handleAddCategory = (category: Omit<CategoryType, "id">) => {
    // Add the new category
    const newCategory = addCategory(category);

    // If we have a description, also create a mapping
    if (description && description.trim()) {
      addCategoryMapping({
        description: description.trim(),
        categoryId: newCategory.id  // Using the newly created category ID
      });
      
      // Update the selected category in the parent form
      onChange(newCategory.id);
    }

    setShowAddCategory(false);
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="category">קטגוריה</Label>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs flex items-center"
            onClick={() => setShowAddCategory(true)}
          >
            <PlusCircle className="h-3.5 w-3.5 ml-1" />
            הוסף קטגוריה
          </Button>
        </div>
        <Select value={selectedCategoryId} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="בחר קטגוריה" />
          </SelectTrigger>
          <SelectContent className="category-select-dropdown">
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
          </SelectContent>
        </Select>
      </div>

      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>הוספת קטגוריה חדשה</DialogTitle>
            <DialogDescription>
              צור קטגוריה חדשה עבור סיווג עסקאות
              {description ? ` כמו "${description}"` : ""}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm 
            onSubmit={handleAddCategory} 
            initialType={transactionType}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
