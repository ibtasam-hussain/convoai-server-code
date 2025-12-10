"use client";

import { useMemo } from "react";
import { Plus, Phone, Send, Search } from "lucide-react";

/* -------------------- Types -------------------- */
type Msg = { id: string; me?: boolean; text: string };
type Thread = {
  id: string;
  name: string;
  subtitle: string;
  avatar: string;
  time: string;
  badges?: { text: string; tone: "yellow" | "green" | "blue" }[];
  active?: boolean;
};

/* -------------------- Mock Data -------------------- */
const threadsSeed: Thread[] = [
  {
    id: "1",
    name: "Elmer Laverty",
    subtitle: "Haha oh man 🔥",
    avatar: "https://i.pravatar.cc/40?img=12",
    time: "12m",
    badges: [
      { text: "Question", tone: "yellow" },
      { text: "Help wanted", tone: "green" },
    ],
  },
  {
    id: "2",
    name: "Florencio Dorrance",
    subtitle: "woooooo",
    avatar: "https://i.pravatar.cc/40?img=5",
    time: "24m",
    active: true,
  },
  {
    id: "3",
    name: "Lavern Laboy",
    subtitle: "Haha that's terrifying 😂",
    avatar: "https://i.pravatar.cc/40?img=7",
    time: "1h",
    badges: [
      { text: "Bug", tone: "yellow" },
      { text: "Hacktoberfest", tone: "green" },
    ],
  },
  {
    id: "4",
    name: "Titus Kitamura",
    subtitle: "omg, this is amazing",
    avatar: "https://i.pravatar.cc/40?img=1",
    time: "5h",
    badges: [
      { text: "Question", tone: "yellow" },
      { text: "Some content", tone: "blue" },
    ],
  },
  {
    id: "5",
    name: "Geoffrey Mott",
    subtitle: "aww 😍",
    avatar: "https://i.pravatar.cc/40?img=14",
    time: "2d",
    badges: [{ text: "Request", tone: "green" }],
  },
  {
    id: "6",
    name: "Alfonzo Schuessler",
    subtitle: "perfect!",
    avatar: "https://i.pravatar.cc/40?img=10",
    time: "1m",
    badges: [{ text: "Follow up", tone: "blue" }],
  },
];

