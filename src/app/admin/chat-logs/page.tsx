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
  ArrowUpDown,
  Phone,
  MapPin,
  Clock,
  BarChart2,
  BadgeCheck,
} from "lucide-react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/Admin/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/Admin/ui/dropdown-menu";
import { Button } from "@/Components/Admin/ui/button";
import { Badge } from "@/Components/Admin/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/Admin/ui/select";
import { Card } from "@/Components/Admin/ui/card";
import { ActivityLineChart } from "@/Components/Admin/charts/activity-line-chart";
import { SocialMediaBarChart } from "@/Components/Admin/charts/social-media-bar-chart";
import { FaUsers, FaUserPlus, FaHeart, FaCommentDots } from "react-icons/fa";

import { LocationBarChart } from "@/Components/Admin/charts/location-bar-chart";
import { dashboardData } from "@/Components/Admin/data/dashboard-data";
const timePeriods = ["Today", "This Week", "This Month"];

const messages = [
  {
    id: 1,
    sender: "user", // 'user' = incoming, 'self' = outgoing
    content: "Hello John! Hope you're doing well. I need your help with some reports, are you available for a call later today?",
    time: "10:40 AM",
  },
  {
    id: 2,
    sender: "user",
    content: "Thank you",
    time: "10:40 AM",
  },
  {
    id: 3,
    sender: "self",
    content: "Hey Sophie! How are you?",
  },
  {
    id: 4,
    sender: "self",
    content: "For sure, I’ll be free after mid-day, let me know what time works for you",
    time: "11:41 AM",
  },
  {
    id: 5,
    sender: "user",
    content: "Hello John! Hope you're doing well. I need your help with some reports, are you available for a call later today?",
    time: "10:40 AM",
  },
  {
    id: 6,
    sender: "user",
    content: "Thank you",
    time: "10:40 AM",
  },
  {
    id: 7,
    sender: "self",
    content: "Hey Sophie! How are you?",
  },
]


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
  summary: `KE Representative: Hello, this is K-Electric customer support. How can I assist you today?\nCustomer: Hi, my electricity has been cut off... (truncated)`,
});

