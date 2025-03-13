
import React from "react";
import { CategoryType } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CategoryListProps {
  categories: CategoryType[];
}

const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center p-4 border border-dashed rounded-md">
        <p className="text-muted-foreground">אין קטגוריות להצגה</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card key={category.id} className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 space-x-reverse rtl:space-x-reverse">
            <span
              className="h-6 w-6 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="font-medium">{category.name}</span>
          </div>
          <Badge variant={category.type === "income" ? "outline" : "default"}>
            {category.type === "income" ? "הכנסה" : "הוצאה"}
          </Badge>
        </Card>
      ))}
    </div>
  );
};

export default CategoryList;
