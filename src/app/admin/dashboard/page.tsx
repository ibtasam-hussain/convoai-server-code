'use client';

import { useState } from "react";
import {
  Phone,
  MessageSquare,
  Ticket,
  Clock,
  ChevronDown,
  BarChart2,
  ExternalLink,
  Search,
} from "lucide-react";
import { dashboardData } from "@/Components/Admin/data/dashboard-data";
import { Card } from "@/Components/Admin/ui/card";
import { ComplaintsAreaChart } from "@/Components/Admin/charts/complaints-area-chart";
import { CallDurationBarChart } from "@/Components/Admin/charts/call-duration-bar-chart";
import { ActivityLineChart } from "@/Components/Admin/charts/activity-line-chart";
import { SocialMediaBarChart } from "@/Components/Admin/charts/social-media-bar-chart";
import { LocationBarChart } from "@/Components/Admin/charts/location-bar-chart";

export default function Dashboard() {
  const [data] = useState(dashboardData);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-4 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-sm sticky top-0 z-10">
        {/* LEFT - Welcome */}
        <h1 className="text-xl sm:text-2xl font-medium text-gray-800 min-w-max">
          Welcome back,<br className="lg:hidden" /> John
        </h1>

        {/* CENTER - Search */}
        <div className="flex-1 w-full lg:max-w-xl relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4A0082]"
          />
        </div>

        {/* RIGHT - Buttons */}
        <div className="flex items-center gap-3 justify-end w-full lg:w-auto">
          <button className="bg-[#4A0082] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#3b0069] text-sm">
            Test Call <ExternalLink size={16} />
          </button>

          <button className="bg-[#4A0082] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#3b0069] text-sm">
            Test Chat <ExternalLink size={16} />
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 px-4 sm:px-6 pt-6">
        {data.statsCards.map((card, index) => (
          <StatCard
            key={index}
            icon={getIconByName(card.icon)}
            title={card.title}
            value={card.value}
            percentage={card.percentage}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 sm:px-6 pt-6">
        {/* Left Chart */}
        <Card className="col-span-1 lg:col-span-5 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-gray-500 text-sm">{data.mainChart.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{data.mainChart.value}</span>
                <span className="text-xs bg-[#DCFCE7] text-[#16A34A] px-2 py-0.5 rounded">
                  {data.mainChart.percentage} ↑
                </span>
              </div>
            </div>
            <button className="flex items-center gap-1 bg-[#4A0082] text-white text-xs px-3 py-1 rounded">
              <span>Jan 2024 - Dec 2024</span>
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="h-64 w-full">
            <ComplaintsAreaChart data={data.mainChart.data} />
          </div>
        </Card>

        {/* Right Charts */}
        <div className="col-span-1 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-4">
            <ChartHeader
              title={data.barChart.title}
              value={data.barChart.value}
              percentage={data.barChart.percentage || "28.4%"}
            />
            <div className="h-32 w-full">
              <CallDurationBarChart data={data.barChart.data} />
            </div>
          </Card>

          {data.lineCharts.map((chart, i) => (
            <Card className="p-4" key={i}>
              <ChartHeader
                title={chart.title}
                value={chart.value}
                percentage={chart.percentage}
              />
              <div className="h-32 w-full">
                <ActivityLineChart
                  data={chart.data}
                  color={i === 0 ? "#8E44AD" : "#4A0082"}
                />
              </div>
            </Card>
          ))}

          <Card className="p-4">
            <ChartHeader
              title={data.socialChart.title}
              value={data.socialChart.value || ""}
              percentage={data.socialChart.percentage}
            />
            <div className="h-32 w-full">
              <SocialMediaBarChart data={data.socialChart.data} />
            </div>
          </Card>
        </div>
      </div>

      {/* Users by Location */}
      <div className="px-4 sm:px-6 pt-6 pb-8">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h3 className="text-gray-500 text-sm">{data.locationData.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{data.locationData.value}</span>
                <span className="text-xs bg-[#DCFCE7] text-[#16A34A] px-2 py-0.5 rounded">
                  {data.locationData.percentage} ↑
                </span>
              </div>
            </div>

            <button className="flex items-center gap-1 bg-[#4A0082] text-white text-xs px-3 py-1 rounded">
              <span>This Month</span>
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="col-span-1 md:col-span-2">
              <LocationBarChart data={data.locationData.locations} />
            </div>

            <div className="col-span-1 flex justify-center md:justify-end">
              <WorldMap />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* 📊 Stat Card */
function StatCard({ icon, title, value, percentage }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
        {icon}
        <span>{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-xs bg-[#DCFCE7] text-[#16A34A] px-2 py-0.5 rounded">
          {percentage} ↑
        </span>
      </div>
    </Card>
  );
}

/* 📈 Chart Header */
function ChartHeader({ title, value, percentage }) {
  return (
    <div className="flex justify-between items-center mb-2">
      <div>
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <BarChart2 size={16} />
          <span>{title}</span>
        </div>
        {value && <div className="text-2xl font-bold">{value}</div>}
        {percentage && (
          <div className="text-xs bg-[#DCFCE7] text-[#16A34A] px-2 py-0.5 rounded w-fit mt-1">
            {percentage} ↑
          </div>
        )}
      </div>
      <button className="flex items-center gap-1 bg-[#4A0082] text-white text-xs px-3 py-1 rounded">
        <span>This Month</span>
        <ChevronDown size={14} />
      </button>
    </div>
  );
}

/* 🌍 World Map */
function WorldMap() {
  return (
    <div className="w-[16rem] sm:w-[20rem] md:w-[22rem]">
      <img
        src="/assets/Admin/dashboard/world.svg"
        alt="world map"
        className="w-full object-contain"
      />
    </div>
  );
}

/* 🧩 Icon Helper */
function getIconByName(iconName) {
  const icons = {
    phone: <Phone className="text-[#4A0082]" size={18} />,
    "message-square": <MessageSquare className="text-[#4A0082]" size={18} />,
    clock: <Clock className="text-[#4A0082]" size={18} />,
    ticket: <Ticket className="text-[#4A0082]" size={18} />,
  };
  return icons[iconName] || <BarChart2 className="text-[#4A0082]" size={18} />;
}
