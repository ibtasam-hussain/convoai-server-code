"use client";
import { useEffect, useState } from "react";
import { Input, Select, Button, Card, message, Spin } from "antd";
import { getAgents, createAgent, updateAgent } from "@/Components/services/agents";

const { Option } = Select;

interface Agent {
  id: number;
  name: string;
  type: string;
  gender: string;
  voice: string;
  primaryLanguage: string;
  additionalLanguages: string[];
  escalationContact: string;
  apiKey: string;

  // Hardcoded (not shown in UI)
  apiEndpoint?: string;
  indexedDB?: string;
}

type Step5AgentProps = {
  organizationId: number | null;
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
  formData: any;
  setFormData: (updater: (prev: any) => any) => void;
};

export default function Step5_Agent({
  organizationId,
  selectedAgent,
  setSelectedAgent,
  formData,
  setFormData,
}: Step5AgentProps) {
  const [loading, setLoading] = useState(false);

  const [localAgent, setLocalAgent] = useState<Agent>({
    id: Date.now(),
    name: "",
    type: "",
    gender: "",
    voice: "",
    primaryLanguage: "",
    additionalLanguages: [],
    escalationContact: "",
    apiKey: "",

    // 🟣 hardcoded values
    apiEndpoint: "https://dummy-endpoint.com/api",
    indexedDB: "true",
  });

  // Allowed voices for the realtime API (lowercase)
  const maleVoices = ["alloy", "echo", "marin", "sage", "verse", "ash"];
  const femaleVoices = ["ballad", "coral", "shimmer", "cedar"];
  const neutralVoices = ["alloy", "echo", "marin", "sage", "verse", "ash", "ballad", "coral", "shimmer", "cedar"];
  const languages = ["Urdu", "English", "German", "Spanish"];

  const getVoicesForGender = (gender: string) => {
    if (gender?.toLowerCase() === "male") return maleVoices;
    if (gender?.toLowerCase() === "female") return femaleVoices;
    return neutralVoices;
  };

  // 🟢 Load existing agent
  useEffect(() => {
    if (!organizationId) return;

    (async () => {
      try {
        setLoading(true);
        const agents = await getAgents(organizationId);

        if (agents.length > 0) {
          const loaded = {
            ...agents[0],

            // ensure defaults
            apiEndpoint: "https://dummy-endpoint.com/api",
            indexedDB: true,
          };

          // Enforce voice based on gender when loading
          const allowed = getVoicesForGender(loaded.gender);
          const voiceToUse =
            allowed.includes((loaded.voice || "").toLowerCase())
              ? loaded.voice.toLowerCase()
              : allowed[0] || "ash";
          loaded.voice = voiceToUse;

          setLocalAgent(loaded);
          setSelectedAgent(loaded);

          setFormData((prev: any) => ({
            ...prev,
            ...loaded,
          }));
        }
      } catch {
        message.error("Failed to load agent info");
      } finally {
        setLoading(false);
      }
    })();
  }, [organizationId]);


  // 🟢 Sync changes
  const handleChange = (field: keyof Agent, value: any) => {
    let updated = { ...localAgent, [field]: value };

    // Enforce voice selection based on gender
    if (field === "gender") {
      const allowed = getVoicesForGender(value);
      const voiceToUse = allowed.includes((updated.voice || "").toLowerCase())
        ? updated.voice.toLowerCase()
        : allowed[0] || "ash";
      updated = { ...updated, voice: voiceToUse };
    }

    // If user selects a voice manually, ensure it is allowed for current gender
    if (field === "voice") {
      const allowed = getVoicesForGender(updated.gender);
      const normalizedVoice = (value || "").toLowerCase();
      const voiceToUse = allowed.includes(normalizedVoice) ? normalizedVoice : allowed[0] || "ash";
      updated = { ...updated, voice: voiceToUse };
    }
    setLocalAgent(updated);

    setFormData((prev: any) => ({
      ...prev,
      ...updated,
    }));
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
          <Spin size="large" />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Agent Setup</h2>

      <Card className="rounded-xl border border-gray-200 p-6">
        <div className="grid md:grid-cols-2 gap-6">

          <InputField
            label="Agent Name"
            value={localAgent.name}
            onChange={(v) => handleChange("name", v)}
          />

          <InputField
            label="Agent Role"
            value={localAgent.type}
            onChange={(v) => handleChange("type", v)}
          />

          {/* 🟣 NEW FIELD */}
          <SelectField
            label="Gender"
            value={localAgent.gender}
            options={["Male", "Female", "Other"]}
            onChange={(v) => handleChange("gender", v)}
          />

          <SelectField
            label="Voice"
            value={localAgent.voice}
            options={getVoicesForGender(localAgent.gender)}
            onChange={(v) => handleChange("voice", v)}
            formatOption={(o: string) => o.charAt(0).toUpperCase() + o.slice(1)}
          />

          <SelectField
            label="Primary Language"
            value={localAgent.primaryLanguage}
            options={languages}
            onChange={(v) => handleChange("primaryLanguage", v)}
          />

          <SelectField
            label="Additional Languages"
            value={localAgent.additionalLanguages}
            options={languages}
            multiple
            onChange={(v) => handleChange("additionalLanguages", v)}
          />

          <InputField
            label="Escalation Contact"
            value={localAgent.escalationContact}
            onChange={(v) => handleChange("escalationContact", v)}
          />

          <InputField
            label="API Key"
            type="password"
            value={localAgent.apiKey}
            onChange={(v) => handleChange("apiKey", v)}
          />
        </div>
      </Card>
    </div>
  );
}

/* Reusable Inputs */
const InputField = ({ label, value, onChange, type = "text" }: any) => (
  <div>
    <label className="block mb-1 text-sm text-gray-600">{label}</label>
    {type === "password" ? (
      <Input.Password value={value} onChange={(e) => onChange(e.target.value)} />
    ) : (
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    )}
  </div>
);

const SelectField = ({ label, value, options, onChange, multiple, formatOption }: any) => (
  <div>
    <label className="block mb-1 text-sm text-gray-600">{label}</label>
    <Select
      style={{ width: "100%" }}
      mode={multiple ? "multiple" : undefined}
      value={value || (multiple ? [] : undefined)}
      placeholder={`Select ${label}`}
      onChange={onChange}
    >
      {options.map((o: string) => (
        <Option key={o} value={o}>
          {formatOption ? formatOption(o) : o}
        </Option>
      ))}
    </Select>
  </div>
);
