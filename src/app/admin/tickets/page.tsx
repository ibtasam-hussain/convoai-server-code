"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronRight, ChevronLeft, Phone, MessageSquare, Ticket, MessageCircle } from "lucide-react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";

type UserRow = {
  id: number;
  name: string;
  code: string;
  source: "facebook" | "phone" | "instagram" | "whatsapp";
  date: string;
  tag: string;
  location: string;
  status: "Active Complain" | "Inprogress" | "Closed Complain";
};

const mock: UserRow[] = Array.from({ length: 10 }).map((_, i) => {
  const sources = ["facebook", "phone", "instagram", "whatsapp"] as const;
  const statuses = ["Active Complain", "Inprogress", "Closed Complain"] as const;
  const src = sources[i % sources.length];
  const st = statuses[i % statuses.length];
  return {
    id: i + 1,
    name: "Syed Qasim Zaidi",
    code: "KZ697875385",
    source: src,
    date: "25 Jan 2025 · 06:15 PM",
    tag: "Meter Change",
    location: "PECHS, Karachi",
    status: st,
  } as UserRow;
});

export default function UsersPage() {
  const [rowsPerPage, setRowsPerPage] = useState(10);

  return (
    <div className="min-h-screen w-full bg-[#F5F6FA] text-[#333B69]">
      <div className="mx-auto max-w-[1400px] px-4 pt-6">
<div className="flex items-center justify-between mb-4">
  {/* Left side: Title + Search */}
  <div className="flex items-center gap-4">
    <h1 className="text-[18px] font-semibold tracking-[-0.2px]">Users</h1>
    <div className="relative w-full max-w-[320px]"> {/* increased from 240px to 320px */}
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9AA2B1]" />
      <input
        placeholder="Search for..."
        className="h-8 w-full rounded-lg border border-[#E6E8F0] bg-white pl-8 pr-3 text-xs text-[#6B7280] placeholder:text-[#9AA2B1] focus:border-[#7C8DB5] focus:outline-none"
      />
    </div>
  </div>

  {/* Right side: Button */}
  <button className="inline-flex items-center gap-2 rounded-lg bg-[#1E1E2D] px-3 py-1.5 text-xs font-medium text-white shadow hover:opacity-95">
    <span>Jan 2024 - Dec 2024</span>
    <ChevronDown className="h-3.5 w-3.5" />
  </button>
</div>




        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-5">
          <MetricCard icon={<Ticket className="h-3.5 w-3.5" />} title="New Tickets" value="365" delta="28.4%" />
          <MetricCard icon={<MessageSquare className="h-3.5 w-3.5" />} title="Tickets In Progress" value="982" delta="28.4%" />
          <MetricCard icon={<MessageCircle className="h-3.5 w-3.5" />} title="Tickets Closed" value="982" delta="28.4%" />
          <MetricCard icon={<Phone className="h-3.5 w-3.5" />} title="Tickets Call" value="982" delta="28.4%" />
        </div>

        <div className="overflow-hidden rounded-xl border border-[#EEF2F6] bg-white">
          <div className="flex items-center justify-between border-b border-[#EEF2F6] px-4 py-3">
            <span className="text-xs font-semibold">All Users</span>
            <span className="text-[11px] text-[#9AA2B1]">1 - 10 of 256</span>
          </div>

          <div className="w-full">
            <div className="grid grid-cols-[40px_1.2fr_0.9fr_1fr_0.9fr_1fr_1fr] items-center border-b border-[#EEF2F6] bg-[#FAFBFF] px-4 py-2 text-[11px] font-medium text-[#9AA2B1]">
              <input type="checkbox" className="h-3.5 w-3.5 rounded border-[#D6D9E0]" />
              <HeaderCell>Name</HeaderCell>
              <HeaderCell>Source</HeaderCell>
              <HeaderCell>Date / Time</HeaderCell>
              <HeaderCell>Tags</HeaderCell>
              <HeaderCell>Location</HeaderCell>
              <HeaderCell>Status</HeaderCell>
            </div>
{mock.map((u, idx) => (
  <div
    key={u.id}
    className={`grid grid-cols-[40px_1.2fr_0.9fr_1fr_0.9fr_1fr_1fr] items-center px-4 py-3 text-[12px] ${
      idx !== mock.length - 1 ? "border-b border-[#F1F4F9]" : ""
    } hover:bg-[#FAFBFF]`}
  >
    {/* checkbox */}
    <input
      type="checkbox"
      className="h-3.5 w-3.5 rounded border-[#D6D9E0]"
    />

    {/* name + code */}
    <div className="flex items-center gap-2">
      <div className="grid h-7 w-7 place-items-center rounded-full bg-[#805AD5] text-white text-[10px]">
        SZ
      </div>
      <div>
        <div className="text-[12px] font-semibold text-[#232323]">{u.name}</div>
        <div className="text-[10px] text-[#9AA2B1]">{u.code}</div>
      </div>
    </div>

    {/* source icon (centered in column) */}
    <div className="justify-self-center">
      <SourceIcon source={u.source} />
    </div>

    {/* date */}
    <div className="text-[#6B7280]">{u.date}</div>

  <div className="flex items-center">
  <span className="inline-flex items-center rounded-[6px] border border-[#F5D4AF] bg-[#FFF6EE] px-2 py-[3px] text-[10px] font-medium leading-none text-[#C1813D] whitespace-nowrap">
    + {u.tag}
  </span>
</div>

    {/* location */}
    <div className="text-[#6B7280]">{u.location}</div>

    {/* status (right-aligned chip, tight bg) */}
<div className="flex items-center justify-center">
  <StatusPill status={u.status} />
</div>
  </div>
))}

          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[11px] text-[#9AA2B1]">1 - 10 of 460</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[11px] text-[#9AA2B1]">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
                  className="h-7 rounded-md border border-[#E6E8F0] bg-white px-1.5 text-xs text-[#333B69] focus:outline-none"
                >
                  {[10, 20, 30, 40].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="grid h-7 w-7 place-items-center rounded-md border border-[#E6E8F0] bg-white hover:bg-[#F5F6FA]">
                  <ChevronLeft className="h-3.5 w-3.5 text-[#6B7280]" />
                </button>
                <button className="grid h-7 w-7 place-items-center rounded-md border border-[#E6E8F0] bg-white hover:bg-[#F5F6FA]">
                  <ChevronRight className="h-3.5 w-3.5 text-[#6B7280]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderCell({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-1 text-[#7C8DB5]">{children}</div>;
}

function MetricCard({ icon, title, value, delta }: { icon: React.ReactNode; title: string; value: string; delta: string; }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#EEF2F6] bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-[#F2F6FF] text-[#4A63E7]">{icon}</div>
        <div>
          <div className="text-[11px] text-[#7C8DB5]">{title}</div>
          <div className="mt-0.5 text-lg font-semibold text-[#232323]">{value}</div>
        </div>
      </div>
      <span className="rounded bg-[#EAF8EE] px-1.5 py-0.5 text-[10px] font-semibold text-[#30A46C]">{delta} ↑</span>
    </div>
  );
}

function SourceIcon({ source }: { source: UserRow["source"] }) {
  const cls = "h-4 w-4";
  if (source === "facebook") return <FaFacebookF className={cls + " text-[#1877F2]"} />;
  if (source === "instagram") return <FaInstagram className={cls + " text-[#E4405F]"} />;
  if (source === "whatsapp") return <FaWhatsapp className={cls + " text-[#25D366]"} />;
  return <Phone className={cls + " text-[#6B7280]"} />;
}

function StatusPill({ status }: { status: UserRow["status"] }) {
  const base = "inline-flex items-center rounded-[6px] px-2 py-[3px] text-[10px] font-semibold leading-none whitespace-nowrap";
  if (status === "Active Complain")
    return <span className={`${base} bg-[#CFF5E3] text-[#2E9E5B]`}>• Active Complain</span>;
  if (status === "Inprogress")
    return <span className={`${base} bg-[#DDEAFF] text-[#3B82F6]`}>• Inprogress</span>;
  return <span className={`${base} bg-[#EAEFF4] text-[#6B7280]`}>• Closed Complain</span>;
}

