"use client";

import { Button, message } from "antd";

type Agent = {
  id: number;
  name: string;
  avatar?: string | null;
  primaryLanguage?: string;
  isActive: boolean;
};

export default function AgentCard({
  agent,
  onClick,
  onToggle,
}: {
  agent: Agent;
  onClick: () => void;
  onToggle: () => Promise<void>;
}) {
  return (
    <div
      className="
        relative bg-white rounded-2xl overflow-hidden shadow-lg 
        hover:scale-[1.03] transition cursor-pointer
        w-full h-[260px]
      "
      onClick={onClick}
    >

      {/* Image */}
      <div className="h-[150px] flex items-center justify-center">
        {agent.avatar ? (
          <img
            src={agent.avatar}
            className="h-full w-full object-contain p-5"
          />
        ) : (
          <div className="text-5xl font-bold text-gray-600">
            {agent.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="bg-[#2A155A] p-4 text-center h-[110px]">
        <p className="text-white font-semibold text-lg">{agent.name}</p>

        <div className="flex gap-3 mt-4">
          <Button
            className="flex-1 bg-[#A855F7] border-none text-white"
            onClick={(e) => {
              e.stopPropagation();
              const lang = [
                { name: agent.primaryLanguage, image: agent.avatar },
              ];
              const encoded = encodeURIComponent(JSON.stringify(lang));
              window.open(
                `/start?agent=${agent.name}&agentId=${agent.id}&image=${agent.avatar}&languages=${encoded}`,
                "_blank"
              );
            }}
          >
            Test Call
          </Button>

          <Button 
            onClick={(e) => {
    e.stopPropagation();
    // Open in new window/tab
    window.open(`/chat/${agent.id}?agent=${agent.name}`, '_blank');
  }}
          className="flex-1 bg-[#A855F7] border-none text-white">
            Test Chat
          </Button>
        </div>
      </div>
    </div>
  );
}
