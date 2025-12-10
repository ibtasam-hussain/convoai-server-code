"use client"

import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface ComplaintsAreaChartProps {
  data: Array<{
    month: string
    calls: number
    chats: number
  }>
}

export function ComplaintsAreaChart({ data }: ComplaintsAreaChartProps) {
  const formatYAxis = (value: number) => {
    return `${(value / 1000).toFixed(0)}k`
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4A0082" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#4A0082" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8E44AD" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8E44AD" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fontSize: 12, fill: "#6B7280" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          formatter={(value: number) => [`${value.toLocaleString()}`, ""]}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Area
          type="monotone"
          dataKey="calls"
          stroke="#4A0082"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorCalls)"
          activeDot={{ r: 6, fill: "#4A0082", stroke: "white", strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="chats"
          stroke="#8E44AD"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorChats)"
          activeDot={{ r: 6, fill: "#8E44AD", stroke: "white", strokeWidth: 2 }}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}

