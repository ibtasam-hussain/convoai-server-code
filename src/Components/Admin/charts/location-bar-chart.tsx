"use client"

import { useState, useEffect } from "react"

interface LocationBarChartProps {
  data: Array<{
    name: string
    percentage: number
  }>
}

export function LocationBarChart({ data }: LocationBarChartProps) {
  const [widths, setWidths] = useState(data.map(() => 0))

  // Animate the bars on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setWidths(data.map((item) => item.percentage))
    }, 300)

    return () => clearTimeout(timer)
  }, [data])

  return (
    <div className="space-y-4">
      {data.map((location, index) => (
        <div key={index} className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>{location.name}</span>
            <span>{location.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#4A0082] h-2 rounded-full transition-all duration-1000 ease-in-out"
              style={{ width: `${widths[index]}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}

