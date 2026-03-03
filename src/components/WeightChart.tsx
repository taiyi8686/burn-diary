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
  heRecords: WeightRecord[];
  sheRecords: WeightRecord[];
}

export function WeightChart({ heRecords, sheRecords }: WeightChartProps) {
  // 合并日期
  const dateSet = new Set([
    ...heRecords.map((r) => r.date),
    ...sheRecords.map((r) => r.date),
  ]);
  const sortedDates = Array.from(dateSet).sort();
  const recent = sortedDates.slice(-30);

  if (recent.length < 2) return null;

  const combinedData = recent.map((date) => ({
    date: date.slice(5),
    he: heRecords.find((r) => r.date === date)?.weight,
    she: sheRecords.find((r) => r.date === date)?.weight,
  }));

  const heWeights = combinedData.map((d) => d.he).filter(Boolean) as number[];
  const sheWeights = combinedData.map((d) => d.she).filter(Boolean) as number[];

  const heMin = heWeights.length > 0 ? Math.floor(Math.min(...heWeights) - 2) : 0;
  const heMax = heWeights.length > 0 ? Math.ceil(Math.max(...heWeights) + 2) : 100;
  const sheMin = sheWeights.length > 0 ? Math.floor(Math.min(...sheWeights) - 2) : 0;
  const sheMax = sheWeights.length > 0 ? Math.ceil(Math.max(...sheWeights) + 2) : 100;

  const hasHe = heWeights.length > 0;
  const hasShe = sheWeights.length > 0;

  return (
    <div>
      <div className="flex items-center gap-4 mb-2">
        {hasHe && (
          <span className="flex items-center gap-1 text-[10px] text-white/40">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4ecdc4]" /> 他
          </span>
        )}
        {hasShe && (
          <span className="flex items-center gap-1 text-[10px] text-white/40">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f472b6]" /> 她
          </span>
        )}
      </div>
      <div className="h-[200px] -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combinedData} margin={{ top: 5, right: hasHe && hasShe ? 40 : 10, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
              tickLine={false}
            />
            {hasHe && (
              <YAxis
                yAxisId="he"
                domain={[heMin, heMax]}
                tick={{ fontSize: 10, fill: "rgba(78,205,196,0.5)" }}
                axisLine={false}
                tickLine={false}
              />
            )}
            {hasShe && (
              <YAxis
                yAxisId="she"
                orientation="right"
                domain={[sheMin, sheMax]}
                tick={{ fontSize: 10, fill: "rgba(244,114,182,0.5)" }}
                axisLine={false}
                tickLine={false}
              />
            )}
            <Tooltip
              contentStyle={{
                background: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.6)" }}
              formatter={(value, name) => [
                `${value} 斤`,
                name === "he" ? "👨 他" : "👩 她",
              ]}
            />
            {hasHe && (
              <Line
                yAxisId="he"
                type="monotone"
                dataKey="he"
                stroke="#4ecdc4"
                strokeWidth={2}
                dot={{ r: 3, fill: "#4ecdc4", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#4ecdc4", strokeWidth: 2, stroke: "#0a0a0f" }}
                connectNulls
              />
            )}
            {hasShe && (
              <Line
                yAxisId="she"
                type="monotone"
                dataKey="she"
                stroke="#f472b6"
                strokeWidth={2}
                dot={{ r: 3, fill: "#f472b6", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#f472b6", strokeWidth: 2, stroke: "#0a0a0f" }}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
