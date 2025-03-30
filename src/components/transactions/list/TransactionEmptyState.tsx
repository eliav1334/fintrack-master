import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface TransactionEmptyStateProps {
  selectedMonth: Date;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

const TransactionEmptyState: React.FC<TransactionEmptyStateProps> = ({
  selectedMonth,
  hasActiveFilters,
  onResetFilters,
}) => {
  return (
    <div className="py-16 text-center">
      <p className="text-gray-500">
        לא נמצאו עסקאות בחודש {format(selectedMonth, "MMMM yyyy")}
        {hasActiveFilters ? " עם הסינון הנוכחי" : ""}
      </p>
      {hasActiveFilters && (
        <Button variant="link" onClick={onResetFilters}>
          איפוס סינון
        </Button>
      )}
    </div>
  );
};

export default TransactionEmptyState; 