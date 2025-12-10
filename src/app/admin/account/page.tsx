"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, ChevronDown } from "lucide-react";
import axios from "axios";
import { apiUrl } from "@/config/config";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

type Profile = {
  name: string;
  email: string;
  region: string;
  language: string;
  image?: string | null;
  twoStepVerification: boolean;
};

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

/* ---------- 2FA helpers ---------- */
function toBool(v: any): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string")
    return ["true", "1", "enabled", "on", "yes"].includes(v.toLowerCase());
  return false;
}
function read2FAFromObject(obj: any): boolean {
  if (!obj || typeof obj !== "object") return false;
  const candidates = [
    "twoFAEnabled",
    "isTwoFactorEnabled",
    "two_factor_enabled",
    "enable2fa",
    "twoFactorEnabled",
    "two_factor",
    "twoStepVerification",
  ];
  for (const k of candidates) {
    if (k in obj) return toBool((obj as any)[k]);
  }
  return false;
}

export default function AccountPage() {
  const [initial, setInitial] = useState<Profile | null>(null);
  const [form, setForm] = useState<Profile>({
    name: "",
    email: "",
    region: "Asia / Karachi",
    language: "English",
    image: null,
    twoStepVerification: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // --- 2FA state ---
  const [twoFAEnabled, setTwoFAEnabled] = useState<boolean>(false);
  const [toggling2FA, setToggling2FA] = useState<boolean>(false);

  // --- auth headers ---
  const authHeaders = useMemo(
    () => ({
      Authorization:
        typeof window !== "undefined"
          ? `Bearer ${localStorage.getItem("token") ?? ""}`
          : "",
    }),
    []
  );

  // fetch profile (+ default 2FA state) on mount
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      const token =
        (localStorage.getItem("token") as string | null) ??
        localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${apiUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = res.data;
        const twofa = read2FAFromObject(data);

        const profile: Profile = {
          name: data?.name ?? "",
          email: data?.email ?? "",
          region: data?.region ?? "",
          language: data?.language ?? "",
          image: data?.image ?? null,
          twoStepVerification: twofa,
        };

        setInitial(profile);
        setForm(profile);
        setTwoFAEnabled(twofa);
      } catch (err: any) {
        if (!axios.isCancel(err)) {
          console.error(err);
          toast.error(err?.response?.data?.error || "Failed to load profile.");
        }
      }
    })();
    return () => controller.abort();
  }, []);

  // image preview
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // changed fields (2FA not included here)
  const changed = useMemo(() => {
    if (!initial) return {} as Partial<Profile>;
    const diff: Partial<Profile> = {};
    (["name", "email", "region", "language"] as const).forEach((k) => {
      if (form[k] !== initial[k]) diff[k] = form[k];
    });
    return diff;
  }, [form, initial]);

  const handleSave = async () => {
    if (!initial) return;
    if (!file && Object.keys(changed).length === 0) {
      toast("Nothing to update.", { icon: "ℹ️" });
      return;
    }
    setLoading(true);
    const tId = toast.loading("Updating profile…");
    try {
      const fd = new FormData();
      Object.entries(changed).forEach(([k, v]) => {
        if (typeof v === "string") fd.append(k, v);
      });
      if (file) fd.append("image", file);

      const res = await axios.patch(`${apiUrl}/users/me`, fd, {
        headers: { ...authHeaders },
      });
      const data = res.data;

      const newInitial: Profile = {
        ...initial,
        ...changed,
        image: file ? data?.image ?? initial.image : initial.image,
        twoStepVerification: form.twoStepVerification,
      };
      setInitial(newInitial);
      setForm(newInitial);
      setFile(null);
      setPreview(null);

      toast.success("Profile updated.");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.error || "Update failed.");
    } finally {
      toast.dismiss(tId);
      setLoading(false);
    }
  };

  // --- 2FA toggle handler ---
  const handleToggle2FA = async () => {
    setToggling2FA(true);
    const tId = toast.loading("Updating 2FA…");
    try {
      const res = await axios.patch(
        `${apiUrl}/users/toggle-2fa`,
        {},
        { headers: { ...authHeaders } }
      );

      const newStatus =
        read2FAFromObject(res.data) ||
        toBool(res.data?.enable2fa) ||
        !twoFAEnabled;

      setTwoFAEnabled(newStatus);
      setForm((s) => ({ ...s, twoStepVerification: newStatus }));
      toast.success(
        `Two-Factor Authentication ${newStatus ? "enabled" : "disabled"}.`
      );
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.error || "Failed to toggle 2FA.");
    } finally {
      toast.dismiss(tId);
      setToggling2FA(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA]" style={{ paddingLeft: 0 }}>
      {/* Toasts */}
      <Toaster position="top-right" />

      <div className="px-8 py-10 max-w-[980px]">
        <h1 className="text-[32px] font-extrabold text-[#2F3147]">Account</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8A93A6]">
          Change your operator name, add your profile picture, change your email
          address and password and adjust your region so that your time zone
          will be displayed correctly.
        </p>

        {/* Personal details */}
        <section className="mt-8">
          <h2 className="text-[18px] font-semibold text-[#2F3147]">
            Personal details
          </h2>

          <div className="mt-6 space-y-5">
            <FormRow label="Name">
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((s) => ({ ...s, name: e.target.value }))
                }
                placeholder="Muhammad"
              />
            </FormRow>

            <FormRow label="Your picture">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-11 w-28 rounded-md bg-[#E6E8EF] ring-1 ring-[#DFE5F0] grid place-items-center text-[#7E8699]"
                >
                  <ImagePlus size={20} />
                </button>

                <AvatarPreview preview={preview} url={form.image ?? null} />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setFile(f);
                  }}
                />
              </div>
            </FormRow>

            <FormRow label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((s) => ({ ...s, email: e.target.value }))
                }
                placeholder="muhammad.he987@gmail.com"
              />
            </FormRow>

            <FormRow label="Region">
              <Select
                value={form.region}
                onChange={(e) =>
                  setForm((s) => ({ ...s, region: e.target.value }))
                }
                options={REGIONS}
              />
            </FormRow>

            <FormRow label="Language">
              <Select
                value={form.language}
                onChange={(e) =>
                  setForm((s) => ({ ...s, language: e.target.value }))
                }
                options={LANGS}
              />
            </FormRow>
          </div>
        </section>

        {/* Password & Security */}
        <section className="mt-12">
          <h2 className="text-[18px] font-semibold text-[#2F3147]">
            Password & Security
          </h2>

          <div className="mt-6 space-y-6">
            <FormRow label="Password">
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="h-10 rounded-md bg-[#E8D7FB] px-4 text-sm font-semibold text-[#7C3AED] hover:opacity-95"
              >
                Change Password
              </button>
            </FormRow>

            <FormRow label="Two-Factor Authentication (2FA)">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={toggling2FA}
                  onClick={handleToggle2FA}
                  className={`h-10 rounded-md px-4 text-sm font-semibold hover:opacity-95 disabled:opacity-60 ${
                    twoFAEnabled
                      ? "bg-red-100 text-red-700"
                      : "bg-[#E8D7FB] text-[#7C3AED]"
                  }`}
                >
                  {toggling2FA
                    ? "Please wait…"
                    : twoFAEnabled
                    ? "Disable 2FA"
                    : "Enable 2FA"}
                </button>
              </div>
            </FormRow>
          </div>
        </section>

        {/* Save */}
        <div className="mt-10">
          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="h-10 rounded-md bg-[#7C3AED] px-6 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

        {showPasswordModal && (
          <PasswordModal onClose={() => setShowPasswordModal(false)} />
        )}
      </div>
    </div>
  );
}

