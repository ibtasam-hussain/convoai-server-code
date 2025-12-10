"use client";

const items = [
  { label: "Company Setting", active: true },
  { label: "Users", active: false },
  { label: "Integration", active: false },
];

export default function AccountSideNav() {
  return (
    <aside className="rounded-2xl bg-[#1A0E2E] p-3">
      <nav className="space-y-2">
        {items.map((it) => (
          <button
            key={it.label}
            className={[
              "w-full flex items-center justify-between px-4 h-11 rounded-xl text-sm font-medium transition",
              it.active
                ? "bg-gradient-to-r from-[#6E46D9] to-[#9F7AEA] text-white"
                : "text-white/80 hover:text-white hover:bg-white/10",
            ].join(" ")}
          >
            <span>{it.label}</span>
            <span className="opacity-70">›</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