const chartData = {
  avgCallDuration: {
    current: "400",
    change: "16.9%",
    data: Array(24)
      .fill(0)
      .map((_, i) => ({
        time: `${i}:00`,
        value: Math.floor(Math.random() * 300) + 100,
      })),
  },
  totalCalls: {
    current: "312",
    change: "28.6%",
    data: Array(24)
      .fill(0)
      .map((_, i) => ({
        time: `${i}:00`,
        value: Math.floor(Math.random() * 50) + 10,
      })),
  },
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
  const [avgCallDurationPeriod, setAvgCallDurationPeriod] =
    useState("This Month");
  const [totalCallsPeriod, setTotalCallsPeriod] = useState("This Month");
  const [usersByCityPeriod, setUsersByCityPeriod] = useState("This Month");
  const [data, setData] = useState(dashboardData);
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
          {/* Total Users Chats */}
          <div className="bg-white shadow rounded-lg p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
              <FaUsers size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Total Users Chats
              </p>
              <p className="text-sm text-gray-500">250</p>
            </div>
          </div>

          {/* New Users Chats */}
          <div className="bg-white shadow rounded-lg p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
              <FaUserPlus size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                New Users Chats
              </p>
              <p className="text-sm text-gray-500">15</p>
            </div>
          </div>

          {/* Top Users Chats */}
          <div className="bg-white shadow rounded-lg p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <FaHeart size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Top Users Chats
              </p>
              <p className="text-sm text-gray-500">200</p>
            </div>
          </div>

          {/* Other Users Chats */}
          <div className="bg-white shadow rounded-lg p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <FaCommentDots size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Other Users Chats
              </p>
              <p className="text-sm text-gray-500">35</p>
            </div>
          </div>
        </div>
        {/* Table */}
        <Card className="shadow-lg">
          {/* Header with title + pagination + filter */}
          <div className="flex justify-between items-center px-4 py-4 border-b bg-white">
            <h2 className="text-lg font-semibold text-gray-800">All Users</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                <span className="font-semibold text-purple-700">1 - 10</span>
                <span className="text-gray-400"> of 256</span>
              </span>
              <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-100 transition">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 4a1 1 0 011-1h3m10 0h3a1 1 0 011 1v3M4 20a1 1 0 001 1h3m10 0h3a1 1 0 001-1v-3M16 3v4a1 1 0 001 1h4M3 16v4a1 1 0 001 1h4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="uppercase text-[11px] text-gray-500 bg-gray-50">
                <TableHead className="px-2"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date / Time</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {dummyLogs.map((log, i) => (
                <TableRow
                  key={i}
                  className="text-[13px] hover:bg-gray-50 transition-all"
                >
                  {/* Checkbox */}
                  <TableCell className="px-2">
                    <input
                      type="checkbox"
                      className="accent-purple-600 h-4 w-4"
                      checked={selectedLogIndex === i}
                      onChange={() =>
                        setSelectedLogIndex(i === selectedLogIndex ? null : i)
                      }
                    />
                  </TableCell>

                  {/* Name & ID */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center text-sm font-semibold">
                        {log.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[13px]">
                          {log.name}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {log.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Source (icon + handle) */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          fill="currentColor"
                          className="bi bi-facebook"
                          viewBox="0 0 16 16"
                        >
                          <path d="M8.94 8.5H7.5V16H5V8.5H3.5V6h1.5V4.5a2.5 2.5 0 012.5-2.5h2V4H9a.5.5 0 00-.5.5V6h2.19l-.25 2.5z" />
                        </svg>
                      </div>
                      <span className="text-[13px] text-gray-700">
                        @syed.qasim
                      </span>
                    </div>
                  </TableCell>

                  {/* Date / Time */}
                  <TableCell>
                    <div className="text-[13px] text-gray-700">
                      {log.dateTime}
                    </div>
                  </TableCell>

                  {/* Tags */}
                  <TableCell>
                    {log.tags.map((tag, j) => (
                      <Badge
                        key={j}
                        className="bg-orange-100 text-orange-700 text-[11px] font-medium px-2 py-0.5 rounded"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </TableCell>

                  {/* Location */}
                  <TableCell>
                    <div className="text-[13px] text-gray-700">
                      {log.location}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700 text-[11px] font-medium px-2 py-0.5 rounded">
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
                <ActivityLineChart
                  data={data.lineCharts[0].data}
                  color="#8E44AD"
                />
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
                    <BarChart2 size={16} />
                    <span>{data.socialChart.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-[#DCFCE7] text-[#16A34A] px-2 py-0.5 rounded">
                      {data.socialChart.percentage} ↑
                    </span>
                  </div>
                </div>
                <button className="flex items-center gap-1 bg-[#4A0082] text-white text-xs px-3 py-1 rounded">
                  <span>This Month</span>
                  <ChevronDown size={14} />
                </button>
              </div>

              <div className="h-32 w-full">
                <SocialMediaBarChart data={data.socialChart.data} />
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
                    <span className="text-3xl font-bold">
                      {chartData.usersByCity.current}
                    </span>
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
                <button className="text-purple-600 hover:underline">
                  View report
                </button>
              </div>
            </Card>
          </div>
        ) : (

 <div className="w-full max-w-sm mx-auto rounded-xl shadow bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-semibold">
          S
        </div>
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold text-gray-800">Syed Qasim Zaidi</h2>
          <p className="text-xs text-gray-500">@s.qasimzaidi2/</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="p-4 space-y-4 text-sm max-h-[400px] overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === "self" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`rounded-xl px-4 py-2 max-w-[80%] ${
                msg.sender === "self"
                  ? "bg-purple-900 text-white"
                  : "bg-[#1E0B40] text-white"
              }`}
            >
              {msg.content}
            </div>
            {msg.time && (
              <span className="text-xs text-gray-400 mt-1">{msg.time}</span>
            )}
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="flex items-center px-4 py-3 border-t bg-gray-50">
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg outline-none"
        />
        <button className="ml-2 px-4 py-2 bg-[#8C3EFF] text-white text-sm rounded-lg font-medium">
          Send
        </button>
      </div>
    </div>

        )}
      </div>
    </div>
  );
}
