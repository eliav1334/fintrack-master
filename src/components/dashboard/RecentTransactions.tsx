
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const transactions = [
  {
    id: "1",
    description: "שכירות",
    date: "2023-06-01",
    amount: -1200,
    category: "דיור",
    status: "הושלם",
  },
  {
    id: "2",
    description: "משכורת",
    date: "2023-06-05",
    amount: 5430,
    category: "הכנסה",
    status: "הושלם",
  },
  {
    id: "3",
    description: "סופרמרקט",
    date: "2023-06-08",
    amount: -230,
    category: "מזון",
    status: "הושלם",
  },
  {
    id: "4",
    description: "תדלוק",
    date: "2023-06-12",
    amount: -150,
    category: "תחבורה",
    status: "הושלם",
  },
  {
    id: "5",
    description: "נטפליקס",
    date: "2023-06-15",
    amount: -45,
    category: "בידור",
    status: "הושלם",
  },
];

const RecentTransactions = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>תיאור</TableHead>
          <TableHead>תאריך</TableHead>
          <TableHead>קטגוריה</TableHead>
          <TableHead className="text-right">סכום</TableHead>
          <TableHead>סטטוס</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="font-medium">{transaction.description}</TableCell>
            <TableCell>{new Date(transaction.date).toLocaleDateString("he-IL")}</TableCell>
            <TableCell>
              <Badge variant="outline">{transaction.category}</Badge>
            </TableCell>
            <TableCell className={`text-right ${transaction.amount < 0 ? "text-red-500" : "text-green-500"}`}>
              {transaction.amount < 0 ? `-₪${Math.abs(transaction.amount)}` : `₪${transaction.amount}`}
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{transaction.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RecentTransactions;
