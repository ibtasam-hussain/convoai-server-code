"use client";

import React, { useEffect, useState, useCallback } from "react";
import { axiosClient } from "@/utils/axiosClient";
import { message } from "antd";

const OrganizationList = ({
  onSelect,
  selectedId,
}: {
  onSelect?: (id: string | number) => void;
  selectedId?: string | number;
}) => {
  const [agents, setAgents] = useState([]);

  const fetchAgents = useCallback(async () => {
    try {
      const user = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")!)
        : null;
      if (!user?.id) {
        console.error("User ID not found");
        return;
      }
      const response = await axiosClient.get("/agents/by-user/" + user.id);
      if (response?.data) setAgents(response.data);
    } catch (error: any) {
      console.error("Error fetching agents:", error);
      message.error("Failed to load organizations");
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return (
    <div className="organizations relative flex flex-col gap-[1.25rem]">
      <div className="gradient-text text-[1.4rem] xs:text-[1.6rem] md:text-[1.75rem] leading-[1.2]">
        Select your Organization
      </div>

      <div className="boxes grid grid-cols-2 4sm:grid-cols-3 2md:grid-cols-4 items-center justify-center gap-[.5rem] gap-y-[.75rem] 2md:gap-[.9375rem] 2md:gap-y-[.9375rem] relative z-10">
        {agents.map((item: any) => (
          <div
            key={item?.id}
            onClick={() => onSelect?.(item?.id)}
            className="box relative px-[.4rem] xs:px-[.625rem] py-[.75rem] border border-[rgba(255,255,255,0.30)] backdrop-blur-[40px] rounded-[.625rem] cursor-pointer transition-all hover:scale-[1.02]"
            style={{
              background:
                "linear-gradient(90deg, rgba(96, 92, 241, 0.10) 0%, rgba(160, 57, 252, 0.10) 100%)",
            }}
          >
            <div className="image mb-[.7rem]">
              <img
                src={item?.image}
                className="w-full aspect-[1.05] object-cover object-top rounded-[.625rem]"
                alt="organization"
              />
            </div>
            <div className="title text-[1.1rem] font-semibold text-center leading-none uppercase mb-[.33rem]">
              {item?.name}
            </div>

            {String(item?.id) === String(selectedId) && (
              <div className="icon w-[1.375rem] h-[1.375rem] absolute right-[-.4rem] top-[-.5rem] flex items-center justify-center bg-[#108E2B] rounded-full">
                <img src="/assets/Start/tick-icon.svg" alt="selected" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="absolute top-[-12rem] left-[3rem] z-0">
        <img
          src="/assets/Agents/bg-shade.svg"
          className="relative z-0"
          alt="background"
        />
      </div>
    </div>
  );
};

export default OrganizationList;
