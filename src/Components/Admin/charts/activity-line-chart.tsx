"use client"

import { Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip } from "recharts"

interface ActivityLineChartProps {
  data: Array<{
    time: string
    value: number
  }>
  color: string
}

export function ActivityLineChart({ data, color }: ActivityLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`color${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          formatter={(value: number) => [`${value}`, "Value"]}
          labelFormatter={(label) => `Time: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 4, fill: color, stroke: "white", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: color, stroke: "white", strokeWidth: 2 }}
          animationDuration={1500}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

