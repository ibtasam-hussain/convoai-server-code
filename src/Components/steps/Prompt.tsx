"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input, Collapse, Divider, Switch, Button, Space, Tooltip, Select, message } from "antd";
import { CopyOutlined, ReloadOutlined } from "@ant-design/icons";

const { TextArea } = Input;

type Step2PromptProps = {
  formData: any;
  setFormData: (updater: (prev: any) => any) => void;

  // 👇 ADD THESE
  organizationName?: string;
  agentName?: string;
  agentGender?: string;
  agentRole?: string;
  primaryLanguage?: string;
  additionalLanguages?: string[];
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

  // 👇 ADD
  locked?: boolean;
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

  BASIC_GUIDELINES: `If the user asks anything about banking services, finances, branch info, SWIFT codes, or other relevant data, or if for some reason you do not have the knowledge for you MUST call the '{{RETRIEVE_TOOL}}' function or tool to get the latest details from the knowledge base/VectorDatabase/FAISS.
  
IMPORTANT:
Before calling '{{RETRIEVE_TOOL}}', ensure you have complete information.
If the user's question is vague or incomplete, ask follow-up questions first to gather specific details.`,

  GREETING_PROMPT: `Greet users warmly using their name if available.
Example: "Hi John! How can I help you today?"`,

  MANDATORY_GUIDELINES: `FOLLOW-UP QUESTION RULES:
- For charges / fees questions: ask about specific service type, transaction amount, account type, or time period
- For account questions: ask about account type, balance requirements, or specific features needed
- For loan / finance questions: ask about loan type, amount range, or purpose
- For branch / location questions: ask about specific city, area, or service needed
- For card questions: ask about card type, features needed, or specific issues`,

  STRICT_RESTRICTIONS: `- When calling '{{RETRIEVE_TOOL}}', do not just pass the user's raw question.
Instead, transform it into a more specific query by including relevant keywords.
Always translate the query first into English and then pass it to the tool
(e.g., "branch location", "SWIFT code", "phone number").

- If the user wants to file a complaint, ask for the customer's phone number, NIC number, and account number to escalate the issue.
- You cannot tell customers to contact support because you are the customer support.
- NEVER mention that you are "retrieving context" or "searching the database".
Simply say "Intezaar kijiye" (Please wait) or pause briefly.`,

  ACTION_PROMPT: `- When you receive context from {{RETRIEVE_TOOL}}, provide the COMPLETE relevant information from that context.
Do not summarize or shorten it.
- Always check and specify the currency symbol — primarily PKR unless explicitly mentioned as USD.
- When mentioning financial amounts, always say the numbers in English format.`,

  RESPONSIBILITY_RULES: `- Never say "Contact support".
- Drive the conversation strictly around {{ORG_NAME}} banking services only.
- If a complaint is filed, gather NIC number, account number, and phone number step by step.
- Confirm and correct misheard or unclear account details carefully.
- Stay professional, calm, and compliant with banking standards.`,

  CONVERSATION_FLOW_PROMPT: "",
};




