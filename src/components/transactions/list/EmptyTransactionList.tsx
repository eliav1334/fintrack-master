
import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface EmptyTransactionListProps {
  selectedMonth: Date;
  hasFilters: boolean;
  resetFilters: () => void;
}

const EmptyTransactionList: React.FC<EmptyTransactionListProps> = ({
  selectedMonth,
  hasFilters,
  resetFilters,
}) => {
  return (
    <div className="py-16 text-center">
      <p className="text-gray-500">
        לא נמצאו עסקאות בחודש {format(selectedMonth, "MMMM yyyy")}
        {hasFilters ? " עם הסינון הנוכחי" : ""}
      </p>
      {hasFilters && (
        <Button variant="link" onClick={resetFilters}>
          איפוס סינון
        </Button>
      )}
    </div>
  );
};

export default EmptyTransactionList;
