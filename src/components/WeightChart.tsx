"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { WeightRecord } from "@/types";

interface WeightChartProps {
  records: WeightRecord[];
}

export function WeightChart({ records }: WeightChartProps) {
  // 取最近30条
  const data = records.slice(-30).map((r) => ({
    date: r.date.slice(5), // MM-DD
    weight: r.weight,
  }));

  const weights = data.map((d) => d.weight);
  const minW = Math.floor(Math.min(...weights) - 2);
  const maxW = Math.ceil(Math.max(...weights) + 2);

  return (
    <div className="h-[200px] -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
            axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
            tickLine={false}
          />
          <YAxis
            domain={[minW, maxW]}
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1a2e",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "rgba(255,255,255,0.6)" }}
            itemStyle={{ color: "#63d297" }}
            formatter={(value) => [`${value} 斤`, "体重"]}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="url(#lineGradient)"
            strokeWidth={2}
            dot={{ r: 3, fill: "#63d297", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#63d297", strokeWidth: 2, stroke: "#0a0a0f" }}
          />
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#63d297" />
              <stop offset="100%" stopColor="#4ecdc4" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