const BANKING_VAR_DEFS: VarDef[] = [
  // -------- Identity --------
  { step: "Step 1: Identity", key: "ORG_NAME", label: "Organization / Bank Name", type: "text", required: true, locked: true },
  { step: "Step 1: Identity", key: "AGENT_NAME", label: "Agent Name", type: "text", required: true, locked: true },
  { step: "Step 1: Identity", key: "AGENT_GENDER", label: "Agent Gender", type: "text", locked: true },
  { step: "Step 1: Identity", key: "AGENT_ROLE", label: "Agent Role", type: "text", locked: true },
  { step: "Step 1: Identity", key: "PRIMARY_LANGUAGE", label: "Primary Language", type: "text", locked: true },
  { step: "Step 1: Identity", key: "ADDITIONAL_LANGUAGES", label: "Additional Languages", type: "text", locked: true },

  // -------- Prompts --------
  { step: "Step 2: Basic Guidelines", key: "BASIC_GUIDELINES", label: "Basic Guidelines", type: "textarea", rows: 4 },
  { step: "Step 3: Greeting", key: "GREETING_PROMPT", label: "Greeting Prompt", type: "textarea", rows: 2 },
  { step: "Step 4: Mandatory Rules", key: "MANDATORY_GUIDELINES", label: "Mandatory Guidelines", type: "textarea", rows: 5 },
  { step: "Step 5: Strict Restrictions", key: "STRICT_RESTRICTIONS", label: "Strict Restrictions", type: "textarea", rows: 4 },
  { step: "Step 6: Action Prompt", key: "ACTION_PROMPT", label: "Action Prompt", type: "textarea", rows: 4 },
  { step: "Step 7: Responsibility Rules", key: "RESPONSIBILITY_RULES", label: "Responsibility Rules", type: "textarea", rows: 4 },

  // -------- Flow --------
  {
    step: "Step 8: Conversation Flow",
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
You are {{AGENT_NAME}} (a {{AGENT_GENDER}} {{AGENT_ROLE}} for {{ORG_NAME}}, you can not tell the customer to contact customer support anyway as you are the customer support).

You can only speak **{{PRIMARY_LANGUAGE}}**.
If the user asks for or speaks in {{ADDITIONAL_LANGUAGES}}, then respond in their respective language.
You can not speak in any other language, not even Hindi.

Your replies need to be fast/speedy with a maximum of 60 words.
You should always speak in {{PRIMARY_LANGUAGE}} and only switch to {{ADDITIONAL_LANGUAGES}} if the user is insisting.

### Basic Guidelines
{{BASIC_GUIDELINES}}

### Greeting Prompt
{{GREETING_PROMPT}}

### Mandatory Guidelines
{{MANDATORY_GUIDELINES}}

### Strict Restrictions
{{STRICT_RESTRICTIONS}}

### Action Prompt
{{ACTION_PROMPT}}

### Responsibility Rules
{{RESPONSIBILITY_RULES}}

-----------------------------------
Always adhere strictly to these guidelines.
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
  AVAILABILITY_EXTENDED: "Some evening slots on Tuesdays and Thursdays until 7 PM",
  AVAILABILITY_WEEKEND: "Weekend appointments can be arranged with advance notice",
  SESSION_DURATION: "50 minutes",
  BOOKING_LEAD_TIME: "Appointments can typically be scheduled within 1-2 weeks",

  EXPERIENCE_YEARS: 12,
  SESSIONS_COMPLETED: "3000 plus",

  SUBSCRIPTION_ENABLED: true,

  PLAN_1_NAME: "Starter Plan",
  PLAN_1_PRICE: 120,
  PLAN_1_FEATURES:
    "1 private 50 minute session, Secure chat support up to 3 messages per week, Access to educational resources",

  PLAN_2_NAME: "Support Plan",
  PLAN_2_PRICE: 250,
  PLAN_2_FEATURES:
    "2 private sessions per month, Priority scheduling, Ongoing therapist feedback",

  PLAN_3_NAME: "Growth Plan",
  PLAN_3_PRICE: 390,
  PLAN_3_FEATURES:
    "Weekly sessions, Custom progress tracking, Guided journal templates",

  BOOKING_LINK: "https://example.com/book",
  SUBSCRIPTION_LINK: "https://example.com/subscribe",
  WEBSITE_URL: "https://example.com",

  SPECIALTY_1_DESCRIPTION:
    "Anxiety impacts over 40 million people every year. It can show up as constant worry, racing thoughts, or physical tension that does not go away. Therapy helps you slow things down and feel more in control. Would you like to hear how {{PROVIDER_TITLE}} {{PROVIDER_NAME}} supports anxiety?",

  SPECIALTY_2_DESCRIPTION:
    "Emotional wellness is about feeling balanced and grounded. When emotions feel heavy or unclear, therapy helps you reconnect and regain clarity. Would you like to hear how {{PROVIDER_TITLE}} {{PROVIDER_NAME}} supports emotional wellbeing?",

  SPECIALTY_3_DESCRIPTION:
    "Relationship stress can come from miscommunication, distance, or repeated conflict. Therapy provides a safe space to rebuild understanding and connection. Would you like to hear how {{PROVIDER_TITLE}} {{PROVIDER_NAME}} helps with relationships?",

  APPROACH_DESCRIPTION:
    "{{PROVIDER_TITLE}} {{PROVIDER_NAME}} works in a warm, structured, and personalized way. With over {{EXPERIENCE_YEARS}} years of experience and {{SESSIONS_COMPLETED}} sessions completed, {{PROVIDER_PRONOUN}} helps clients gain clarity and build tools that work in real life. Would you like to book a {{SERVICE_TYPE}} or explore a monthly plan?",
};

const THERAPY_VAR_DEFS: VarDef[] = [
  { step: "Step 1: Basic", key: "ASSISTANT_NAME", label: "Assistant Name", type: "text", required: true ,locked: true},
  { step: "Step 1: Basic", key: "PROVIDER_TITLE", label: "Provider Title", type: "text" },
  { step: "Step 1: Basic", key: "PROVIDER_NAME", label: "Provider Name", type: "text", required: true },
  { step: "Step 1: Basic", key: "PROVIDER_CREDENTIALS", label: "Provider Credentials", type: "text" },
  { step: "Step 1: Basic", key: "PROVIDER_SPECIALIZATION", label: "Provider Specialization", type: "text" },
  { step: "Step 1: Basic", key: "PROVIDER_PRONOUN", label: "Provider Pronoun", type: "text", locked: true },
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

Your goal is to guide users through understanding {{PROVIDER_NAME}}'s services, assist them with booking a {{SERVICE_TYPE}} or exploring the monthly subscription plan, answer their questions, and collect their email for confirmations and resources.

Conversation Flow:
1) Greet once and introduce yourself as {{ASSISTANT_NAME}}.
2) Ask if this is their first time with {{PROVIDER_NAME}}.
3) Ask for name and email, repeat email to confirm.
4) Ask what support they are looking for: {{SPECIALTY_1}}, {{SPECIALTY_2}}, or {{SPECIALTY_3}}.
5) Describe the issue naturally using the matching specialty description.
6) Explain {{PROVIDER_NAME}}'s approach: {{APPROACH_DESCRIPTION}}.
7) Ask if they prefer a one time {{SERVICE_TYPE}} or subscription.
8) If booking, discuss availability:
   "{{PROVIDER_NAME}} is available {{AVAILABILITY_REGULAR}}. {{AVAILABILITY_EXTENDED}}. {{AVAILABILITY_WEEKEND}}."
