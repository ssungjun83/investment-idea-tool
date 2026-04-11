"use client";

import { ResponsiveContainer, AreaChart, Area, YAxis, Tooltip, ReferenceLine } from "recharts";

interface PriceChartProps {
  data: { date: string; close: number }[];
}

/** 실제 가격 차트 (Yahoo Finance 데이터) */
export function PriceChart({ data }: PriceChartProps) {
  if (data.length < 2) return null;

  const chartData = data.map((d) => ({
    date: d.date.slice(5),
    value: d.close,
  }));

  const first = chartData[0].value;
  const last = chartData[chartData.length - 1].value;
  const isUp = last >= first;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <defs>
          <linearGradient id={`price-grad-${isUp ? "up" : "dn"}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity={0.2} />
            <stop offset="100%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <YAxis domain={["auto", "auto"]} hide />
        <Tooltip
          contentStyle={{ fontSize: 11, padding: "4px 8px", borderRadius: 8 }}
          formatter={(value: any) => [Number(value).toLocaleString(), "가격"]}
          labelFormatter={(label: any) => label}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={isUp ? "#059669" : "#dc2626"}
          strokeWidth={1.5}
          fill={`url(#price-grad-${isUp ? "up" : "dn"})`}
          dot={false}
          activeDot={{ r: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface SentimentChartProps {
  data: { date: string; sentiment_score: number }[];
}

/** 심리지수 차트 (스냅샷 데이터) */
export function SentimentChart({ data }: SentimentChartProps) {
  if (data.length < 2) return null;

  const chartData = data.map((d) => ({
    date: d.date.slice(5),
    value: d.sentiment_score,
  }));

  const last = chartData[chartData.length - 1]?.value ?? 0;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <defs>
          <linearGradient id={`sent-grad-${last >= 0 ? "pos" : "neg"}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={last >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
            <stop offset="100%" stopColor={last >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <YAxis domain={[-100, 100]} hide />
        <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="2 2" />
        <Tooltip
          contentStyle={{ fontSize: 11, padding: "4px 8px", borderRadius: 8 }}
          formatter={(value: any) => [`${value > 0 ? "+" : ""}${value}`, "심리"]}
          labelFormatter={(label: any) => label}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={last >= 0 ? "#059669" : "#dc2626"}
          strokeWidth={1.5}
          fill={`url(#sent-grad-${last >= 0 ? "pos" : "neg"})`}
          dot={false}
          activeDot={{ r: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** 기본 export (하위호환) */
export default function IndicatorChart({ data }: { data: { date: string; sentiment_score: number }[] }) {
  return <SentimentChart data={data} />;
}
