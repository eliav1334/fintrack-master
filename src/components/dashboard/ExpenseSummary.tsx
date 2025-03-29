
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "דיור", value: 1200, color: "#8b5cf6" },
  { name: "מזון", value: 800, color: "#3b82f6" },
  { name: "תחבורה", value: 500, color: "#10b981" },
  { name: "בידור", value: 300, color: "#f59e0b" },
  { name: "חשבונות", value: 450, color: "#ef4444" },
  { name: "אחר", value: 299, color: "#6b7280" },
];

const ExpenseSummary = () => {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₪${value}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseSummary;
