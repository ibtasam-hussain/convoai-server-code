"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input, Collapse, Divider, Switch, Button, Space, Tooltip, Select, message } from "antd";
import { CopyOutlined, ReloadOutlined } from "@ant-design/icons";

const { TextArea } = Input;

type Step2PromptProps = {
  formData: any;
  setFormData: (updater: (prev: any) => any) => void;
};

type TemplateId = "banking_old" | "therapy_maya";

type VarType = "text" | "textarea" | "number" | "boolean" | "url";

type VarDef = {
  key: string;
  label: string;
  type: VarType;
  step: string;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  showWhen?: (vars: Record<string, any>) => boolean;
};

const TEMPLATE_OPTIONS = [
  { value: "banking_old", label: " Banking" },
  { value: "therapy_maya", label: " Healthcare" },
] as const;

/* ---------------------------
   ✅ OLD BANKING TEMPLATE (your old one)
   - Converted into template strings
   - Uses variables like {{ORG_NAME}}, {{AGENT_NAME}}, etc.
---------------------------- */

const BANKING_DEFAULT_VARS: Record<string, any> = {
  ORG_NAME: "Faysal Bank",
  AGENT_NAME: "AI Agent",
  AGENT_GENDER: "Male",
  AGENT_ROLE: "customer support",
  PRIMARY_LANGUAGE: "Urdu",
  ADDITIONAL_LANGUAGES: "English",
  RETRIEVE_TOOL: "retrieve_context",
  CONVERSATION_FLOW_PROMPT: "", // user will fill
};

const BANKING_VAR_DEFS: VarDef[] = [
  { step: "Step 1: Identity", key: "ORG_NAME", label: "Organization / Bank Name", type: "text", required: true },
  { step: "Step 1: Identity", key: "AGENT_NAME", label: "Agent Name", type: "text", required: true },
  { step: "Step 1: Identity", key: "AGENT_GENDER", label: "Agent Gender", type: "text" },
  { step: "Step 1: Identity", key: "AGENT_ROLE", label: "Agent Role", type: "text" },
  { step: "Step 1: Identity", key: "PRIMARY_LANGUAGE", label: "Primary Language", type: "text" },
  { step: "Step 1: Identity", key: "ADDITIONAL_LANGUAGES", label: "Additional Languages (comma separated)", type: "text" },
  { step: "Step 2: Tools", key: "RETRIEVE_TOOL", label: "Retrieval Tool Name", type: "text" },
  {
    step: "Step 3: Conversation Flow",
    key: "CONVERSATION_FLOW_PROMPT",
    label: "Conversation Flow Prompt",
    type: "textarea",
    rows: 6,
    placeholder: "Write base flow/tone/script for banking assistant...",
  },
];

const BANKING_CONVO_TEMPLATE = `
{{CONVERSATION_FLOW_PROMPT}}
`.trim();

const BANKING_SYSTEM_TEMPLATE = `
### About Agent
You are {{AGENT_NAME}} (a {{AGENT_GENDER}} {{AGENT_ROLE}} for {{ORG_NAME}}).
You can not tell the customer to contact customer support anyway as you are the customer support.
You can only speak **{{PRIMARY_LANGUAGE}}**. If user asks for or speaks in {{ADDITIONAL_LANGUAGES}} then respond to them in their respective language.
You can not speak in any other language not even Hindi.
Your replies need to be fast/speedy tone with max 60 words.

### Basic Guidelines
If the user asks anything about banking services, finances, branch info, SWIFT codes, or other relevant data — or if for some reason you do not have the knowledge — you MUST call the '{{RETRIEVE_TOOL}}' tool to get the latest details from the knowledge base/VectorDatabase/FAISS.
IMPORTANT: Before calling '{{RETRIEVE_TOOL}}', ensure you have complete information. If the user's question is vague or incomplete, ask follow-up questions first.

### Greeting Prompt
Greet users warmly using their name if available. Example: 'Hi John! How can I help you today?'

### Mandatory Guidelines
FOLLOW-UP QUESTION RULES:
- For charges/fees: ask service type, amount, account type, or time period
- For accounts: ask account type and features needed
- For loans/finance: ask loan type, amount range, purpose
- For branch/location: ask city/area
- For cards: ask card type/features/issues

### Strict Restrictions
- When calling '{{RETRIEVE_TOOL}}', do not just pass raw question.
  Transform into a specific query with keywords. Translate query to English first, then pass to tool.
- If user wants to file a complaint: gather phone number, NIC number, and account number step by step.
- You cannot tell customers to contact support.
- NEVER mention that you are retrieving context/searching DB. Say "Intezaar kijiye" or pause briefly.

### Action Prompt
- When you receive context from {{RETRIEVE_TOOL}}, provide COMPLETE relevant information from that context.
- Mention currency clearly (PKR default unless user says USD).
- When mentioning amounts: speak numbers in English format.

### Responsibility Rules
- Never say "Contact support".
- Drive conversation to {{ORG_NAME}} topics only.
- Confirm and correct misheard account details.

-----------------------------------
Always adhere strictly to these guidelines while interacting with users.
`.trim();

