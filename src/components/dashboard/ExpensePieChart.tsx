
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface CategoryDataItem {
  name: string;
  value: number;
  color: string;
}

interface ExpensePieChartProps {
  data: CategoryDataItem[];
  formatCurrency: (value: number) => string;
}

const ExpensePieChart = ({ data, formatCurrency }: ExpensePieChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          dataKey="value"
          labelLine={false}
          animationDuration={1000}
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
            const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
            return percent > 0.05 ? (
              <text
                x={x}
                y={y}
                fill="#888888"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                fontSize="12"
              >
                {`${(percent * 100).toFixed(0)}%`}
              </text>
            ) : null;
          }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ExpensePieChart;
