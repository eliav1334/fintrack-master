
import React from "react";
import { format } from "date-fns";
import { ArrowDownCircle, ArrowUpCircle, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Transaction, CategoryType } from "@/types";

interface TransactionTableProps {
  transactions: Transaction[];
  categories: CategoryType[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  formatCurrency: (value: number) => string;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  categories,
  onEdit,
  onDelete,
  formatCurrency,
}) => {
  return (
    <div className="overflow-x-auto" id="transactions-table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>תאריך</TableHead>
            <TableHead>תיאור</TableHead>
            <TableHead>קטגוריה</TableHead>
            <TableHead>סוג</TableHead>
            <TableHead className="text-left">סכום</TableHead>
            <TableHead className="text-left">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const category = categories.find(
              (cat) => cat.id === transaction.categoryId
            );
            return (
              <TableRow key={`tx_${transaction.id}`}>
                <TableCell>
                  {format(new Date(transaction.date), "dd/MM/yyyy")}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {transaction.description}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center">
                    <span
                      className="w-2 h-2 rounded-full ml-2"
                      style={{ backgroundColor: category?.color || "#9ca3af" }}
                    />
                    {category?.name || "ללא קטגוריה"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center">
                    {transaction.type === "income" ? (
                      <ArrowUpCircle className="ml-1 h-4 w-4 text-finance-income" />
                    ) : (
                      <ArrowDownCircle className="ml-1 h-4 w-4 text-finance-expense" />
                    )}
                    {transaction.type === "income" ? "הכנסה" : "הוצאה"}
                  </span>
                </TableCell>
                <TableCell className={cn(
                  "text-left font-medium",
                  transaction.type === "income" ? "text-finance-income" : "text-finance-expense"
                )}>
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell className="text-left">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(transaction)}
                    className="ml-1"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(transaction.id)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;