/* ---------------------------
   ✅ HEALTHCARE / THERAPY TEMPLATE (Maya)
   - Your variable list converted
---------------------------- */

const THERAPY_DEFAULT_VARS: Record<string, any> = {
  ASSISTANT_NAME: "Maya",
  PROVIDER_NAME: "Emily Thompson",
  PROVIDER_TITLE: "Dr.",
  PROVIDER_CREDENTIALS: "a licensed therapist",
  PROVIDER_SPECIALIZATION: "anxiety, emotional wellness, and relationship issues",
  PROVIDER_PRONOUN: "she",
  SERVICE_TYPE: "therapy session",
  SERVICE_TYPE_PLURAL: "therapy sessions",

  SPECIALTY_1: "Anxiety",
  SPECIALTY_2: "Emotional wellness",
  SPECIALTY_3: "Relationships",

  AVAILABILITY_REGULAR: "Monday through Friday from 9 AM to 5 PM",
  AVAILABILITY_EXTENDED: "She also has some evening slots on Tuesdays and Thursdays until 7 PM",
  AVAILABILITY_WEEKEND: "Weekend appointments can be arranged with advance notice (typically Saturday mornings)",
  SESSION_DURATION: "50 minutes",
  BOOKING_LEAD_TIME: "Appointments can typically be scheduled within 1-2 weeks, with some same-week availability",

  EXPERIENCE_YEARS: 12,
  SESSIONS_COMPLETED: "3000 plus",

  SUBSCRIPTION_ENABLED: true,
  PLAN_1_NAME: "Starter Plan",
  PLAN_1_PRICE: 120,
  PLAN_1_FEATURES:
    "1 private 50-min session, Secure chat support (up to 3 messages/week), Access to educational resources, Option to upgrade anytime",
  PLAN_2_NAME: "Support Plan",
  PLAN_2_PRICE: 250,
  PLAN_2_FEATURES:
    "2 private sessions/month, Priority scheduling, Ongoing therapist feedback, Access to full resource library and breathing technique videos",
  PLAN_3_NAME: "Growth Plan",
  PLAN_3_PRICE: 390,
  PLAN_3_FEATURES:
    "Weekly sessions (4/month), Custom progress tracking reports, Guided journal templates, Private Q&A with Dr. Emily (email/chat)",

  BOOKING_LINK: "https://example.com/book-appointment",
  SUBSCRIPTION_LINK: "https://example.com/subscription",
  WEBSITE_URL: "https://example.com",

  SPECIALTY_1_DESCRIPTION:
    "Anxiety impacts over 40 million people in the US every year. It's more than just stress — it's that constant feeling of being on edge, racing thoughts that never stop, and tension that doesn't go away. Would you like to hear how {{PROVIDER_TITLE}} {{PROVIDER_NAME}} supports clients in working through anxiety with calm and confidence?",
  SPECIALTY_2_DESCRIPTION:
    "Feeling emotionally off doesn't always mean you're in crisis. Sometimes, it just means you've been carrying too much. Would you like to hear how {{PROVIDER_TITLE}} {{PROVIDER_NAME}} supports emotional healing?",
  SPECIALTY_3_DESCRIPTION:
    "More than 60 percent of people say relationships are a major source of stress. Therapy creates a safe space to reflect and rebuild. Would you like to hear how {{PROVIDER_TITLE}} {{PROVIDER_NAME}} helps improve connection and communication?",
  APPROACH_DESCRIPTION:
    "{{PROVIDER_TITLE}} {{PROVIDER_NAME}}'s therapy style is warm, structured, and personalized. With over {{EXPERIENCE_YEARS}} years of experience and {{SESSIONS_COMPLETED}} sessions completed, {{PROVIDER_PRONOUN}} helps you gain clarity and build tools that work in real life. Would you like to book a {{SERVICE_TYPE}} or explore the monthly plan?",
};

