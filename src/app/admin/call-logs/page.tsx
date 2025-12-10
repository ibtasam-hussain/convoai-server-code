// NOTE: This is a full updated CallLogs page implementation that includes:
// - Checkbox selection
// - Conditional detail panel replaces charts
// - Pixel-perfect styling for table and stats

"use client";

import { useState } from "react";
import {
  Search,
  ChevronDown,
  Play,
  Phone,
  MapPin,
  Clock,
  BadgeCheck,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/Admin/ui/table";

import { Button } from "@/Components/Admin/ui/button";
import { Badge } from "@/Components/Admin/ui/badge";
import { Card } from "@/Components/Admin/ui/card";

import { ActivityLineChart } from "@/Components/Admin/charts/activity-line-chart";
import { CallDurationBarChart } from "@/Components/Admin/charts/call-duration-bar-chart";
import { LocationBarChart } from "@/Components/Admin/charts/location-bar-chart";
import { dashboardData } from "@/Components/Admin/data/dashboard-data";

import { FaUsers, FaUserPlus, FaHeart, FaCommentDots } from "react-icons/fa";

const dummyLogs = Array(10).fill({
  name: "Syed Qasim Zaidi",
  email: "s.qasimzaidi12@gmail.com",
  id: "KE2677853158",
  phone: "+92 308 219 4448",
  dateTime: "25 Jan 2025 - 06:15 PM",
  duration: "1 hr 19 min 45 sec",
  location: "PECHS, Karachi",
  status: "Open Ticket",
  tags: ["Meter Change"],
  summary: `KE Representative: Hello, this is K-Electric customer support. How can I assist you today?
Customer: Hi, my electricity has been cut off... (truncated)`,
});

const chartData = {
  usersByCity: {
    current: "12.4 K",
    change: "28.6%",
    locations: [
      { name: "Defense Phase 2, Karachi", percentage: 30 },
      { name: "Federal B Area, Karachi", percentage: 70 },
      { name: "Gulshan-e-Iqbal Block 6, Karachi", percentage: 62 },
    ],
  },
};

export default function CallLogsPage() {
  const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null);
  const [usersByCityPeriod] = useState("This Month");
  const [data] = useState(dashboardData);

  return (
    <div className="flex min-h-screen bg-[#F9F9FB]">
      {/* Left: Call Table */}
      <div className="flex-1 p-6">
        {/* Top Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Users</h1>
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              className="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Search for..."
            />
          </div>
        </div>

        {/* User Chat Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white shadow rounded-lg p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
              <FaUsers size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Total Users Chats</p>
              <p className="text-sm text-gray-500">250</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
              <FaUserPlus size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">New Users Chats</p>
              <p className="text-sm text-gray-500">15</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <FaHeart size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Top Users Chats</p>
              <p className="text-sm text-gray-500">200</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <FaCommentDots size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Other Users Chats</p>
              <p className="text-sm text-gray-500">35</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <Card className="shadow-lg">
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <h2 className="text-base font-semibold">All Users</h2>
            <span className="text-sm text-gray-500">1 - 10 of 256</span>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="text-xs text-gray-500">
                <TableHead></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Date / Time</TableHead>
                <TableHead>Call Duration</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {dummyLogs.map((log, i) => (
                <TableRow key={i} className="text-xs hover:bg-gray-50">
                  <TableCell>
                    <input
                      type="checkbox"
                      className="accent-purple-600 h-4 w-4"
                      checked={selectedLogIndex === i}
                      onChange={() =>
                        setSelectedLogIndex(i === selectedLogIndex ? null : i)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Button className="bg-[#7F56D9] text-white p-0 w-8 h-8 rounded-full hover:bg-[#6937C6]">
                        <Play size={14} />
                      </Button>
                      <div>
                        <div className="font-medium text-[13px]">{log.name}</div>
                        <div className="text-[11px] text-gray-500">{log.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[13px]">{log.phone}</TableCell>
                  <TableCell className="text-[13px]">{log.dateTime}</TableCell>
                  <TableCell className="text-[13px]">{log.duration}</TableCell>
                  <TableCell>
                    {log.tags.map((tag: string, j: number) => (
                      <Badge
                        key={j}
                        className="bg-orange-100 text-orange-700 text-[11px]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell className="text-[13px]">{log.location}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700 text-[11px]">
                      {log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Right: Chart or Detail View */}
      <div className="w-[24rem] border-l bg-white p-6 self-start">
        {selectedLogIndex === null ? (
          <div className="space-y-8">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <span>{data.lineCharts[0].title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {data.lineCharts[0].value}
                    </span>
                    <span className="text-xs bg-[#DCFCE7] text-[#16A34A] px-2 py-0.5 rounded">
                      {data.lineCharts[0].percentage} ↑
                    </span>
                  </div>
                </div>
                <button className="flex items-center gap-1 bg-[#4A0082] text-white text-xs px-3 py-1 rounded">
                  <span>This Month</span>
                  <ChevronDown size={14} />
                </button>
              </div>

              <div className="h-32 w-full">
                <ActivityLineChart data={data.lineCharts[0].data} color="#8E44AD" />
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">Last 12 months</span>
                <button className="text-xs text-gray-500">View report</button>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Clock size={16} />
                    <span>{data.barChart.title}</span>
                  </div>
                  <div className="text-2xl font-bold">{data.barChart.value}</div>
                </div>
                <button className="flex items-center gap-1 bg-[#4A0082] text-white text-xs px-3 py-1 rounded">
                  <span>This Month</span>
                  <ChevronDown size={14} />
                </button>
              </div>

              <div className="h-32 w-full">
                <CallDurationBarChart data={data.barChart.data} />
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">Last 12 months</span>
                <button className="text-xs text-gray-500">View report</button>
              </div>
            </Card>

            {/* Users by City */}
            <Card className="p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-2">
                      <span className="text-[16px]">📍</span> Users by City
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-3xl font-bold">{chartData.usersByCity.current}</span>
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      {chartData.usersByCity.change} ↑
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="bg-[#1E0B40] text-white text-xs px-3 py-1"
                  >
                    {usersByCityPeriod} <ChevronDown size={14} />
                  </Button>
                </div>
              </div>

              <LocationBarChart data={chartData.usersByCity.locations} />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Last 12 months</span>
                <button className="text-purple-600 hover:underline">View report</button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-6 px-4 py-2 text-sm text-gray-700">
            {/* Header with avatar + name + email */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-700">
                {dummyLogs[selectedLogIndex].name.charAt(0)}
              </div>
              <div>
                <h2 className="text-[16px] font-semibold text-gray-800 leading-tight">
                  {dummyLogs[selectedLogIndex].name}
                </h2>
                <p className="text-[13px] text-gray-500">
                  {dummyLogs[selectedLogIndex].email}
                </p>
              </div>
            </div>

            {/* Audio Player */}
            <div className="bg-[#4A0082] rounded-xl p-4 flex items-center gap-4">
              <button className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
                <Play className="text-[#4A0082]" size={18} />
              </button>
              <div className="flex-1">
                <div className="w-full h-3 rounded-md bg-white/20">
                  <div className="w-1/2 h-full bg-white rounded-md" />
                </div>
              </div>
            </div>

            {/* Call Details Grid */}
            <div className="text-sm space-y-3 px-1">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={14} />
                <span>{dummyLogs[selectedLogIndex].phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={14} />
                <span>{dummyLogs[selectedLogIndex].location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={14} />
                <span>{dummyLogs[selectedLogIndex].duration}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <BadgeCheck size={14} />
                <Badge className="bg-green-100 text-green-700 text-[11px] px-2 py-[1px] rounded-md">
                  {dummyLogs[selectedLogIndex].status}
                </Badge>
              </div>
            </div>

            {/* Summary Section */}
            <div>
              <h3 className="text-[15px] font-semibold mb-2">Call Summary:</h3>
              <div className="text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                {dummyLogs[selectedLogIndex].summary}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
