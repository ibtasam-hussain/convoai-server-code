"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "@/config/config";
import UserModal from "./userModal";

type User = {
  id: number;
  name: string;
  role?: string;
  email: string;
  region?: string;
  language?: string;
  avatar?: string | null;
  image?: string | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isAddOpen, setAddOpen] = useState(false);
  const [isViewOpen, setViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

const fetchUsers = async () => {
  setLoading(true);
  setError(null);

  try {
    // guard: only run on client & with a token
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      setUsers([]);
      setError("Not authenticated.");
      return;
    }

    const res = await axios.get(`${apiUrl}/users/company-sub-users`, {
      headers: { Authorization: `Bearer ${token}` },
      // optional: cancelable requests if you use AbortController outside
      // signal: controller.signal,
    });

    console.log("Fetched Users status:", res);
    console.log("Fetched Users payload:", res.data);

    // Handle multiple possible response shapes: array OR { subUsers } OR { users }
    const list =
      Array.isArray(res.data)
        ? res.data
        : res.data?.subUsers ?? res.data?.users ?? [];

    setUsers(Array.isArray(list) ? list : []);
  } catch (err: unknown) {
    // Better error info
    if (axios.isAxiosError(err)) {
      console.error("Fetch users failed:", {
        status: err.response?.status,
        data: err.response?.data,
        msg: err.message,
      });
      setError(
        (err.response?.data as any)?.error ||
          (err.response?.data as any)?.message ||
          `Request failed${err.response?.status ? ` (${err.response.status})` : ""}`
      );
    } else {
      console.error("Fetch users failed:", err);
      setError("Failed to load users.");
    }
    setUsers([]); // fallback empty
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-[#F4F6FA]" style={{ paddingLeft: 0 }}>
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-semibold text-[#232323]">Users</h1>

          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex h-10 items-center rounded-lg bg-[#7C3AED] px-5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(124,58,237,0.25)] hover:opacity-95"
          >
            Add User
          </button>
        </div>

        {/* States */}
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : users.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 text-center border border-dashed border-[#DCE6FF] shadow-sm">
              <p className="text-gray-500">No Users Found</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {users.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                onClick={() => {
                  setSelectedUser(u);
                  setViewOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {isAddOpen && (
        <UserModal
          mode="create"
          onClose={() => setAddOpen(false)}
          onSuccess={() => {
            setAddOpen(false);
            fetchUsers();
          }}
        />
      )}

      {/* View/Edit Modal */}
      {isViewOpen && selectedUser && (
        <UserModal
          mode="view"
          user={selectedUser}
          onClose={() => {
            setViewOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setViewOpen(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}

function UserCard({
  user,
  onClick,
}: {
  user: User;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl bg-white p-6 text-center border border-[#DCE6FF] shadow-[0_10px_30px_rgba(226,236,249,0.6)] hover:shadow-lg transition"
    >
      <div className="relative mx-auto mb-5 h-24 w-24">
        <div className="absolute inset-0 rounded-full ring-2 ring-[#E6EDFF]" />
        <img
          src={user.image || "https://i.pravatar.cc/96?img=15"}
          alt={user.name}
          width={96}
          height={96}
          className="h-24 w-24 rounded-full object-cover"
        />
      </div>
      <h3 className="mb-1 text-[22px] font-semibold text-[#2F3147]">
        {user.name}
      </h3>
      <p className="text-[11px] font-bold tracking-wide text-[#99A1B3]">
        {user.role || "SUB-USER"}
      </p>
      <p className="mt-1 text-sm text-[#9AA2B1]">{user.email}</p>
      <p className="mt-1 text-xs text-[#A0A0A0]">
        {(user.region || "-")} | {(user.language || "-")}
      </p>
    </div>
  );
}
