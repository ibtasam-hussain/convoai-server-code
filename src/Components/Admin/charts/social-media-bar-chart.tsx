"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { Globe, Facebook, Instagram, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa"; // ✅ Added react-icons WhatsApp
import { TooltipProvider } from "../ui/tooltip";

interface SocialMediaBarChartProps {
  data: Array<{
    platform: string;
    percentage: number;
  }>;
}

export function SocialMediaBarChart({ data }: SocialMediaBarChartProps) {
  const getSocialIcon = (raw: string) => {
    const key = String(raw).trim().toLowerCase();

    // normalize common aliases
    const map: Record<
      string,
      "web" | "facebook" | "instagram" | "whatsapp" | "phone"
    > = {
      web: "web",
      website: "web",
      globe: "web",

      fb: "facebook",
      facebook: "facebook",
      "facebook.com": "facebook",

      ig: "instagram",
      insta: "instagram",
      instagram: "instagram",
      "instagram.com": "instagram",

      wa: "whatsapp",
      whatsapp: "whatsapp",
      "whatsapp.com": "whatsapp",

      phone: "phone",
      call: "phone",
      tel: "phone",
    };

    const norm = map[key] ?? "web";

    switch (norm) {
      case "facebook":
        return <Facebook size={20} className="text-[#1877F2]" />;
      case "instagram":
        return <Instagram size={20} className="text-[#E4405F]" />;
      case "whatsapp":
        return <FaWhatsapp size={20} className="text-[#25D366]" />;
      case "phone":
        return <Phone size={20} className="text-[#4A5568]" />;
      case "web":
      default:
        return <Globe size={20} className="text-gray-500" />;
    }
  };

  return (
    <TooltipProvider>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
          barSize={20}
        >
          <XAxis
            dataKey="platform"
            axisLine={false}
            tickLine={false}
            tick={(props) => {
              const { x, y, payload } = props;
              console.log(payload.value.toLowerCase());
              return (
                <g transform={`translate(${x},${y + 20})`}>
                  <foreignObject width={28} height={28} x={-14} y={0}>
                    <div className="flex items-center justify-center w-7 h-7 bg-gray-100 rounded-full">
                      {getSocialIcon(payload.value.toLowerCase())}
                    </div>
                  </foreignObject>
                </g>
              );
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            formatter={(value: number) => [`${value}%`, "Percentage"]}
            labelFormatter={(label) => `Platform: ${label}`}
          />
          <Bar
            dataKey="percentage"
            fill="#4A0082"
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </TooltipProvider>
  );
}
