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
import { Transaction } from "@/types/finance";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string, description: string, amount: number) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEdit,
  onDelete,
}) => {
  const translateType = (type: string) => {
    return type;
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "הושלם":
        return { label: "הושלם", color: "bg-green-100 text-green-800" };
      case "ממתין":
        return { label: "ממתין", color: "bg-yellow-100 text-yellow-800" };
      case "בוטל":
        return { label: "בוטל", color: "bg-red-100 text-red-800" };
      default:
        return { label: status, color: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="overflow-x-auto" id="transactions-table-container">
      <div className="mb-4 text-sm text-muted-foreground">
        סה"כ עסקאות: {transactions.length}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>תאריך</TableHead>
            <TableHead>תיאור</TableHead>
            <TableHead>קטגוריה</TableHead>
            <TableHead>סוג עסקה</TableHead>
            <TableHead>סטטוס</TableHead>
            <TableHead className="text-left">סכום</TableHead>
            <TableHead className="text-left">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={`tx_${transaction.id}`}>
              <TableCell>
                {format(new Date(transaction.date), "dd/MM/yyyy")}
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {transaction.description}
                {transaction.notes && (
                  <span className="block text-xs text-muted-foreground mt-1">
                    {transaction.notes}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center">
                  <span
                    className="w-2 h-2 rounded-full ml-2"
                    style={{ backgroundColor: "#9ca3af" }}
                  />
                  {transaction.category}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center">
                  {transaction.type === "הכנסה" ? (
                    <ArrowUpCircle className="ml-1 h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownCircle className="ml-1 h-4 w-4 text-red-500" />
                  )}
                  {translateType(transaction.type)}
                </span>
              </TableCell>
              <TableCell>
                <Badge className={translateStatus(transaction.status).color}>
                  {translateStatus(transaction.status).label}
                </Badge>
              </TableCell>
              <TableCell className={cn(
                "text-left font-medium",
                transaction.type === "הכנסה" ? "text-green-500" : "text-red-500"
              )}>
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell className="text-left">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(transaction)}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(transaction.id, transaction.description, transaction.amount)}
                    className="text-destructive hover:text-destructive/90 hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;
