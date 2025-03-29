
import React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const data = [
  { name: "ינו", הוצאות: 3200, הכנסות: 4500 },
  { name: "פבר", הוצאות: 3100, הכנסות: 4300 },
  { name: "מרץ", הוצאות: 3400, הכנסות: 4200 },
  { name: "אפר", הוצאות: 2800, הכנסות: 4000 },
  { name: "מאי", הוצאות: 2900, הכנסות: 5000 },
  { name: "יוני", הוצאות: 3549, הכנסות: 5430 },
];

const ExpenseChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => `₪${value}`} />
        <Line type="monotone" dataKey="הוצאות" stroke="#ef4444" strokeWidth={2} />
        <Line type="monotone" dataKey="הכנסות" stroke="#22c55e" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ExpenseChart;
