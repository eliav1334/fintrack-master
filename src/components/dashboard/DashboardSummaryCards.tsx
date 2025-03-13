
import React from "react";
import SummaryCard from "./SummaryCard";
import { ArrowDownCircle, ArrowUpCircle, DollarSign, TrendingDown, TrendingUp } from "lucide-react";

interface DashboardSummaryCardsProps {
  stats: {
    income: number;
    expense: number;
    balance: number;
    incomeChange: number;
    expenseChange: number;
    balanceChange: number;
  };
  formatCurrency: (value: number) => string;
}

const DashboardSummaryCards = ({ stats, formatCurrency }: DashboardSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SummaryCard
        title="הכנסות"
        description="חודש נוכחי"
        icon={<ArrowUpCircle className="h-5 w-5 text-finance-income" />}
        value={formatCurrency(stats.income)}
        changeDirection={stats.incomeChange > 0 ? "up" : "down"}
        changeValue={`${stats.incomeChange.toFixed(1)}% מהחודש הקודם`}
        iconComponent={
          stats.incomeChange > 0 ? (
            <TrendingUp className="h-4 w-4 text-finance-income ml-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-finance-expense ml-1" />
          )
        }
      />
      
      <SummaryCard
        title="הוצאות"
        description="חודש נוכחי"
        icon={<ArrowDownCircle className="h-5 w-5 text-finance-expense" />}
        value={formatCurrency(stats.expense)}
        changeDirection={stats.expenseChange < 0 ? "up" : "down"}
        changeValue={`${Math.abs(stats.expenseChange).toFixed(1)}% ${
          stats.expenseChange < 0 ? "פחות" : "יותר"
        } מהחודש הקודם`}
        iconComponent={
          stats.expenseChange < 0 ? (
            <TrendingDown className="h-4 w-4 text-finance-income ml-1" />
          ) : (
            <TrendingUp className="h-4 w-4 text-finance-expense ml-1" />
          )
        }
      />
      
      <SummaryCard
        title="מאזן"
        description="חודש נוכחי"
        icon={<DollarSign className="h-5 w-5 text-finance-budget" />}
        value={formatCurrency(stats.balance)}
        changeDirection={stats.balanceChange > 0 ? "up" : "down"}
        changeValue={`${stats.balanceChange.toFixed(1)}% מהחודש הקודם`}
        iconComponent={
          stats.balanceChange > 0 ? (
            <TrendingUp className="h-4 w-4 text-finance-income ml-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-finance-expense ml-1" />
          )
        }
      />
    </div>
  );
};

export default DashboardSummaryCards;