/* ---------------- small components ---------------- */

function FormRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[160px_minmax(0,1fr)] items-center gap-6">
      <label className="text-sm font-medium text-[#2F3147]">{label}</label>
      <div>{children}</div>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      className="h-11 w-full rounded-md bg-white px-4 text-sm text-[#2F3147] ring-1 ring-[#DFE5F0] placeholder:text-[#9AA2B1] focus:outline-none focus:ring-[#C9D4EF]"
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="h-11 w-full appearance-none rounded-md bg-white px-4 pr-10 text-sm text-[#2F3147] ring-1 ring-[#DFE5F0] focus:outline-none focus:ring-[#C9D4EF]"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA2B1]"
      />
    </div>
  );
}

function AvatarPreview({
  preview,
  url,
}: {
  preview: string | null;
  url: string | null;
}) {
  const src = preview ?? url ?? null;
  if (!src) {
    return (
      <div className="h-11 w-11 rounded-md bg-[#E6E8EF] ring-1 ring-[#DFE5F0] grid place-items-center text-[#7E8699] "></div>
    );
  }
  return (
    <img
      src={src}
      alt="avatar"
      className="h-11 w-11 rounded-md object-cover ring-1 ring-[#DFE5F0]"
    />
  );
}

/* ---------------- Password Modal ---------------- */
function PasswordModal({ onClose }: { onClose: () => void }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast("Please fill all fields.", { icon: "ℹ️" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const tId = toast.loading("Updating password…");
    try {
      const res = await axios.patch(
        `${apiUrl}/users/change-password`,
        {
          oldPassword,
          password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(res.data.message || "Password updated.");
      onClose();
      localStorage.removeItem("token");
      router.push("/admin/login");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update password");
    } finally {
      toast.dismiss(tId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-[#2F3147]">
          Change Password
        </h2>
        <p className="text-sm text-[#8A93A6] mt-1">
          Enter your current password and set a new one.
        </p>

        <div className="mt-6 space-y-4">
          <Input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="h-10 rounded-md bg-[#E6E8EF] px-5 text-sm font-medium text-[#2F3147] hover:opacity-90"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="h-10 rounded-md bg-[#7C3AED] px-5 text-sm font-semibold text-white hover:opacity-95"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