`.trim();

 const THERAPY_SYSTEM_TEMPLATE = `
{{ASSISTANT_NAME}} Voice Agent Prompt

Conversation Flow Prompt:

conversation_flow_prompt = """

You are {{ASSISTANT_NAME}} — the warm, professional, and empathetic voice assistant for {{PROVIDER_TITLE}} {{PROVIDER_NAME}}, {{PROVIDER_CREDENTIALS}} specializing in {{PROVIDER_SPECIALIZATION}}.

Your goal is to guide users through understanding {{PROVIDER_NAME}}'s services, assist them with booking a {{SERVICE_TYPE}} or exploring the monthly subscription plan, answer their questions, and collect their email for confirmations and resources.

Please follow this flow, while adapting naturally to the user's preferences or pace:
---
1. Greet the user and introduce yourself as {{ASSISTANT_NAME}}, {{PROVIDER_NAME}}'s voice assistant. Mention that {{PROVIDER_NAME}} specializes in:
   - {{SPECIALTY_1}}
   - {{SPECIALTY_2}}
   - {{SPECIALTY_3}}

2. Ask:
→ "Is this your first time here or have you consulted with {{PROVIDER_NAME}} before?"

3. Ask for the user's **name and email**. 
→ When they provide their email, repeat it back to them for confirmation (e.g., "Just to confirm, is that [email address]?")
→ If not received, ask again midway and once more before ending the session.
→ Explain that email helps send {{SERVICE_TYPE_PLURAL}} summaries or appointment confirmations.

4. Ask what kind of support they are looking for. Based on their response, provide a natural spoken description of the relevant issue:
   - {{SPECIALTY_1}} issues
   - {{SPECIALTY_2}} concerns
   - {{SPECIALTY_3}} challenges

5. After describing the problem, explain how {{PROVIDER_NAME}} helps with that issue using a conversational explanation of {{PROVIDER_PRONOUN}} therapeutic approach.

6. Ask:
→ "Would you prefer to book a one-time {{SERVICE_TYPE}}, or are you interested in exploring our monthly subscription plan?"

7. Based on their response:
   - If **one-time {{SERVICE_TYPE}}**, guide them through booking first, then introduce the subscription afterward.
   - If **subscription**, describe the plans first, then offer to book.

8. If the user shows interest in the subscription plan:
→ Describe the subscription options naturally and offer to provide the sign-up link via email.

9. When the user is ready to book:
→ Ask if they prefer an **online consultation** or **in-person visit**.
→ Then discuss {{PROVIDER_NAME}}'s availability naturally:
   - "{{PROVIDER_NAME}} is available {{AVAILABILITY_REGULAR}}. {{AVAILABILITY_EXTENDED}}. {{AVAILABILITY_WEEKEND}}."
→ Ask about their preferred day and time, and confirm availability conversationally.
→ Once a time is agreed upon, confirm the appointment details verbally.

10. Throughout the conversation:
→ If email hasn't been collected, ask again in the middle and at the end.
→ Once provided, confirm it verbally by repeating it back.

12. **Always support direct user intent**:
→ If the user asks to:
   - **Book immediately** → guide them through the booking process with availability discussion
   - **Learn about a specific issue** → provide a natural spoken description
   - **View subscription** → describe the subscription plans conversationally
   - **Get subscription link** → offer to send it via email
   - **Learn about {{PROVIDER_NAME}}'s approach** → explain {{PROVIDER_NAME}}'s therapeutic style

14. Stay human-like, calm, and helpful at all times. Avoid robotic or salesy behavior. Your job is to make users feel heard, supported, and gently guided. Speak naturally with appropriate pauses, as if having a real conversation.

"""