const THERAPY_VAR_DEFS: VarDef[] = [
  { step: "Step 1: Basic", key: "ASSISTANT_NAME", label: "Assistant Name", type: "text", required: true },
  { step: "Step 1: Basic", key: "PROVIDER_TITLE", label: "Provider Title", type: "text" },
  { step: "Step 1: Basic", key: "PROVIDER_NAME", label: "Provider Name", type: "text", required: true },
  { step: "Step 1: Basic", key: "PROVIDER_CREDENTIALS", label: "Provider Credentials", type: "text" },
  { step: "Step 1: Basic", key: "PROVIDER_SPECIALIZATION", label: "Provider Specialization", type: "text" },
  { step: "Step 1: Basic", key: "PROVIDER_PRONOUN", label: "Provider Pronoun", type: "text" },
  { step: "Step 1: Basic", key: "SERVICE_TYPE", label: "Service Type", type: "text" },

  { step: "Step 2: Specialties", key: "SPECIALTY_1", label: "Specialty 1", type: "text" },
  { step: "Step 2: Specialties", key: "SPECIALTY_2", label: "Specialty 2", type: "text" },
  { step: "Step 2: Specialties", key: "SPECIALTY_3", label: "Specialty 3", type: "text" },

  { step: "Step 3: Availability", key: "AVAILABILITY_REGULAR", label: "Regular Availability", type: "text" },
  { step: "Step 3: Availability", key: "AVAILABILITY_EXTENDED", label: "Extended Availability", type: "text" },
  { step: "Step 3: Availability", key: "AVAILABILITY_WEEKEND", label: "Weekend Availability", type: "text" },
  { step: "Step 3: Availability", key: "SESSION_DURATION", label: "Session Duration", type: "text" },
  { step: "Step 3: Availability", key: "BOOKING_LEAD_TIME", label: "Booking Lead Time", type: "text" },

  { step: "Step 4: Experience", key: "EXPERIENCE_YEARS", label: "Years of Experience", type: "number" },
  { step: "Step 4: Experience", key: "SESSIONS_COMPLETED", label: "Sessions Completed (text)", type: "text" },

  { step: "Step 5: Subscription", key: "SUBSCRIPTION_ENABLED", label: "Subscription Enabled", type: "boolean" },

  { step: "Step 5: Subscription", key: "PLAN_1_NAME", label: "Plan 1 Name", type: "text", showWhen: (v) => !!v.SUBSCRIPTION_ENABLED },
  { step: "Step 5: Subscription", key: "PLAN_1_PRICE", label: "Plan 1 Price", type: "number", showWhen: (v) => !!v.SUBSCRIPTION_ENABLED },
  { step: "Step 5: Subscription", key: "PLAN_1_FEATURES", label: "Plan 1 Features", type: "textarea", rows: 3, showWhen: (v) => !!v.SUBSCRIPTION_ENABLED },

  { step: "Step 5: Subscription", key: "PLAN_2_NAME", label: "Plan 2 Name", type: "text", showWhen: (v) => !!v.SUBSCRIPTION_ENABLED },
  { step: "Step 5: Subscription", key: "PLAN_2_PRICE", label: "Plan 2 Price", type: "number", showWhen: (v) => !!v.SUBSCRIPTION_ENABLED },
  { step: "Step 5: Subscription", key: "PLAN_2_FEATURES", label: "Plan 2 Features", type: "textarea", rows: 3, showWhen: (v) => !!v.SUBSCRIPTION_ENABLED },

  { step: "Step 5: Subscription", key: "PLAN_3_NAME", label: "Plan 3 Name", type: "text", showWhen: (v) => !!v.SUBSCRIPTION_ENABLED },
  { step: "Step 5: Subscription", key: "PLAN_3_PRICE", label: "Plan 3 Price", type: "number", showWhen: (v) => !!v.SUBSCRIPTION_ENABLED },
  { step: "Step 5: Subscription", key: "PLAN_3_FEATURES", label: "Plan 3 Features", type: "textarea", rows: 3, showWhen: (v) => !!v.SUBSCRIPTION_ENABLED },

  { step: "Step 6: Links", key: "BOOKING_LINK", label: "Booking Link", type: "url" },
  { step: "Step 6: Links", key: "SUBSCRIPTION_LINK", label: "Subscription Link", type: "url", showWhen: (v) => !!v.SUBSCRIPTION_ENABLED },
  { step: "Step 6: Links", key: "WEBSITE_URL", label: "Website URL", type: "url" },

  { step: "Step 7: Descriptions", key: "SPECIALTY_1_DESCRIPTION", label: "Specialty 1 Description", type: "textarea", rows: 5 },
  { step: "Step 7: Descriptions", key: "SPECIALTY_2_DESCRIPTION", label: "Specialty 2 Description", type: "textarea", rows: 5 },
  { step: "Step 7: Descriptions", key: "SPECIALTY_3_DESCRIPTION", label: "Specialty 3 Description", type: "textarea", rows: 5 },

  { step: "Step 8: Approach", key: "APPROACH_DESCRIPTION", label: "Approach Description", type: "textarea", rows: 5 },
];

