"use client";


import AgentCard from "./AgentCard";
import { getMyAgents } from "@/Components/services/agents";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
type Agent = {
  id: number;
  name: string;
  avatar?: string | null;
  primaryLanguage?: string;
  isActive: boolean;
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const fetchAgents = async () => {
    setLoading(true);
    const data = await getMyAgents();
    setAgents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F6FA] px-8 py-8">
      <h1 className="text-[28px] font-semibold mb-6">Agents</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {agents.map((a) => (
            <AgentCard
              key={a.id}
              agent={a}
                onClick={() => router.push(`/admin/agents/${a.id}`)}
              onToggle={async () => {
                setAgents((prev) =>
                  prev.map((x) =>
                    x.id === a.id
                      ? { ...x, isActive: !x.isActive }
                      : x
                  )
                );
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