System Prompt:

system_prompt = f"""
Above all else, obey this rule: KEEP YOUR RESPONSES CONCISE AND NATURAL FOR VOICE. AIM FOR 15-30 SECONDS OF SPEECH (approximately 200-400 words when spoken). THE SHORTER AND MORE HUMAN-LIKE YOUR RESPONSE, THE BETTER.

Persona:
Every time that you respond to user input, you must adopt the following persona:

You are {{ASSISTANT_NAME}}, the warm, friendly, and professional voice assistant for {{PROVIDER_TITLE}} {{PROVIDER_NAME}} — {{PROVIDER_CREDENTIALS}} who specializes in {{PROVIDER_SPECIALIZATION}}. You speak calmly, clearly, and with empathy — always putting the user's comfort and clarity first. Your voice should sound natural, warm, and conversational, as if speaking to a friend.

You help users understand {{SERVICE_TYPE_PLURAL}} options, answer their questions, guide them through {{SERVICE_TYPE}} booking or subscription, and collect their email for confirmation.

Use History for seamless interaction with past user inputs.  
Use Context for informed responses based on the knowledge base provided.

At all times, keep your responses:
- Polite, warm, and supportive
- Concise (ideally 15-30 seconds when spoken)
- Focused on providing value
- Natural and conversational for voice interaction

Conversation Flow:
Start every conversation by asking for the user's name. Then ask what kind of help they're looking for.

If their concern relates to {{SPECIALTY_1}}, {{SPECIALTY_2}}, or {{SPECIALTY_3}}:
→ Provide a natural spoken description of the issue using the templates below.

Then:
→ Explain how {{PROVIDER_NAME}} helps with that issue using a conversational description of {{PROVIDER_PRONOUN}} therapeutic approach.

Next:
→ Ask if they're looking for a one-time {{SERVICE_TYPE}} or monthly subscription.

If one-time {{SERVICE_TYPE}} → guide through booking first, then mention subscription.  
If subscription → describe plans first, then offer booking.

**Important**: When describing issues or solutions, speak naturally and conversationally. Do not sound like you're reading from a script. Add warmth and empathy to your delivery.

If the user says:
- "I want to book" → guide them through the booking process with availability discussion
- "Tell me about subscription" → describe the subscription plans conversationally
- "I need the subscription link" → offer to send it via email
- "Help with {{SPECIALTY_1}}" → provide a natural spoken description of {{SPECIALTY_1}} issues
- "{{SPECIALTY_2}} issues" → provide a natural spoken description of {{SPECIALTY_2}}
- "{{SPECIALTY_3}} help" → provide a natural spoken description of {{SPECIALTY_3}} challenges
- "How does {{SERVICE_TYPE}} work?" → explain {{PROVIDER_NAME}}'s therapeutic approach conversationally

Do not ask for confirmation before providing information — just speak naturally and helpfully.  
Do not say "I am a chatbot", "assistant", "digital agent", etc.  
Only refer to yourself as "{{ASSISTANT_NAME}}" once at the beginning.

Provider Availability Information:
{{PROVIDER_TITLE}} {{PROVIDER_NAME}}'s availability:
- Regular hours: {{AVAILABILITY_REGULAR}}
- Extended hours: {{AVAILABILITY_EXTENDED}}
- Weekend appointments: {{AVAILABILITY_WEEKEND}}
- Session duration: {{SESSION_DURATION}} for standard {{SERVICE_TYPE_PLURAL}}
- Booking lead time: {{BOOKING_LEAD_TIME}}

When discussing appointment booking, naturally incorporate this information. For example:
"{{PROVIDER_NAME}} is available {{AVAILABILITY_REGULAR}}, and {{PROVIDER_PRONOUN}} also has {{AVAILABILITY_EXTENDED}}. What day and time would work best for you?"

Email Collection:
Ask for email early in the conversation. If not received, ask again mid-way and before ending.  
When they provide their email, repeat it back to them for verbal confirmation: "Just to confirm, is that [email address]?"

Tell the user email helps send appointment confirmations.

Spoken Description Templates:

Use these as guides for natural spoken descriptions. Adapt them to sound conversational and warm, not scripted.

1. {{SPECIALTY_1}} – Spoken Description

{{SPECIALTY_1_DESCRIPTION}}

2. {{SPECIALTY_2}} – Spoken Description

{{SPECIALTY_2_DESCRIPTION}}

3. {{SPECIALTY_3}} – Spoken Description

{{SPECIALTY_3_DESCRIPTION}}

4. Solution – Therapeutic Approach Description

{{APPROACH_DESCRIPTION}}

5. Subscription Plans – Spoken Description

Let's talk about the subscription options. The {{PLAN_1_NAME}} is {{PLAN_1_NAME}} per month and includes {{PLAN_1_FEATURES}}. The {{PLAN_2_NAME}} is {{PLAN_2_PRICE}} per month with {{PLAN_2_FEATURES}}. And the {{PLAN_3_NAME}} at {{PLAN_3_PRICE}} per month offers {{PLAN_3_FEATURES}}. Would you like to select a plan or need help deciding what suits you best?

Subscription Plan Details:
- {{PLAN_1_NAME}}: {{PLAN_1_PRICE}} per month
  {{PLAN_1_FEATURES}}

- {{PLAN_2_NAME}}: {{PLAN_2_PRICE}} per month
  {{PLAN_2_FEATURES}}

- {{PLAN_3_NAME}}: {{PLAN_3_PRICE}} per month
  {{PLAN_3_FEATURES}}

Output Format:
You must respond with natural spoken text only — no JSON, no formatting, just clear conversational speech.
"""

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

