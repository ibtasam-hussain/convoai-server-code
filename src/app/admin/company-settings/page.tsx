"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ChevronDown } from "lucide-react";
import { apiUrl } from "@/config/config";
import toast from "react-hot-toast";

/* ---------- Types ---------- */
type CompanyProfile = {
  id?: number;
  name: string;
  email: string;
  region: string; // API may return "Asia/Karachi"
  language: string;
  logo?: string | null;
  bio?: string | null;
};

type UserMe = {
  id: number;
  name: string;
  email: string;
  region: string;
  language: string;
  image?: string | null;
  company?: CompanyProfile;
};

/* ---------- Constants ---------- */
const REGIONS = [
  "Africa / Cairo",
  "America / New_York",
  "America / Los_Angeles",
  "Asia / Karachi",
  "Asia / Dubai",
  "Europe / London",
  "Europe / Berlin",
];

const LANGS = ["English", "Urdu", "Arabic", "German", "French"];

/* ---------- Helpers ---------- */
// "Asia/Karachi" -> "Asia / Karachi" (pretty in UI)
function displayRegion(v: string): string {
  return (v ?? "").replace(/\s*\/\s*/g, " / ");
}
// "Asia / Karachi" -> "Asia/Karachi" (DB format)
function toDbRegion(v: string): string {
  return (v ?? "").replace(/\s*\/\s*/g, "/").trim();
}

export default function AccountPage() {
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [form, setForm] = useState<CompanyProfile>({
    name: "",
    email: "",
    region: "",
    language: "",
    logo: null,
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

useEffect(() => {
  const controller = new AbortController();
  (async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get<{ company: CompanyProfile }>(`${apiUrl}/organizations/myorganization`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });

      console.log("Fetched UserMe status:", res);
      console.log("Fetched UserMe payload:", res.data);

      // Now that we're correctly typing `res.data` to include `company`
      const c = res.data;

      if (!c || !c.id || !c.name || !c.email || !c.region || !c.language) {
        throw new Error("Company data is missing required fields.");
      }

      const comp: CompanyProfile = {
        id: c.id ?? undefined,
        name: c.name ?? "",
        email: c.email ?? "",
        region: c.region ?? "",
        language: c.language ?? "",
        logo: c.logo ?? null,
        bio: c.bio ?? "",
      };

      // Set the company and form state
      setCompany(comp);
      setForm({ ...comp, region: displayRegion(comp.region) }); // Pretty region
      setLogoPreview(comp.logo ?? null); // Set logo preview
    } catch (err: any) {
      if (!axios.isCancel(err)) {
        console.error(err);
        toast.error(err?.response?.data?.error || "Failed to load company profile.");
      }
    } finally {
      setLoading(false);
    }
  })();
  return () => controller.abort();
}, []);



  const pickLogo = () => fileInputRef.current?.click();

  const onLogoChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] || null;
    setLogoFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setLogoPreview(url);
    } else {
      setLogoPreview(company?.logo ?? null);
    }
  };

  const onChange = (key: keyof CompanyProfile, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };


  return (
    <main className="min-h-screen bg-[#F6F7FB]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-0 py-10">
        {/* Header */}
        <h1 className="text-[28px] leading-8 font-extrabold text-[#232323]">
          Account
        </h1>
        <p className="mt-2 text-[13px] leading-5 text-[#6C6F7A] max-w-3xl">
          Change your operator name, add your profile picture, change your email
          address and password and adjust your region so that your time zone
          will be displayed correctly.
        </p>

        {/* About Company (bio is editable here next to logo) */}
        <section className="mt-10">
          <div className="flex items-start gap-6">
            {/* Logo + label */}
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-[#E7E0F7] ring-4 ring-white shadow-sm grid place-items-center overflow-hidden">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreview}
                    alt="Company logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-[#5B4E8C] tracking-wide">
                    LOGO
                  </span>
                )}
              </div>
              {/* <button
                type="button"
                onClick={pickLogo}
                className="mt-3 text-[12px] font-medium text-[#6C3DD3] hover:underline"
                disabled={loading}
              >
                Change Logo
              </button> */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onLogoChange}
              />
            </div>

            {/* Editable bio inside the muted card */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <label
                  htmlFor="company-bio"
                  className="mb-2 block text-[12px] font-medium text-[#5C6270]"
                >
                  Company Bio
                </label>
                <textarea
                  id="company-bio"
                  value={form.bio ?? ""}
                  onChange={(e) => onChange("bio", e.target.value)}
                  placeholder="Tell something about your company…"
                  className="min-h-[132px] w-full resize-y rounded-lg bg-[#EFF0F3] ring-1 ring-[#E6E8EF] px-4 py-3 text-[13px] leading-5 text-[#6B7280] placeholder-[#9AA0AE] focus:outline-none focus:ring-2 focus:ring-[#6C3DD3]"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </section>
<section className="mt-10">
  <h2 className="text-[18px] font-semibold text-[#232323]">Company Details</h2>

  <div className="mt-5 space-y-5">
    {/* Company Name */}
    <FieldRow label="Company Name">
      <input
        value={form.name}
        onChange={(e) => onChange("name", e.target.value)}
        className="h-11 w-full rounded-md bg-white border border-[#E6E8EF] text-[#232323] text-sm px-4 placeholder-[#8E96A3]"
        placeholder="Company name"
        disabled={loading}
      />
    </FieldRow>

    {/* Email */}
    <FieldRow label="Email">
      <input
        type="email"
        value={form.email}
        onChange={(e) => onChange("email", e.target.value)}
        className="h-11 w-full rounded-md bg-white border border-[#E6E8EF] text-[#232323] text-sm px-4 placeholder-[#8E96A3]"
        placeholder="Company email"
        disabled={loading}
      />
    </FieldRow>

    {/* Region */}
    <FieldRow label="Region">
      <div className="relative">
        <select
          value={form.region} // already pretty
          onChange={(e) => onChange("region", e.target.value)}
          className="h-11 w-full appearance-none rounded-md bg-white border border-[#E6E8EF] text-[#232323] text-sm px-4 pr-10"
          disabled={loading}
        >
          <option value="">Select region</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8E96A3]"
        />
      </div>
    </FieldRow>

    {/* Language */}
    <FieldRow label="Language">
      <div className="relative">
        <select
          value={form.language}
          onChange={(e) => onChange("language", e.target.value)}
          className="h-11 w-full appearance-none rounded-md bg-white border border-[#E6E8EF] text-[#232323] text-sm px-4 pr-10"
          disabled={loading}
        >
          <option value="">Select language</option>
          {LANGS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8E96A3]"
        />
      </div>
    </FieldRow>
  </div>
</section>


        {/* Save button
        <div className="mt-10">
          <button
            type="button"
            onClick={handleSave}
            className="h-10 w-32 rounded-md bg-[#6C3DD3] text-white text-sm font-semibold hover:opacity-95 disabled:opacity-60"
            disabled={loading || saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div> */}
      </div>
    </main>
  );
}

/* ---------- Small helper ---------- */
function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid sm:grid-cols-[180px_1fr] items-center gap-4">
      <label className="text-[13px] text-[#5C6270]">{label}</label>
      {children}
    </div>
  );
}
