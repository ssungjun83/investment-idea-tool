"use client";

import { ResponsiveContainer, AreaChart, Area, YAxis, Tooltip } from "recharts";

interface ChartDataPoint {
  date: string;
  sentiment_score: number;
}

export default function IndicatorChart({ data }: { data: ChartDataPoint[] }) {
  if (data.length < 2) return null;

  const chartData = data.map((d) => ({
    date: d.date.slice(5), // MM-DD
    value: d.sentiment_score,
  }));

  const lastValue = chartData[chartData.length - 1]?.value ?? 0;
  const gradientColor = lastValue >= 0 ? "#10b981" : "#ef4444";
  const strokeColor = lastValue >= 0 ? "#059669" : "#dc2626";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <defs>
          <linearGradient id={`gradient-${lastValue >= 0 ? "pos" : "neg"}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientColor} stopOpacity={0.3} />
            <stop offset="100%" stopColor={gradientColor} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <YAxis domain={[-100, 100]} hide />
        <Tooltip
          contentStyle={{ fontSize: 11, padding: "4px 8px", borderRadius: 8 }}
          formatter={(value: any) => [`${value > 0 ? "+" : ""}${value}`, "심리지수"]}
          labelFormatter={(label: any) => label}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={strokeColor}
          strokeWidth={2}
          fill={`url(#gradient-${lastValue >= 0 ? "pos" : "neg"})`}
          dot={false}
          activeDot={{ r: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
