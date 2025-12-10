"use client";

import { useState } from "react";
import axios from "axios";
import { apiUrl } from "@/config/config";

type User = {
  id?: number;
  name?: string;
  email?: string;
  region?: string;
  language?: string;
  logo?: string | File | null;
};

export default function UserModal({
  mode,
  user,
  onClose,
  onSuccess,
}: {
  mode: "create" | "view";
  user?: User;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<User>(
    user || { name: "", email: "", region: "", language: "", logo: null }
  );
  const [loading, setLoading] = useState(false);
  const isView = mode === "view";

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name || "");
      formData.append("email", form.email || "");
      formData.append("region", form.region || "");
      formData.append("language", form.language || "");
      if (form.logo instanceof File) formData.append("logo", form.logo);

      if (isView && form.id) {
        await axios.patch(`${apiUrl}/users/company-sub-users/${form.id}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await axios.post(`${apiUrl}/users/company-sub-users`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      onSuccess();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-[480px] p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          {isView ? "User Details" : "Add New User"}
        </h2>

        {/* Form */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Name"
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email || ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Region"
            value={form.region || ""}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Language"
            value={form.language || ""}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <input
            type="file"
            onChange={(e) =>
              setForm({ ...form, logo: e.target.files?.[0] || null })
            }
            className="w-full"
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-[#7C3AED] text-white hover:opacity-90"
          >
            {loading ? "Saving..." : isView ? "Update User" : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}
