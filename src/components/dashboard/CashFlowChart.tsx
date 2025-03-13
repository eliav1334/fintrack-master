
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

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
  // הגדרת פונקציית עיצוב לתוויות הערכים
  const formatYAxis = (value: number): string => {
    if (value >= 1000) {
      return `${Math.round(value / 1000)}K`;
    }
    return value.toString();
  };
  
  // הגדרת פונקציית עיצוב לטולטיפ
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="font-bold mb-1 text-gray-700 text-right">{label}</p>
          <p className="text-finance-income text-right">
            <span className="font-bold">הכנסות:</span> {formatCurrency(payload[0].value)}
          </p>
          <p className="text-finance-expense text-right">
            <span className="font-bold">הוצאות:</span> {formatCurrency(payload[1].value)}
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={formatYAxis} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="income"
          name="הכנסות"
          stackId="1"
          stroke="#34d399"
          fill="#34d399"
          fillOpacity={0.6}
          animationDuration={1000}
        />
        <Area
          type="monotone"
          dataKey="expense"
          name="הוצאות"
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
