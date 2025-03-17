
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from "recharts";

interface CategoryDataItem {
  name: string;
  value: number;
  color: string;
  percentage?: number;
}

interface ExpensePieChartProps {
  data: CategoryDataItem[];
  formatCurrency: (value: number) => string;
  title: string;
  totalAmount: number;
  changePercentage?: number;
}

const ExpensePieChart = ({ data, formatCurrency, title, totalAmount, changePercentage }: ExpensePieChartProps) => {
  // חישוב אחוזים לכל קטגוריה
  const dataWithPercentages = data.map(item => ({
    ...item,
    percentage: (item.value / totalAmount) * 100
  }));

  // יצירת טבלת נתונים
  const renderTable = () => {
    // מיון הנתונים לפי ערך (מהגבוה לנמוך)
    const sortedData = [...dataWithPercentages].sort((a, b) => b.value - a.value);
    
    if (sortedData.length === 0) return null;
    
    return (
      <div className="mt-4 w-full overflow-hidden">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-muted/30">
              <th className="text-right px-2 py-1">{title}</th>
              <th className="text-center px-2 py-1">סכום</th>
              <th className="text-center px-2 py-1">%</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-muted/10 font-semibold">
              <td className="text-right px-2 py-1">סה"כ</td>
              <td className="text-center px-2 py-1">{formatCurrency(totalAmount)}</td>
              <td className="text-center px-2 py-1">100%</td>
            </tr>
            {sortedData.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-muted/5"}>
                <td className="text-right px-2 py-1 flex items-center">
                  <span 
                    className="inline-block w-2 h-2 mr-1 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span>{item.name}</span>
                </td>
                <td className="text-center px-2 py-1">{formatCurrency(item.value)}</td>
                <td className="text-center px-2 py-1">{item.percentage?.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithPercentages}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              dataKey="value"
              animationDuration={1000}
            >
              {dataWithPercentages.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <Label
                content={(props) => {
                  // Correctly handle the ViewBox type by accessing props directly
                  if (!props.viewBox) return null;
                  
                  // TypeScript cast to access the properties
                  const viewBox = props.viewBox as { cx: number; cy: number; innerRadius: number; outerRadius: number };
                  const { cx, cy } = viewBox;
                  
                  return (
                    <g>
                      <text
                        x={cx}
                        y={cy - 10}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="font-bold text-lg"
                      >
                        {formatCurrency(totalAmount)}
                      </text>
                      {changePercentage !== undefined && (
                        <text
                          x={cx}
                          y={cy + 15}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={changePercentage >= 0 ? "#16a34a" : "#dc2626"}
                          className="text-xs"
                        >
                          {changePercentage >= 0 ? "+" : ""}{changePercentage.toFixed(2)}%
                        </text>
                      )}
                    </g>
                  );
                }}
              />
            </Pie>
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)} 
              contentStyle={{ direction: "rtl" }}
              itemStyle={{ textAlign: "right" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {renderTable()}
    </div>
  );
};

export default ExpensePieChart;
