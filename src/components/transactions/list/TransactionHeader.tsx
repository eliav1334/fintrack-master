import React from "react";
import { TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import MonthPicker from "@/components/dashboard/MonthPicker";

interface TransactionHeaderProps {
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
  filteredTransactionsCount: number;
  monthlyIncomeCount: number;
  hasIncomeTransactions: boolean;
  onDeleteAllIncome: () => void;
}

const TransactionHeader: React.FC<TransactionHeaderProps> = ({
  selectedMonth,
  setSelectedMonth,
  filteredTransactionsCount,
  monthlyIncomeCount,
  hasIncomeTransactions,
  onDeleteAllIncome,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <h2 className="text-xl font-medium">סינון עסקאות לפי חודש</h2>
      <MonthPicker 
        selectedDate={selectedMonth} 
        onChange={setSelectedMonth} 
      />
      <div className="flex gap-2">
        <div className="text-sm text-gray-500">
          נמצאו {filteredTransactionsCount} עסקאות
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
    </div>
  );
};

export default TransactionHeader; 