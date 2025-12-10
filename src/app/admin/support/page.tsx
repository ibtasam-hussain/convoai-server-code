"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

type Faq = { id: number; q: string; a?: string };

const FAQS: Faq[] = [
  {
    id: 1,
    q: "The expense windows adapted sir. Wrong widen drawn.",
    a: "Offending belonging promotion provision an be oh consulted ourselves it. Blessing welcomed ladyship she met humoured sir breeding her.",
  },
  { id: 2, q: "Six curiosity day assurance bed necessary?",
    a: "Offending belonging promotion provision an be oh consulted ourselves it. Blessing welcomed ladyship she met humoured sir breeding her.",
   },
  { id: 3, q: "Produce say the ten moments parties?" },
  { id: 4, q: "Simple innate summer fat appear basket his desire joy?" },
  { id: 5, q: "Outward clothes promise at gravity do excited?" },
  { id: 6, q: "Six curiosity day assurance bed necessary?" },
  { id: 7, q: "Produce say the ten moments parties?" },
];

export default function FAQPage() {
  const [openId, setOpenId] = useState<number | null>(1);

  return (
    <div className="min-h-screen bg-[#F4F6FA]" style={{ paddingLeft: 0 }}>
      <div className="px-6 md:px-10 py-8">
        <h1 className="text-[28px] font-semibold text-[#2F3147]">
          Frequently asked questions
        </h1>
        <p className="mt-1 text-sm text-[#8A93A6] max-w-3xl">
          ConvoAI will use knowledge from the sources that you add here you add here to answer customer questions.
        </p>

        {/* Layout: left list + right card */}
        <div className="mt-6 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_370px]">
          {/* LEFT: Accordion list */}
          <div className="space-y-3">
            {FAQS.map((f) => {
              const isOpen = openId === f.id;
              return (
                <div
                  key={f.id}
                  className={`rounded-xl bg-white ring-1 ring-[#E6ECF5] transition-shadow ${
                    isOpen ? "shadow-[0_10px_30px_rgba(226,236,249,0.6)]" : ""
                  }`}
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : f.id)}
                    className="w-full text-left"
                  >
                    {/* Row: text left, plus icon right */}
                    <div className="flex items-start gap-4 px-5 py-4">
                      <div className="flex-1">
                        <div className="text-[15px] font-semibold leading-snug text-[#2E2F48]">
                          {f.q}
                        </div>

                        {/* answer visible only when open (first item in mock) */}
                        {isOpen && f.a && (
                          <p className="mt-2 text-[13px] leading-relaxed text-[#8A93A6]">
                            {f.a}
                          </p>
                        )}
                      </div>

                      {/* RIGHT ICON */}
                      <div className="ml-4 grid h-8 w-8 place-items-center rounded-lg bg-[#EFEAFD] text-[#7C3AED]">
                        <Plus
                          size={16}
                          className={`transition-transform ${isOpen ? "rotate-45" : ""}`}
                        />
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Help card (pixel-like height/spacing) */}
<aside className="xl:sticky xl:top-6 h-full">
  <div className="flex h-full flex-col justify-between rounded-[10px] bg-white px-8 py-10 ring-1 ring-[#E6ECF5]">
    {/* icon center top */}
    <div className="flex justify-center">
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="#6B21A8"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-6"
      >
        <path d="M8 0h48v48H20l-12 12V0z" />
      </svg>
    </div>

    {/* text center */}
    <div className="text-center">
      <h3 className="text-base font-semibold text-black">
        Do you have more questions?
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[#4B5563]">
        End-to-end payments and financial management in a single solution. Meet
        the right platform to help realize.
      </p>
    </div>

    {/* bottom button */}
    <Link
      href="#"
      className="inline-flex w-full items-center justify-center rounded-md bg-[#6B21A8] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
    >
      Shoot a Direct Mail
    </Link>
  </div>
</aside>


        </div>
      </div>
    </div>
  );
}
