
import React from "react";
import { Transaction } from "@/types/finance";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TransactionForm } from "./TransactionForm";
import { TransactionDeleteDialog } from "./TransactionDeleteDialog";
import { PencilLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionListProps {
  transactions: Transaction[];
  filter: (transaction: Transaction) => boolean;
  isLoading?: boolean;
}

export const TransactionList = ({ 
  transactions, 
  filter,
  isLoading = false 
}: TransactionListProps) => {
  const filteredTransactions = transactions.filter(filter);
  
  // סינון והצגת העסקאות מהחדשה ביותר לישנה ביותר
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // פונקציה לקבלת צבע לפי קטגוריה
  const getCategoryColor = (category: Transaction["category"]) => {
    const colors: Record<string, string> = {
      "דיור": "bg-blue-100 text-blue-800",
      "מזון": "bg-green-100 text-green-800",
      "תחבורה": "bg-amber-100 text-amber-800",
      "בידור": "bg-purple-100 text-purple-800",
      "חשבונות": "bg-red-100 text-red-800",
      "הכנסה": "bg-emerald-100 text-emerald-800",
      "אחר": "bg-gray-100 text-gray-800",
    };
    
    return colors[category] || "bg-gray-100 text-gray-800";
  };
  
  // פונקציה לקבלת צבע לפי סטטוס
  const getStatusColor = (status: Transaction["status"]) => {
    const colors: Record<string, string> = {
      "הושלם": "bg-green-100 text-green-800",
      "מתוכנן": "bg-amber-100 text-amber-800",
      "בוטל": "bg-red-100 text-red-800",
    };
    
    return colors[status] || "bg-gray-100 text-gray-800";
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-24" />
                  <div className="flex gap-1">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sortedTransactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">לא נמצאו עסקאות התואמות את הסינון שבחרת.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sortedTransactions.map((transaction) => (
        <Card key={transaction.id}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{transaction.description}</span>
                  {transaction.recurrent && (
                    <Badge variant="outline" className="text-xs">חוזר</Badge>
                  )}
                  {transaction.installments && (
                    <Badge variant="outline" className="text-xs">
                      תשלום {transaction.installments.current}/{transaction.installments.total}
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">{new Date(transaction.date).toLocaleDateString('he-IL')}</Badge>
                  <Badge className={getCategoryColor(transaction.category)}>{transaction.category}</Badge>
                  <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}₪{transaction.amount.toLocaleString('he-IL')}
                </span>
                
                <div className="flex gap-1">
                  <TransactionForm transaction={transaction} mode="edit">
                    <Button variant="ghost" size="icon">
                      <PencilLine className="h-4 w-4" />
                    </Button>
                  </TransactionForm>
                  
                  <TransactionDeleteDialog transactionId={transaction.id}>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TransactionDeleteDialog>
                </div>
              </div>
            </div>
            
            {transaction.notes && (
              <div className="mt-2 text-sm text-muted-foreground">
                <p>{transaction.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
