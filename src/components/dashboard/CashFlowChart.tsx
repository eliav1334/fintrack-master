
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface TimeDataItem {
  date: string;
  income: number;
  expense: number;
}

interface CashFlowChartProps {
  data: TimeDataItem[];
  formatCurrency: (value: number) => string;
}

const CashFlowChart = ({ data, formatCurrency }: CashFlowChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Area
          type="monotone"
          dataKey="income"
          stackId="1"
          stroke="#34d399"
          fill="#34d399"
          fillOpacity={0.6}
          animationDuration={1000}
        />
        <Area
          type="monotone"
          dataKey="expense"
          stackId="2"
          stroke="#f87171"
          fill="#f87171"
          fillOpacity={0.6}
          animationDuration={1000}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CashFlowChart;
