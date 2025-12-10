// src/Components/services/agents.ts
import { api } from "@/Components/lib/api";

export const getAgents = async (organizationId: number) => {
  const res = await api.get(`/agents?organizationId=${organizationId}`);
  return res.data;
};

export const createAgent = async (data: any) => {
  const res = await api.post("/agents/", data);
  return res.data;
};

export const updateAgent = async (id: number, data: any) => {
  const res = await api.patch(`/agents/${id}`, data);
  return res.data;
};

export const deleteAgent = async (id: number) => {
  const res = await api.delete(`/agents/${id}`);
  return res.data;
};

export const toggleAgent = async (id: number) => {
  const res = await api.patch(`/agents/toggle/${id}`);
  return res.data;
};
