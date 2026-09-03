import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function TrendChart({ dates = [], mentions = [], height = 220, color = "#DB0011" }) {
  const data = dates.map((d, i) => ({ date: d, mentions: mentions[i] ?? 0 }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="fluxGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F5" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#6B7A8F" }}
          tickFormatter={(v) => v.slice(5)}
          interval={Math.floor(data.length / 6)}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 10, fill: "#6B7A8F" }} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #E6E9EE", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
          labelStyle={{ fontWeight: 600 }}
          formatter={(v) => [`${v} mentions`, "Volume"]}
        />
        <Area type="monotone" dataKey="mentions" stroke={color} strokeWidth={2.5} fill="url(#fluxGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}