const THERAPY_CONVO_TEMPLATE = `
You are {{ASSISTANT_NAME}} — the warm, professional, and empathetic voice assistant for {{PROVIDER_TITLE}} {{PROVIDER_NAME}}, {{PROVIDER_CREDENTIALS}} specializing in {{PROVIDER_SPECIALIZATION}}.

Your goal is to guide users through understanding {{PROVIDER_TITLE}} {{PROVIDER_NAME}}'s services, assist them with booking a {{SERVICE_TYPE}} or exploring the monthly subscription plan, answer their questions, and collect their email for confirmations and resources.

Always say "please wait while I fetch the information" or something similar when accessing vector db for extra information.

Flow:
1) Greet and introduce yourself as {{ASSISTANT_NAME}}.
2) Ask if it’s their first time.
3) Ask for name + email (repeat email back to confirm).
4) Ask what support they are looking for ({{SPECIALTY_1}}, {{SPECIALTY_2}}, {{SPECIALTY_3}}).
5) Explain approach: {{APPROACH_DESCRIPTION}}
6) Ask one-time {{SERVICE_TYPE}} or subscription.
7) Booking: online vs in-person, then availability:
   "{{PROVIDER_TITLE}} {{PROVIDER_NAME}} is available {{AVAILABILITY_REGULAR}}. {{AVAILABILITY_EXTENDED}}. {{AVAILABILITY_WEEKEND}}."
`.trim();

const THERAPY_SYSTEM_TEMPLATE = `
KEEP RESPONSES CONCISE AND NATURAL FOR VOICE.

Persona:
You are {{ASSISTANT_NAME}}, the warm voice assistant for {{PROVIDER_TITLE}} {{PROVIDER_NAME}} — {{PROVIDER_CREDENTIALS}} specializing in {{PROVIDER_SPECIALIZATION}}.

Availability:
- Regular: {{AVAILABILITY_REGULAR}}
- Extended: {{AVAILABILITY_EXTENDED}}
- Weekend: {{AVAILABILITY_WEEKEND}}
- Session duration: {{SESSION_DURATION}}
- Booking lead time: {{BOOKING_LEAD_TIME}}

Email:
Ask early, ask again mid-way, and before ending. Repeat back to confirm.

Spoken descriptions:
1) {{SPECIALTY_1}}: {{SPECIALTY_1_DESCRIPTION}}
2) {{SPECIALTY_2}}: {{SPECIALTY_2_DESCRIPTION}}
3) {{SPECIALTY_3}}: {{SPECIALTY_3_DESCRIPTION}}

Approach:
{{APPROACH_DESCRIPTION}}

{{SUBSCRIPTION_BLOCK}}

Rules:
- Greet only once at the start
- If user says "book", go straight into booking
`.trim();

/* ---------------------------
   Shared Helpers
---------------------------- */

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceVars(template: string, vars: Record<string, any>) {
  let out = template;

  // subscription block only for therapy template (safe for others)
  const subscriptionEnabled = Boolean(vars.SUBSCRIPTION_ENABLED);

  const subscriptionBlock = subscriptionEnabled
    ? `
Subscription Plans:
- ${vars.PLAN_1_NAME}: $${vars.PLAN_1_PRICE}/mo. ${vars.PLAN_1_FEATURES}
- ${vars.PLAN_2_NAME}: $${vars.PLAN_2_PRICE}/mo. ${vars.PLAN_2_FEATURES}
- ${vars.PLAN_3_NAME}: $${vars.PLAN_3_PRICE}/mo. ${vars.PLAN_3_FEATURES}

If user wants sign-up link, offer via email: ${vars.SUBSCRIPTION_LINK}
`.trim()
    : "";

  out = out.replace(/{{SUBSCRIPTION_BLOCK}}/g, subscriptionBlock);

  Object.entries(vars).forEach(([k, v]) => {
    const val = v === null || v === undefined ? "" : String(v);
    const rx = new RegExp(`{{\\s*${escapeRegExp(k)}\\s*}}`, "g");
    out = out.replace(rx, val);
  });

  return out;
}

