"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { apiUrl } from "@/config/config";
import { Globe, Phone, CheckCircle2, AlertTriangle } from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaFacebookMessenger } from "react-icons/fa6";

type Integrations = {
  website: string | null;
  sms: string | null;
  instagram: string | null;
  messenger: string | null;
  whatsapp: string | null;
};

type ChannelKey = keyof Integrations;

const CHANNEL_META: Record<ChannelKey, {
  label: string;
  placeholder: string;
  helper?: string;
  formatDisplay?: (v: string) => string;
}> = {
  website:   { label: "Website URL", placeholder: "https://your-domain.com" },
  sms:       { label: "SMS / Text Number", placeholder: "+1234567890" },
  instagram: { label: "Instagram Handle", placeholder: "@yourbrand", formatDisplay: v => `@${v.replace(/^@+/, "")}` },
  messenger: { label: "Messenger Username", placeholder: "@yourpage", formatDisplay: v => `@${v.replace(/^@+/, "")}` },
  whatsapp:  { label: "WhatsApp Number", placeholder: "+1234567890" },
};

export default function IntegrationPage() {
  const [integrations, setIntegrations] = useState<Integrations>({
    website: null, sms: null, instagram: null, messenger: null, whatsapp: null,
  });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<ChannelKey | null>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get<{ integrations: Integrations }>(
          `${apiUrl}/users/company-integrations`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Load integrations", res);
        setIntegrations(res.data.integrations || {
          website: null, sms: null, instagram: null, messenger: null, whatsapp: null,
        });
      } catch (e) {
        console.error("Load integrations failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openModal = (channel: ChannelKey) => {
    setActiveChannel(channel);
    const current = integrations[channel] || "";
    setValue(current);
    setModalOpen(true);
  };

  const save = async () => {
    if (!activeChannel) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch<{ integrations: Integrations }>(
        `${apiUrl}/users/company-integrations/${activeChannel}`,
        { value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Save integration", res);
      setIntegrations(res.data.integrations);
      setModalOpen(false);
    } catch (e: any) {
      console.error("Save integration failed", e?.response?.data || e);
      alert(e?.response?.data?.error || "Failed to save.");
    }
  };

  const disconnect = async () => {
    if (!activeChannel) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch<{ integrations: Integrations }>(
        `${apiUrl}/users/company-integrations/${activeChannel}`,
        { value: "" }, // empty disconnects
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIntegrations(res.data.integrations);
      setModalOpen(false);
    } catch (e: any) {
      console.error("Disconnect failed", e?.response?.data || e);
      alert(e?.response?.data?.error || "Failed to disconnect.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA]" style={{ paddingLeft: 0 }}>
      <div className="mx-auto max-w-[1100px] px-6 py-8">
        <h1 className="text-[28px] font-semibold text-[#2F3147]">Configure Settings</h1>

        <div className="mt-4">
          <Link href="#" className="text-[#5F6B7C] underline hover:text-[#2F3147]">
            General
          </Link>
        </div>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-[#2F3147]">Main</h2>

          <div className="mt-4 rounded-lg bg-white p-4 ring-1 ring-[#E6ECF5]">
            <div className="flex items-start gap-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-[#F59E0B]" />
              <p className="text-[#6B7280]">
                To activate or test ConvoAI, you must first provide it with knowledge sources.{" "}
                <Link href="/admin/knowledge-sources" className="underline text-[#7C3AED]">
                  Go to the Knowledge Sources tab now.
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-[#2F3147] mb-2">Activate</label>
            <div className="flex items-center gap-6">
              <div>
                <div className="text-sm text-[#6B7280] mb-1">Upsell responds</div>
                <select
                  className="h-10 rounded-md border border-[#E3E8F0] bg-white px-3 text-sm text-[#2F3147] outline-none"
                  defaultValue="Always"
                >
                  <option>Always</option>
                  <option>When relevant</option>
                  <option>Never</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Channels */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[#2F3147]">Channels</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Select the channels on which ConvoAI should be visible to your customers. ConvoAI is
            available by default in the Live chat.
          </p>

          <h3 className="mt-6 text-base font-semibold text-[#2F3147]">Live conversations</h3>

          <div className="mt-4 grid gap-3 max-w-[560px]">
            {/* Website */}
            <Row>
              <IconWrap><Globe className="h-4 w-4" /></IconWrap>
              <span className="flex-1 text-sm text-[#2F3147]">Website</span>
              {integrations.website ? (
                <>
                  <span className="text-sm text-[#9AA2B1] mr-2 select-none">
                    {integrations.website}
                  </span>
                  <Connected />
                </>
              ) : (
                <Integrate onClick={() => openModal("website")} />
              )}
            </Row>

            {/* SMS */}
            <Row>
              <IconWrap><Phone className="h-4 w-4" /></IconWrap>
              <span className="flex-1 text-sm text-[#2F3147]">Text Message</span>
              {integrations.sms ? (
                <>
                  <span className="text-sm text-[#9AA2B1] mr-2 select-none">
                    {integrations.sms}
                  </span>
                  <Connected />
                </>
              ) : (
                <Integrate onClick={() => openModal("sms")} />
              )}
            </Row>

            {/* Instagram */}
            <Row>
              <IconWrap><FaInstagram className="h-4 w-4" /></IconWrap>
              <span className="flex-1 text-sm text-[#2F3147]">Instagram</span>
              {integrations.instagram ? (
                <>
                  <span className="text-sm text-[#9AA2B1] mr-2 select-none">
                    {CHANNEL_META.instagram.formatDisplay?.(integrations.instagram) ?? integrations.instagram}
                  </span>
                  <Connected />
                </>
              ) : (
                <Integrate onClick={() => openModal("instagram")} />
              )}
            </Row>

            {/* Messenger */}
            <Row>
              <IconWrap><FaFacebookMessenger className="h-4 w-4" /></IconWrap>
              <span className="flex-1 text-sm text-[#2F3147]">Messenger</span>
              {integrations.messenger ? (
                <>
                  <span className="text-sm text-[#9AA2B1] mr-2 select-none">
                    {CHANNEL_META.messenger.formatDisplay?.(integrations.messenger) ?? integrations.messenger}
                  </span>
                  <Connected />
                </>
              ) : (
                <Integrate onClick={() => openModal("messenger")} />
              )}
            </Row>

            {/* WhatsApp */}
            <Row>
              <IconWrap><FaWhatsapp className="h-4 w-4" /></IconWrap>
              <span className="flex-1 text-sm text-[#2F3147]">WhatsApp</span>
              {integrations.whatsapp ? (
                <>
                  <span className="text-sm text-[#9AA2B1] mr-2 select-none">
                    {integrations.whatsapp}
                  </span>
                  <Connected />
                </>
              ) : (
                <Integrate onClick={() => openModal("whatsapp")} />
              )}
            </Row>
          </div>
        </section>

        {/* Languages */}
        <section className="mt-10 max-w-[860px]">
          <h3 className="text-xl font-semibold text-[#2F3147]">Languages</h3>
          <p className="mt-1 text-sm text-[#6B7280]">
            ConvoAI automatically responds in the visitor’s chat widget language. You can set or add
            more languages in{" "}
            <Link href="#" className="underline text-[#7C3AED]">
              multilanguage widget settings
            </Link>
            .
          </p>
        </section>

        {/* CSAT */}
        <section className="mt-8 max-w-[860px] pb-10">
          <h3 className="text-xl font-semibold text-[#2F3147]">Customer satisfaction</h3>
          <p className="mt-1 text-sm text-[#6B7280]">
            Measure the level of your customer satisfaction by sending an automated survey. To enable
            or disable the survey go to{" "}
            <Link href="#" className="underline text-[#7C3AED]">
              customer satisfaction settings
            </Link>
            .
          </p>
        </section>
      </div>

      {/* Modal */}
      {modalOpen && activeChannel && (
        <Modal
          title={`Connect ${activeChannel.charAt(0).toUpperCase() + activeChannel.slice(1)}`}
          label={CHANNEL_META[activeChannel].label}
          placeholder={CHANNEL_META[activeChannel].placeholder}
          value={value}
          setValue={setValue}
          onClose={() => setModalOpen(false)}
          onSave={save}
          onDisconnect={integrations[activeChannel] ? disconnect : undefined}
          loading={loading}
        />
      )}
    </div>
  );
}

/* ---------- small building blocks ---------- */

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 ring-1 ring-[#E6ECF5]">
      {children}
    </div>
  );
}

function IconWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-7 w-7 place-items-center rounded-full bg-[#EEF2FF] text-[#6B6EF9]">
      {children}
    </div>
  );
}

function Connected() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-[#E9FBEE] px-2 py-[2px] text-[12px] font-medium text-[#10B981]">
      <CheckCircle2 className="h-3.5 w-3.5" /> Connected
    </span>
  );
}

function Integrate({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md bg-[#EEF2FF] px-3 py-1 text-sm font-semibold text-[#7C3AED] hover:bg-[#E7ECFF]"
    >
      Integrate
    </button>
  );
}

function Modal({
  title,
  label,
  placeholder,
  value,
  setValue,
  onClose,
  onSave,
  onDisconnect,
}: {
  title: string;
  label: string;
  placeholder: string;
  value: string;
  setValue: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
  onDisconnect?: () => void;
  loading?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
        <h3 className="text-lg font-semibold text-[#2F3147]">{title}</h3>
        <div className="mt-4">
          <label className="block text-sm font-medium text-[#2F3147] mb-1">{label}</label>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full h-11 rounded-md border border-[#E3E8F0] bg-white px-3 text-sm text-[#2F3147] outline-none"
          />
          <p className="mt-1 text-xs text-[#9AA2B1]">Leave empty to disconnect.</p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          {onDisconnect && (
            <button
              onClick={onDisconnect}
              className="rounded-md bg-[#FEE2E2] px-3 py-2 text-sm font-semibold text-[#B91C1C] hover:bg-[#FECACA]"
            >
              Disconnect
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-md bg-[#EEF2FF] px-3 py-2 text-sm font-semibold text-[#7C3AED] hover:bg-[#E7ECFF]"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="rounded-md bg-[#7C3AED] px-3 py-2 text-sm font-semibold text-white hover:opacity-95"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
