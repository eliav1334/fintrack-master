
import React, { useState, useEffect } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Transaction } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ArrowDownCircle, ArrowUpCircle, Edit, Search, Trash2, TrashIcon, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import MonthPicker from "@/components/dashboard/MonthPicker";
import { useLocation, useSearchParams } from "react-router-dom";

const TransactionList = () => {
  const { state, deleteTransaction, deleteAllIncomeTransactions } = useFinance();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [showConfirmDeleteAllIncome, setShowConfirmDeleteAllIncome] = useState<boolean>(false);
  
  // בדיקה אם הגענו מהדשבורד עם פרמטר של חודש נבחר
  const [searchParams] = useSearchParams();
  const monthParam = searchParams.get('month');
  
  // אם יש פרמטר חודש ב-URL, נשתמש בו
  useEffect(() => {
    if (monthParam) {
      try {
        const dateFromParam = new Date(monthParam);
        // בדיקה שהערך הוא תאריך תקין
        if (!isNaN(dateFromParam.getTime())) {
          setSelectedMonth(dateFromParam);
        }
      } catch (error) {
        console.error("שגיאה בפרמטר החודש:", error);
      }
    }
  }, [monthParam]);

  const getDateFilterLabel = (filter: string) => {
    switch (filter) {
      case "today":
        return "היום";
      case "this-week":
        return "השבוע";
      case "this-month":
        return "החודש";
      case "this-year":
        return "השנה";
      default:
        return "כל הזמן";
    }
  };

  const filterTransactions = () => {
    let filtered = [...state.transactions];

    // Filter by selected month
    if (selectedMonth) {
      const firstDayOfMonth = startOfMonth(selectedMonth);
      const lastDayOfMonth = endOfMonth(selectedMonth);
      
      filtered = filtered.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= firstDayOfMonth && txDate <= lastDayOfMonth;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((tx) => tx.categoryId === categoryFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((tx) => tx.type === typeFilter);
    }

    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.date);
        switch (dateFilter) {
          case "today":
            return txDate >= today;
          case "this-week":
            return txDate >= startOfWeek;
          case "this-month":
            return txDate >= startOfMonth;
          case "this-year":
            return txDate >= startOfYear;
          default:
            return true;
        }
      });
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const handleDelete = (id: string) => {
    setTransactionToDelete(id);
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete);
      setShowConfirmDialog(false);
      setTransactionToDelete(null);
    }
  };

  const handleDeleteAllIncome = () => {
    setShowConfirmDeleteAllIncome(true);
  };

  const confirmDeleteAllIncome = () => {
    deleteAllIncomeTransactions();
    setShowConfirmDeleteAllIncome(false);
    toast.success("כל עסקאות ההכנסה נמחקו בהצלחה");
  };

  const handleEdit = (transaction: Transaction) => {
    setEditTransaction(transaction);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setTypeFilter("all");
    setDateFilter("all");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
    }).format(value);
  };

  const filteredTransactions = filterTransactions();
  const hasIncomeTransactions = state.transactions.some(tx => tx.type === "income");
  
  // Filter monthly income transactions for the current selected month
  const monthlyIncomeInCurrentMonth = filteredTransactions.filter(tx => 
    tx.type === "income" && tx.description === "משכורת חודשית קבועה"
  );

  return (
    <div className="animate-fade-in p-6 space-y-6">
      <h1 className="text-3xl font-semibold mb-6">עסקאות</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-medium">סינון עסקאות לפי חודש</h2>
          <MonthPicker 
            selectedDate={selectedMonth} 
            onChange={setSelectedMonth} 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="חיפוש עסקאות..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="קטגוריה" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הקטגוריות</SelectItem>
              {state.categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="סוג" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסוגים</SelectItem>
              <SelectItem value="income">הכנסה</SelectItem>
              <SelectItem value="expense">הוצאה</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="טווח תאריכים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הזמן</SelectItem>
              <SelectItem value="today">היום</SelectItem>
              <SelectItem value="this-week">השבוע</SelectItem>
              <SelectItem value="this-month">החודש</SelectItem>
              <SelectItem value="this-year">השנה</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-between mt-4">
          <div className="flex gap-2">
            <div className="text-sm text-gray-500">
              נמצאו {filteredTransactions.length} עסקאות
              {monthlyIncomeInCurrentMonth.length > 0 && ` (כולל ${monthlyIncomeInCurrentMonth.length} משכורות חודשיות)`}
            </div>
            {hasIncomeTransactions && (
              <Button 
                variant="destructive"
                size="sm"
                onClick={handleDeleteAllIncome}
                className="flex items-center gap-1"
              >
                <TrashIcon className="h-3.5 w-3.5" />
                מחק את כל ההכנסות
              </Button>
            )}
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={resetFilters}
          >
            איפוס סינון
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {filteredTransactions.length > 0 ? (
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
                {filteredTransactions.map((transaction) => {
                  const category = state.categories.find(
                    (cat) => cat.id === transaction.categoryId
                  );
                  return (
                    <TableRow key={transaction.id}>
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
                          onClick={() => handleEdit(transaction)}
                          className="ml-1"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(transaction.id)}
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
        ) : (
          <div className="py-16 text-center">
            <p className="text-gray-500">
              לא נמצאו עסקאות בחודש {format(selectedMonth, "MMMM yyyy")}
              {searchTerm || categoryFilter !== "all" || typeFilter !== "all" || dateFilter !== "all"
                ? " עם הסינון הנוכחי"
                : ""}
            </p>
            {(searchTerm || categoryFilter !== "all" || typeFilter !== "all" || dateFilter !== "all") && (
              <Button variant="link" onClick={resetFilters}>
                איפוס סינון
              </Button>
            )}
          </div>
        )}
      </div>

      {editTransaction && (
        <Dialog open={!!editTransaction} onOpenChange={() => setEditTransaction(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>עריכת עסקה</DialogTitle>
              <DialogDescription>
                עדכן את פרטי העסקה להלן
              </DialogDescription>
            </DialogHeader>
            <TransactionForm
              transaction={editTransaction}
              onClose={() => setEditTransaction(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>מחיקת עסקה</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק עסקה זו? פעולה זו אינה ניתנת לביטול.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              מחק
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDeleteAllIncome} onOpenChange={setShowConfirmDeleteAllIncome}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>מחיקת כל עסקאות ההכנסה</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את כל עסקאות ההכנסה? פעולה זו אינה ניתנת לביטול.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDeleteAllIncome(false)}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={confirmDeleteAllIncome}>
              מחק את כל ההכנסות
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionList;
