"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonthlyRevenueData {
  Month: string;
  Revenue: number;
}

const data: MonthlyRevenueData[] = [
  { Month: "Jan", Revenue: 120 },
  { Month: "Feb", Revenue: 300 },
  { Month: "Mar", Revenue: 450 },
  { Month: "Apr", Revenue: 200 },
  { Month: "May", Revenue: 600 },
  { Month: "Jun", Revenue: 800 },
  { Month: "Jul", Revenue: 700 },
  { Month: "Aug", Revenue: 500 },
  { Month: "Sep", Revenue: 650 },
  { Month: "Oct", Revenue: 400 },
  { Month: "Nov", Revenue: 750 },
  { Month: "Dec", Revenue: 900 },
];

export default function MonthlyRevenueChart() {
  return (
    <div className="h-full w-full p-6 pr-10">
        <ResponsiveContainer 
        width="100%" 
        height="100%"
        >
          <BarChart
          data={data}
          >
            <XAxis
              dataKey="Month"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              formatter={(value: number | undefined) => {
                if (value === undefined) return "$0";
                return `$${value}`;
              }}
            />
            <Bar
              dataKey="Revenue"
              fill="#637A54"
              radius={[4, 4, 0, 0]}
              barSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
    </div>
  );
}