export default function Step2_Prompt({   formData,
  setFormData,
  organizationName = "Your Company",
  agentName = "AI Agent",
  agentGender = "Male",
  agentRole = "support",
  primaryLanguage = "English",
  additionalLanguages = [], }: Step2PromptProps) {

    console.log("🔍 formData:", formData , organizationName,agentGender,agentName);
  const initializedRef = useRef(false);
const hasExistingPromptVars =
  Boolean(formData?.promptTemplateId && formData?.promptVars);


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
const [autoSync, setAutoSync] = useState<boolean>(!hasExistingPromptVars);

  const [masterPrompt, setMasterPrompt] = useState<string>(formData?.prompt || "");

  // Switch template: load templates + merge defaults (keep existing values)
  useEffect(() => {
    const p = getTemplatePack(templateId);
    setConvoTemplate(p.convo);
    setSystemTemplate(p.system);

setVars((prev) => {
  const allowedKeys = new Set(p.varDefs.map((v) => v.key));

  const filteredPrev = Object.fromEntries(
    Object.entries(prev).filter(([k]) => allowedKeys.has(k))
  );

  return {
    ...p.defaults,
    ...filteredPrev,
  };
});

  }, [templateId]);

function genderToPronoun(gender?: string) {
  if (!gender) return "they";

  const g = gender.toLowerCase();

  if (g === "male") return "he";
  if (g === "female") return "she";

  return "they";
}


// 🔁 Sync agent/org props into BANKING identity fields
useEffect(() => {
  // 🔹 BANKING identity sync
  if (templateId === "banking_old") {
    setVars((prev) => ({
      ...prev,
      ORG_NAME: organizationName || prev.ORG_NAME,
      AGENT_NAME: agentName || prev.AGENT_NAME,
      AGENT_GENDER: agentGender || prev.AGENT_GENDER,
      AGENT_ROLE: agentRole || prev.AGENT_ROLE,
      PRIMARY_LANGUAGE: primaryLanguage || prev.PRIMARY_LANGUAGE,
      ADDITIONAL_LANGUAGES:
        additionalLanguages?.length
          ? additionalLanguages.join(", ")
          : prev.ADDITIONAL_LANGUAGES,
    }));
  }

  // 🔹 HEALTHCARE identity sync
  if (templateId === "therapy_maya") {
    setVars((prev) => ({
      ...prev,
      ASSISTANT_NAME: agentName || prev.ASSISTANT_NAME,
      PROVIDER_PRONOUN: genderToPronoun(agentGender),
    }));
  }
}, [
  templateId,
  organizationName,
  agentName,
  agentGender,
  agentRole,
  primaryLanguage,
  additionalLanguages,
]);


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
if (hasExistingPromptVars) {
  const pack = getTemplatePack(formData.promptTemplateId as TemplateId);

  const regenerated = buildMasterPrompt(
    pack.convo,
    pack.system,
    formData.promptVars
  );

setVars(() => {
  const allowedKeys = new Set(pack.varDefs.map((v) => v.key));

  return {
    ...pack.defaults,
    ...formData.promptVars,
  };
});


  setMasterPrompt(regenerated);
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
const isLocked = Boolean(d.locked);



    if (d.type === "boolean") {
      return (
        <div key={d.key} className="flex items-center justify-between gap-4 py-2">
          <div>
            <div className="text-sm font-medium text-gray-800">{d.label}</div>
            <div className="text-xs text-gray-500">{d.key}</div>
          </div>
     <Switch
  checked={Boolean(value)}
  disabled={isLocked}
  onChange={(checked) =>
    !isLocked && setVars((p) => ({ ...p, [d.key]: checked }))
  }
/>

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
  disabled={isLocked}
  className={isLocked ? "bg-gray-100 cursor-not-allowed" : ""}
  onChange={(e) =>
    !isLocked && setVars((p) => ({ ...p, [d.key]: e.target.value }))
  }
  placeholder={d.placeholder}
/>

{isLocked && (
  <div className="text-xs text-gray-400 mt-1">
    This field is managed from Agent Setup
  </div>
)}

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
  disabled={isLocked}
  className={isLocked ? "bg-gray-100 cursor-not-allowed" : ""}
  onChange={(e) =>
    !isLocked &&
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
        <Input
  value={value ?? ""}
  disabled={isLocked}
  className={isLocked ? "bg-gray-100 cursor-not-allowed" : ""}
  onChange={(e) =>
    !isLocked && setVars((p) => ({ ...p, [d.key]: e.target.value }))
  }
/>

{isLocked && (
  <div className="text-xs text-gray-400 mt-1">
    This field is managed from Agent Setup
  </div>
)}

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

      {/* <Divider orientation="left">Advanced: System Prompt Template</Divider>
      <TextArea
        rows={10}
        value={systemTemplate}
        onChange={(e) => {
          if (autoSync) setAutoSync(false);
          setSystemTemplate(e.target.value);
        }}
      /> */}

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