function buildMasterPrompt(convo: string, sys: string, vars: Record<string, any>) {
  const convoOut = replaceVars(convo, vars).trim();
  const sysOut = replaceVars(sys, vars).trim();

  return `Master Prompt

Conversation Flow Prompt:

${convoOut}

System Prompt:

${sysOut}
`;
}

function getTemplatePack(templateId: TemplateId) {
  if (templateId === "banking_old") {
    return {
      defaults: BANKING_DEFAULT_VARS,
      varDefs: BANKING_VAR_DEFS,
      convo: BANKING_CONVO_TEMPLATE,
      system: BANKING_SYSTEM_TEMPLATE,
    };
  }

  return {
    defaults: THERAPY_DEFAULT_VARS,
    varDefs: THERAPY_VAR_DEFS,
    convo: THERAPY_CONVO_TEMPLATE,
    system: THERAPY_SYSTEM_TEMPLATE,
  };
}

/* ---------------------------
   Component
---------------------------- */

export default function Step2_Prompt({ formData, setFormData }: Step2PromptProps) {
  const initializedRef = useRef(false);
  const hasExistingPrompt = Boolean(formData?.prompt && String(formData.prompt).trim());

  // if previously saved, restore template selection
  const initialTemplate: TemplateId = (formData?.promptTemplateId as TemplateId) || "banking_old";
  const [templateId, setTemplateId] = useState<TemplateId>(initialTemplate);

  const pack = useMemo(() => getTemplatePack(templateId), [templateId]);

  const [vars, setVars] = useState<Record<string, any>>({
    ...pack.defaults,
    ...(formData?.promptVars || {}),
  });

  const [convoTemplate, setConvoTemplate] = useState<string>(pack.convo);
  const [systemTemplate, setSystemTemplate] = useState<string>(pack.system);

  // Edit mode: default autosync off (preserve saved prompt)
  const [autoSync, setAutoSync] = useState<boolean>(!hasExistingPrompt);
  const [masterPrompt, setMasterPrompt] = useState<string>(formData?.prompt || "");

  // Switch template: load templates + merge defaults (keep existing values)
  useEffect(() => {
    const p = getTemplatePack(templateId);
    setConvoTemplate(p.convo);
    setSystemTemplate(p.system);

    setVars((prev) => ({
      ...p.defaults,
      ...prev, // keep what user already typed
    }));
  }, [templateId]);

  // Group fields by step
  const steps = useMemo(() => {
    const map = new Map<string, VarDef[]>();
    pack.varDefs.forEach((d) => {
      if (!map.has(d.step)) map.set(d.step, []);
      map.get(d.step)!.push(d);
    });
    return Array.from(map.entries()).map(([step, defs]) => ({ step, defs }));
  }, [pack.varDefs]);

  // initial mount behavior
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // If edit mode, keep existing prompt
    if (hasExistingPrompt) {
      setMasterPrompt(formData.prompt);
      setAutoSync(false);
      return;
    }

    // new: generate once
    const generated = buildMasterPrompt(convoTemplate, systemTemplate, vars);
    setMasterPrompt(generated);
    setFormData((prev: any) => ({
      ...prev,
      prompt: generated,
      promptVars: vars,
      promptTemplateId: templateId,
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // auto sync
  useEffect(() => {
    if (!autoSync) return;
    const generated = buildMasterPrompt(convoTemplate, systemTemplate, vars);
    setMasterPrompt(generated);
  }, [autoSync, convoTemplate, systemTemplate, vars]);

  // keep parent updated
  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      prompt: masterPrompt,
      promptVars: vars,
      promptTemplateId: templateId,
    }));
  }, [masterPrompt, vars, templateId, setFormData]);

  const renderField = (d: VarDef) => {
    const visible = d.showWhen ? d.showWhen(vars) : true;
    if (!visible) return null;

    const value = vars[d.key];

    if (d.type === "boolean") {
      return (
        <div key={d.key} className="flex items-center justify-between gap-4 py-2">
          <div>
            <div className="text-sm font-medium text-gray-800">{d.label}</div>
            <div className="text-xs text-gray-500">{d.key}</div>
          </div>
          <Switch checked={Boolean(value)} onChange={(checked) => setVars((p) => ({ ...p, [d.key]: checked }))} />
        </div>
      );
    }

    if (d.type === "textarea") {
      return (
        <div key={d.key} className="py-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-800">{d.label}</div>
            <div className="text-xs text-gray-500">{d.key}</div>
          </div>
          <TextArea
            rows={d.rows || 4}
            value={value ?? ""}
            onChange={(e) => setVars((p) => ({ ...p, [d.key]: e.target.value }))}
            placeholder={d.placeholder}
          />
        </div>
      );
    }

    if (d.type === "number") {
      return (
        <div key={d.key} className="py-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-800">{d.label}</div>
            <div className="text-xs text-gray-500">{d.key}</div>
          </div>
          <Input
            type="number"
            value={value ?? ""}
            onChange={(e) =>
              setVars((p) => ({
                ...p,
                [d.key]: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
          />
        </div>
      );
    }

    return (
      <div key={d.key} className="py-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-800">{d.label}</div>
          <div className="text-xs text-gray-500">{d.key}</div>
        </div>
        <Input value={value ?? ""} onChange={(e) => setVars((p) => ({ ...p, [d.key]: e.target.value }))} />
      </div>
    );
  };

  const handleRegenerate = () => {
    const generated = buildMasterPrompt(convoTemplate, systemTemplate, vars);
    setMasterPrompt(generated);
    message.success("Master prompt regenerated");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(masterPrompt || "");
      message.success("Copied");
    } catch {
      message.error("Copy failed");
    }
  };

  return (
    <div className="text-black">
      <h2 className="text-xl font-semibold mb-1">AI Prompt Setup</h2>
      <p className="text-sm text-gray-500 mb-4">
        Select a template, fill variables, and generate a Master Prompt.
      </p>

      {/* Template Dropdown */}
      <Divider orientation="left">Prompt Template</Divider>
      <Select
        className="w-full"
        value={templateId}
        onChange={(v) => setTemplateId(v as TemplateId)}
        options={TEMPLATE_OPTIONS as any}
      />

      {/* Variables */}
      <Divider orientation="left">Variables</Divider>
      <Collapse
        accordion
        items={steps.map(({ step, defs }) => ({
          key: step,
          label: step,
          children: <div className="space-y-2">{defs.map(renderField)}</div>,
        }))}
      />

      {/* Advanced templates */}
      <Divider orientation="left">Advanced: Conversation Flow Template</Divider>
      <TextArea
        rows={6}
        value={convoTemplate}
        onChange={(e) => {
          if (autoSync) setAutoSync(false);
          setConvoTemplate(e.target.value);
        }}
      />

      <Divider orientation="left">Advanced: System Prompt Template</Divider>
      <TextArea
        rows={10}
        value={systemTemplate}
        onChange={(e) => {
          if (autoSync) setAutoSync(false);
          setSystemTemplate(e.target.value);
        }}
      />

      {/* Controls */}
      <div className="flex items-center justify-between mt-4 mb-2">
        <Space size="middle">
          <Switch checked={autoSync} onChange={setAutoSync} />
          <span className="text-sm text-gray-700">Auto-sync Master Prompt</span>
        </Space>

        <Space>
          <Tooltip title="Rebuild Master Prompt using selected template + variables">
            <Button icon={<ReloadOutlined />} onClick={handleRegenerate}>
              Regenerate
            </Button>
          </Tooltip>
          <Tooltip title="Copy Master Prompt">
            <Button icon={<CopyOutlined />} onClick={handleCopy}>
              Copy
            </Button>
          </Tooltip>
        </Space>
      </div>

      {/* Master Prompt */}
      <Divider orientation="left">Master Prompt (Editable)</Divider>
      <TextArea
        rows={14}
        value={masterPrompt}
        onChange={(e) => {
          if (autoSync) setAutoSync(false);
          setMasterPrompt(e.target.value);
        }}
        className="bg-gray-50 border-gray-200 text-gray-700 font-mono text-sm"
      />

      {!autoSync && (
        <p className="mt-2 text-xs text-gray-500">
          Auto-sync is <b>OFF</b>. Manual edits won&apos;t be overwritten.
          Turn it back on or click <em>Regenerate</em>.
        </p>
      )}
    </div>
  );
}
