
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { CategoryType, Budget } from "@/types";
import BudgetForm from "./BudgetForm";

interface BudgetEmptyProps {
  expenseCategories: CategoryType[];
  onSubmit: (budget: Omit<Budget, "id">) => void;
}

const BudgetEmpty = ({ expenseCategories, onSubmit }: BudgetEmptyProps) => {
  return (
    <div className="col-span-full text-center py-10">
      <h3 className="text-xl font-medium mb-2">עדיין לא הוגדרו תקציבים</h3>
      <p className="text-muted-foreground mb-6">הגדר את התקציב הראשון שלך כדי לעקוב אחר ההוצאות</p>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            <span>תקציב חדש</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הגדרת תקציב חדש</DialogTitle>
          </DialogHeader>
          <BudgetForm 
            expenseCategories={expenseCategories} 
            onSubmit={onSubmit} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetEmpty;
