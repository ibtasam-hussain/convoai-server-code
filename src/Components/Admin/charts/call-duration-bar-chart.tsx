"use client"

import { Bar, BarChart as RechartsBarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface CallDurationBarChartProps {
  data: Array<{
    time: string
    value: number
  }>
}

export function CallDurationBarChart({ data }: CallDurationBarChartProps) {
  // Take a subset of data for better visualization
  const chartData = data.filter((_, index) => index % 2 === 0)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barCategoryGap="50%">
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
        <YAxis hide domain={[0, "dataMax + 10"]} />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          formatter={(value: number) => [`${value} min`, "Duration"]}
          labelFormatter={(label) => `Time: ${label}`}
        />
        <Bar dataKey="value" fill="#4A0082" radius={[2, 2, 0, 0]} barSize={5} animationDuration={1500} />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

