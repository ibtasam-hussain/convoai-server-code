"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Spin } from "antd";
import axios from "axios";
import { Trash, Edit } from "lucide-react";
import { deleteUser } from "@/Components/services/users";
import UserModal from "@/Components/Admin/userModal";

type Agent = {
  id: number;
  name: string;
  avatar?: string | null;
  primaryLanguage?: string;
  isActive: boolean;
  description?: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "viewer";
  avatar?: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log("API_URL", API_URL);
export default function AgentDetailPage() {
  const { agentId } = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);

const [isUserModalOpen, setIsUserModalOpen] = useState(false);
const [modalMode, setModalMode] = useState<"create" | "view">("create");
const [selectedUser, setSelectedUser] = useState<User | null>(null);

  /* ------------------ FETCH AGENT ------------------ */
  useEffect(() => {
    const fetchAgent = async () => {
      try {
        console.log("agentId", agentId, "agent", agent, "api", API_URL);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/agents/getSingleAgent/${agentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAgent(res.data);
        console.log(res.data);
      } catch {
        console.error("Failed to load agent");
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [agentId]);

  /* ------------------ FETCH USERS ------------------ */
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem("token");
      const organizationId = JSON.parse(
        localStorage.getItem("user") || "{}"
      ).organizationId;

      const res = await axios.get(
        `${API_URL}/users/organization/${organizationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(res.data.users || res.data);
    } catch {
      console.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

const handleDeleteUser = async (userId: number) => {
  try {
    await axios.delete(`${API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    fetchUsers();
  } catch {
    console.error("Failed to delete user");
  }
};


  useEffect(() => {
    fetchUsers();
  }, []);

  /* ------------------ STATES ------------------ */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!agent) {
    return <p className="text-center mt-20 text-gray-500">Agent not found</p>;
  }

  /* ------------------ UI ------------------ */
  return (
    <main className="min-h-screen bg-[#F4F6FA] px-8 py-10 space-y-12">
      {/* ================= AGENT HEADER ================= */}
      <div
        className="
    bg-[#2A155A]
    rounded-2xl
    shadow-md
    h-[220px]
    grid grid-cols-2
    overflow-hidden
    max-w-5xl
    mx-auto
  "
      >
        {/* LEFT: IMAGE (50%) */}
        {/* LEFT: IMAGE (50%) */}
        <div className="h-full w-full p-4">
          <div className="w-full h-full rounded-xl border border-white/20 overflow-hidden bg-black/10">
            {agent.avatar ? (
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl text-white">
                {agent.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: INFO (50%) */}
        <div className="flex flex-col justify-center px-10 text-white space-y-3">
          <h2 className="text-3xl font-semibold">{agent.name}</h2>

          <p className="text-gray-300 text-lg">
            Language: {agent.primaryLanguage || "—"}
          </p>

          <p className="text-gray-400 text-sm">
            Status: {agent.isActive ? "Active" : "Inactive"}
          </p>

          {agent.description && (
            <p className="text-gray-300 text-sm line-clamp-3 max-w-md">
              {agent.description}
            </p>
          )}
        </div>
      </div>

<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">

  {/* EXISTING USERS */}
  {users.map((u) => (
    <div
      key={u.id}
      className="
        relative bg-white rounded-2xl overflow-hidden shadow-lg
        hover:scale-[1.03] transition cursor-pointer
        w-full h-[260px]
      "
      onClick={() => {
        setSelectedUser(u);
        setModalMode("view");
        setIsUserModalOpen(true);
      }}
    >
      {/* Actions */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUser(u);
            setModalMode("view");
            setIsUserModalOpen(true);
          }}
          className="bg-white rounded-full p-1 shadow hover:bg-gray-100"
        >
          <Edit className="h-4 w-4 text-blue-500" />
        </button>

        <button
          onClick={async (e) => {
            e.stopPropagation();
            await deleteUser(u.id);
            fetchUsers();
          }}
          className="bg-white rounded-full p-1 shadow hover:bg-gray-100"
        >
          <Trash className="h-4 w-4 text-red-500" />
        </button>
      </div>

      {/* Avatar */}
      <div className="h-[150px] bg-white flex items-center justify-center">
        {u.avatar ? (
          <img src={u.avatar} className="h-full w-full object-contain p-5" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600">
            {u.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="bg-[#2A155A] p-4 text-center h-[110px]">
        <p className="text-white font-semibold text-lg truncate">
          {u.name}
        </p>
        <p className="text-sm text-purple-200 truncate">
          {u.email}
        </p>
        <span className="inline-block mt-2 rounded-full bg-[#A855F7] px-3 py-1 text-xs font-medium text-white">
          {u.role}
        </span>
      </div>
    </div>
  ))}

  {/* ➕ ADD USER CARD */}
  <div
    onClick={() => {
      setSelectedUser(null);
      setModalMode("create");
      setIsUserModalOpen(true);
    }}
    className="
      bg-[#2A155A] rounded-2xl shadow-lg
      hover:scale-[1.03] transition cursor-pointer
      w-full h-[260px]
      border-2 border-dashed border-[#A855F7]
      flex flex-col items-center justify-center
    "
  >
    <div className="w-16 h-16 rounded-full bg-[#A855F7] flex items-center justify-center text-white text-3xl">
      +
    </div>
    <p className="text-white font-medium text-lg mt-4">
      Add New User
    </p>
  </div>

</div>
        {isUserModalOpen && (
  <UserModal
    mode={modalMode}
    user={selectedUser || undefined}
    onClose={() => {
      setIsUserModalOpen(false);
      setSelectedUser(null);
    }}
    onSuccess={() => {
      setIsUserModalOpen(false);
      fetchUsers();
    }}
  />
)}

    </main>
  );
}
