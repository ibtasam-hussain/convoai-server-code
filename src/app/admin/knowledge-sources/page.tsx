"use client";

import { useMemo } from "react";
import { Search, MoreVertical } from "lucide-react";

type Row = { id: number; name: string; status: "Pending"; updatedAt: string };

const rowsSeed: Row[] = Array.from({ length: 9 }).map((_, i) => ({
  id: i + 1,
  name: "Our Company Knowledge",
  status: "Pending",
  updatedAt: "Jan 3, 2025, 1:35 AM",
}));

export default function KnowledgeSourcesPage() {
  const rows = useMemo(() => rowsSeed, []);

  return (
    <div className="min-h-screen w-full bg-[#F6F7FB]">
      <div className="mx-auto max-w-[1168px] px-6 pt-8 pb-10">
        {/* Title */}
        <div>
          <h1 className="text-[28px] font-extrabold leading-none text-[#22253A] tracking-[-0.3px]">
            Knowledge Sources
          </h1>
          <p className="mt-2 text-[13px] text-[#7D8595]">
            ConvoAI will use knowledge from the sources that you add here to answer customer questions.
          </p>

          <button className="mt-3 text-[14px] font-semibold text-[#4B2BAE] underline decoration-[#4B2BAE] underline-offset-2 hover:opacity-90">
            Q&As
          </button>
        </div>

        {/* Search */}
        <div className="mt-5">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B3BAC7]" />
            <input
              placeholder="Search for anything..."
              className="h-11 w-full rounded-[10px] border border-[#E8EBF2] bg-white pl-10 pr-3 text-[13px] text-[#495063] placeholder:text-[#B3BAC7] focus:border-[#C9CFE0] focus:outline-none"
            />
          </div>
        </div>

        {/* Upload widget */}
        <div className="mt-8">
          <p className="mb-2 text-[13px] font-medium text-[#737A8C]">Upload File</p>

          <div className="flex items-center gap-4">
            <button className="inline-flex items-center gap-2 rounded-md bg-[#5B2ECC] px-4 py-2 text-[12px] font-semibold text-white shadow hover:opacity-95 active:scale-[0.99]">
              Add File
              <span className="text-[10px]">↗</span>
            </button>

            <div className="min-w-0 flex-1">
              {/* progress bar */}
              <div className="relative h-[6px] w-full rounded-full bg-[#ECEFF6]">
                <div className="absolute left-0 top-0 h-full w-[30%] rounded-full bg-[#7B61FF]" />
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[12px] text-[#8088A2]">
                <span className="truncate">Our Company Knowledge.pdf</span>
                <span>Estimated Time: 18 hr 16 min</span>
              </div>
            </div>

            <span className="text-[12px] font-medium text-[#8088A2]">30%</span>
          </div>
        </div>

        {/* Results */}
        <p className="mt-7 text-[13px] text-[#7D8595]">Results: 6</p>

        {/* Table */}
        <div className="mt-2 overflow-hidden rounded-[14px] border border-[#E8EBF2] bg-white">
          {/* Header */}
          <div className="grid grid-cols-[56px_1.2fr_0.9fr_1fr_40px] items-center border-b border-[#EEF1F6] bg-[#FBFCFF] px-4 py-3 text-[12px] font-semibold text-[#A0A8BB]">
            <div className="flex items-center">
              <input type="checkbox" className="h-4 w-4 rounded border-[#D7DCE7]" />
            </div>
            <div className="pl-1">Name</div>
            <div className="pl-1">Status</div>
            <div className="pl-1">Last updated</div>
            <div />
          </div>

          {/* Body (scrollable like screenshot) */}
          <div className="max-h-[470px] overflow-auto">
            {rows.map((r, i) => (
              <div
                key={r.id}
                className={[
                  "grid grid-cols-[56px_1.2fr_0.9fr_1fr_40px] items-center px-4 py-4 text-[13px]",
                  i !== rows.length - 1 ? "border-b border-[#EEF1F6]" : "",
                  "hover:bg-[#FBFCFF]",
                ].join(" ")}
              >
                <div className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 rounded border-[#D7DCE7]" />
                </div>

                {/* Name */}
                <div className="pl-1 text-[#30374F]">{r.name}</div>

                {/* Status pill */}
                <div className="pl-1">
                  <span className="inline-flex items-center rounded-[8px] border border-[#F5D4AF] bg-[#FFF6EE] px-2 py-[3px] text-[11px] font-medium leading-none text-[#C1813D]">
                    • Pending
                  </span>
                </div>

                {/* Date */}
                <div className="pl-1 text-[12px] text-[#9098AD]">{r.updatedAt}</div>

                {/* Row actions */}
                <button className="ml-auto grid h-8 w-8 place-items-center rounded-md text-[#9AA2B1] hover:bg-[#F2F4FA]">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* custom thin scrollbar accent (WebKit) */}
      <style jsx global>{`
        .max-h-\\[470px\\]::-webkit-scrollbar {
          width: 8px;
        }
        .max-h-\\[470px\\]::-webkit-scrollbar-track {
          background: transparent;
        }
        .max-h-\\[470px\\]::-webkit-scrollbar-thumb {
          background: #7b61ff;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
}