/* -------------------- Page -------------------- */
export default function ChatPage() {
  const current = useMemo(
    () => threadsSeed.find((t) => t.active) ?? threadsSeed[1],
    []
  );


  const leftMsgs: Msg[] = [
    { id: "m1", text: "omg, this is amazing" },
    { id: "m2", text: "perfect! ✅" },
    { id: "m3", text: "Wow, this is really epic" },
    { id: "m4", text: "just ideas for next time" },
    { id: "m5", text: "I'll be there in 2 mins ⏱️" },
    { id: "m6", text: "aww" },
    { id: "m7", text: "omg, this is amazing" },
    { id: "m8", text: "woohoooo 🔥" },
  ];

  const rightMsgs: Msg[] = [
    { id: "r1", me: true, text: "How are you?" },
    { id: "r2", me: true, text: "wooohooo" },
    { id: "r3", me: true, text: "Haha oh man" },
    { id: "r4", me: true, text: "Haha that's ARTSHAFT 😂" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F5F6FA] py-3">
      {/* wider container */}
      <div className="mx-auto max-w-[1400px] rounded-xl border border-[#E9ECF3] bg-white">
        {/* narrower sidebar, more room for chat */}
        <div className="grid grid-cols-[320px_1fr] divide-x divide-[#EEF1F6]">
          {/* ---------- Sidebar ---------- */}
          <aside className="flex h-[calc(100vh-48px)] flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-2">
                <h2 className="text-[13px] font-semibold text-[#111827]">
                  Messages
                </h2>
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#EEF2FF] px-1.5 text-[10px] font-medium text-[#4F46E5]">
                  12
                </span>
              </div>
              <button className="grid h-7 w-7 place-items-center rounded-full bg-[#1F1C45] text-white hover:opacity-90">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pb-2.5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A1A8B3]" />
                <input
                  placeholder="Search messages"
                  className="h-9 w-full rounded-lg border border-[#EAECF0] bg-[#F7F8FB] pl-8 pr-3 text-[12px] text-[#606773] placeholder:text-[#A1A8B3] focus:border-[#CFD5E2] focus:outline-none"
                />
              </div>
            </div>

            {/* Thread list */}
            <div className="scrollbar-thin flex-1 overflow-auto px-3 pb-3">
              <ul className="space-y-1.5">
                {threadsSeed.map((t) => (
                  <li key={t.id}>
                    <button
                      className={[
                        "group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition",
                        t.active ? "bg-[#EEF1FF]" : "hover:bg-[#F7F8FB]",
                      ].join(" ")}
                    >
                      <img
                        src={t.avatar}
                        className="mt-[1px] h-8 w-8 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-[12px] font-semibold text-[#111827]">
                            {t.name}
                          </p>
                          <span className="shrink-0 text-[10px] text-[#9AA2B1]">
                            {t.time}
                          </span>
                        </div>
                        <p className="truncate text-[11px] text-[#7C8591]">
                          {t.subtitle}
                        </p>
                        {t.badges && (
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {t.badges.map((b, i) => (
                              <span
                                key={i}
                                className={[
                                  "inline-flex items-center rounded-md px-1.5 py-[2px] text-[9px] font-medium",
                                  b.tone === "yellow" && "bg-[#FFF6E6] text-[#B17000]",
                                  b.tone === "green" && "bg-[#E8F7EB] text-[#18794E]",
                                  b.tone === "blue" && "bg-[#EBF1FF] text-[#314DCF]",
                                ].join(" ")}
                              >
                                {b.text}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* ---------- Chat ---------- */}
          <main className="flex h-[calc(100vh-48px)] flex-col">
            {/* Chat header */}
            <div className="flex items-center justify-between px-6 py-3.5">
              <div className="flex items-center gap-2.5">
                <img
                  src={current.avatar}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-[13px] font-semibold text-[#111827]">
                    {current.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#30A46C]" />
                    <span className="text-[11px] text-[#6B7280]">Online</span>
                  </div>
                </div>
              </div>
              <button className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#1F1C45] hover:bg-[#F7F8FB]">
                <Phone className="h-4 w-4" />
                Call
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-[#EEF1F6]" />

            {/* Messages */}
            <div className="flex-1 overflow-auto p-5">
              <div className="space-y-4">
                {/* Left group 1 */}
                <div className="flex items-start gap-2.5">
                  <img
                    src={current.avatar}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <div className="space-y-1.5">
                    {leftMsgs.slice(0, 3).map((m) => (
                      <Bubble key={m.id} text={m.text} side="left" />
                    ))}
                  </div>
                </div>

                {/* Left group 2 */}
                <div className="flex items-start gap-2.5">
                  <img
                    src={current.avatar}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <div className="space-y-1.5">
                    {leftMsgs.slice(3, 5).map((m) => (
                      <Bubble key={m.id} text={m.text} side="left" />
                    ))}
                  </div>
                </div>

                {/* Right group 1 */}
                <div className="flex items-start justify-end gap-2.5">
                  <div className="max-w-[62%] space-y-1.5">
                    <Bubble text={rightMsgs[0].text} side="right" />
                  </div>
                  <img
                    src="https://i.pravatar.cc/40?img=3"
                    className="mt-[1px] h-7 w-7 rounded-full object-cover"
                  />
                </div>

                {/* Right group 2 */}
                <div className="flex items-start justify-end gap-2.5">
                  <div className="max-w-[62%] space-y-1.5">
                    {rightMsgs.slice(1).map((m) => (
                      <Bubble key={m.id} text={m.text} side="right" />
                    ))}
                  </div>
                  <img
                    src="https://i.pravatar.cc/40?img=3"
                    className="mt-[1px] h-7 w-7 rounded-full object-cover"
                  />
                </div>

                {/* Left group 3 */}
                <div className="flex items-start gap-2.5">
                  <img
                    src={current.avatar}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <div className="space-y-1.5">
                    {leftMsgs.slice(5).map((m) => (
                      <Bubble key={m.id} text={m.text} side="left" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Composer */}
            <div className="border-t border-[#EEF1F6] px-6 py-3.5">
              <div className="flex items-center gap-3">
                <button className="grid h-8 w-8 place-items-center rounded-full text-[#6B7280] hover:bg-[#F7F8FB]">
                  <span className="text-base">⌁</span>
                </button>
                <div className="relative flex-1">
                  <input
                    placeholder="Type a message"
                    className="h-10 w-full rounded-lg border border-[#EAECF0] bg-[#F7F8FB] px-3.5 text-[13px] text-[#111827] placeholder:text-[#A1A8B3] focus:border-[#CFD5E2] focus:outline-none"
                  />
                </div>
                <button className="inline-flex items-center gap-2 rounded-lg bg-[#4B2BAE] px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-95">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* -------------------- UI Bits -------------------- */
function Bubble({ text, side }: { text: string; side: "left" | "right" }) {
  if (side === "right") {
    return (
      <div className="ml-auto w-fit rounded-2xl bg-[#24124A] px-3 py-1.5 text-[12px] text-white shadow-sm">
        {text}
      </div>
    );
  }
  return (
    <div className="w-fit rounded-2xl bg-[#F2F4F7] px-3 py-1.5 text-[12px] text-[#111827] shadow-sm">
      {text}
    </div>
  );
}
