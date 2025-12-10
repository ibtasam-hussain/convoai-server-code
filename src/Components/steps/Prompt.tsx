"use client";
import { Input, Collapse, Divider, Switch, Button, Space, Tooltip } from "antd";
import { useState, useEffect, useRef } from "react";
import { CopyOutlined, ReloadOutlined } from "@ant-design/icons";

const { TextArea } = Input;

type Step2PromptProps = {
  formData: any;
  setFormData: (updater: (prev: any) => any) => void;
  organizationName?: string;
  agentName?: string;
  agentGender?: string;
  agentRole?: string;
  primaryLanguage?: string;
  additionalLanguages?: string[];
};

export default function Step2_Prompt({
  formData,
  setFormData,
  organizationName = "Your Company",
  agentName = "AI Agent",
  agentGender = "Male",
  agentRole = "support",
  primaryLanguage = "English",
  additionalLanguages = [],
}: Step2PromptProps) {
  const [convoFlowPrompt, setConvoFlowPrompt] = useState("");
  // If formData has an existing prompt (edit mode), start with autoSync OFF to preserve it
  const hasExistingPrompt = Boolean(formData.prompt && formData.prompt.trim());
  const [autoSync, setAutoSync] = useState(!hasExistingPrompt);
  // Initialize masterPrompt with existing prompt if available (edit mode)
  const [masterPrompt, setMasterPrompt] = useState(formData.prompt || "");
  const initializedRef = useRef(false);

const [systemPrompts, setSystemPrompts] = useState({
  basicGuidelines: `If the user asks anything about banking services, finances, branch info, SWIFT codes, or other relevant data, or if for some reason you do not have the knowledge for you MUST call the 'retrieve_context' function or tool to get the latest details from the knowledge base/VectorDatabase/FAISS.
- **IMPORTANT:** Before calling 'retrieve_context', ensure you have complete information. If the user's question is vague or incomplete, ask follow-up questions first to gather specific details.`,

  greetingPrompt: `Greet users warmly using their name if available. Example: 'Hi John! How can I help you today?'`,

  mandatoryGuidelines: `🔸 **FOLLOW-UP QUESTION RULES:**
- For **charges/fees** questions: Ask about specific service type, transaction amount, account type, or time period
  Example: User says "What are your charges?" → Ask: "Kya aap kis service ke charges ke baare mein pooch rahe hain? Jaise ke account maintenance, fund transfer, ya koi aur specific service?"

- For **account** questions: Ask about account type, balance requirements, or specific features needed
  Example: User says "Tell me about accounts" → Ask: "Aap kis type ka account chahte hain? Current account, savings account, ya koi specific Islamic banking account?"

- For **loan/finance** questions: Ask about loan type, amount range, or purpose
  Example: User says "I need a loan" → Ask: "Aap kis type ka finance chahte hain? Car finance, home finance, personal finance, ya business loan?"

- For **branch/location** questions: Ask about specific city, area, or service needed
  Example: User says "Where are your branches?" → Ask: "Aap kis sheher ya area mein branch dhoond rahe hain?"

- For **card** questions: Ask about card type, features needed, or specific issues
  Example: User says "Tell me about cards" → Ask: "Aap debit card, credit card, ya ATM card ke baare mein jaanna chahte hain?"`,

  strictRestrictions: `- **When calling 'retrieve_context', do not just pass the user's raw question.**
  Instead, transform it into a more specific query by including relevant keywords. Always translate the query first in English and then pass it to the function.
  (e.g., "branch location", "SWIFT code", "phone number") to ensure you retrieve the most relevant data.
  For example, if the user says "What are your offices?", call the function with:
  { "query": "Faysal Bank branch offices or locations?" }.

- If the user's question is not about banking, or is purely general knowledge just for you, you can rely on your own internal knowledge.
- If you lack knowledge via Pinecone, ask for the customer's phone number to escalate the issue.
- If a user wants to file a complaint or is asking to file a complaint, ask for the customer's phone number, NIC number, and account number to escalate the issue.
- You **cannot** tell customers to contact support, because **you are the customer support**.
- **NEVER** mention that you are "retrieving context" or "searching the database" when calling tools. Simply say "Intezaar kijiye" (Please wait) or just pause briefly.`,

  actionPrompt: `- **When you receive context from retrieve_context, provide the COMPLETE relevant information from that context. Don't summarize or shorten - give the full details if they answer the user's question.**
- Incorporate the retrieved context in your final answer if relevant to the question.
- *When mentioning financial amounts, always say the numbers in English (e.g., say "four hundred thousand" instead of the Urdu equivalent). You cannot say Urdu numbers. You must say English numbers by using numbers in English and overall query in Urdu.*
- Always check and specify the currency symbol - primarily use PKR (Pakistani Rupees) unless explicitly mentioned as USD ($) or another currency.`,

  agentLocationResponsibility: `🔹 **STRICT RULES:**
- **Never** say "Contact support".
- **NEVER** talk about anything useless, or anything that does not respect Faysal Bank's Standards and beliefs.
- If a complaint is filed, gather **NIC number, account number, phone number step by step**, also incorporate if name is important.
- Drive conversation to Faysal Bank's topics only.
- Confirm and correct misheard account details.`,

  outOfLocationResponse: `If the user's question is not about banking, or is purely general knowledge just for you, you can rely on your own internal knowledge.`,

  irrelevantQuestionResponse: `If the user's question is vague or incomplete, ask follow-up questions first to gather specific details.`,

  delayWaitingResponse: `**NEVER** mention that you are "retrieving context" or "searching the database" when calling tools. Simply say "Intezaar kijiye" (Please wait) or just pause briefly.`,

  additionalPrompt: `Always check and specify the currency symbol - primarily use PKR (Pakistani Rupees) unless explicitly mentioned as USD ($) or another currency.`,
});

  /** Utility: Format section headers nicely */
  const formatKey = (key: string) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();

  /** 🔄 Apply dynamic placeholders */
  const applyDynamicValues = (text: string) =>
    text
      .replace(/{{organizationName}}/g, organizationName)
      .replace(/{{agentName}}/g, agentName)
      .replace(/{{agentGender}}/g, agentGender)
      .replace(/{{agentRole}}/g, agentRole)
      .replace(/{{primaryLanguage}}/g, primaryLanguage)
      .replace(/{{additionalLanguages}}/g, additionalLanguages.join(", "));

  /** 🧱 Build master prompt */
  const buildMasterPrompt = () => {
    const identityLine = `### About Agent


You are ${agentName} (a ${agentGender} ${agentRole} for ${organizationName}, you can not tell the customer to contact customer support anyway as you are the customer support). 
You can only speak **${primaryLanguage}**.If user ask for or speaks in ${additionalLanguages.join(", ") || "no additional languages"} then respond to them in their respective language. You can not speak in any other language not even Hindi, 
and your replies need to be with fast/speedy tone with with max 60 words. You should always speak in ${primaryLanguage} and only switch to ${additionalLanguages.join(", ") || "no additional languages"} if the user is insisting.`
    const systemText = Object.entries(systemPrompts)
      .map(([key, val]) => `### ${formatKey(key)}\n${val}`)
      .join("\n\n");

    const convoSection = applyDynamicValues(convoFlowPrompt);

    return `## Master Prompt (Auto-Generated)

${identityLine}

### Conversation Flow Prompt
${convoSection || "(No conversation flow defined yet)"}

${systemText}

-----------------------------------
Always adhere strictly to these guidelines while interacting with users.`;
  };

  /** Auto-sync master prompt on changes */
  useEffect(() => {
    if (autoSync) setMasterPrompt(buildMasterPrompt());
  }, [
    convoFlowPrompt,
    systemPrompts,
    autoSync,
    organizationName,
    agentName,
    agentGender,
    primaryLanguage,
    additionalLanguages,
  ]);

  /** Keep parent formData updated */
  useEffect(() => {
    setFormData((prev: any) => ({ ...prev, prompt: masterPrompt }));
  }, [masterPrompt, setFormData]);

  /** Prefill prompt dynamically if agent/org changes (only for new agents) */
  useEffect(() => {
    // On initial mount, if we have an existing prompt (edit mode), preserve it
    if (!initializedRef.current) {
      initializedRef.current = true;
      if (formData.prompt && formData.prompt.trim()) {
        // Edit mode - keep the existing prompt, don't auto-generate
        setMasterPrompt(formData.prompt);
        return;
      }
    }
    
    // Only auto-generate for new agents without a prompt
    if (!formData.prompt || !formData.prompt.trim()) {
      const defaultPrompt = buildMasterPrompt();
      setMasterPrompt(defaultPrompt);
      setFormData((prev: any) => ({ ...prev, prompt: defaultPrompt }));
    }
  }, [organizationName, agentName]);

  return (
    <div className="text-black">
      <h2 className="text-xl font-semibold mb-1">AI Prompt Setup</h2>
      <p className="text-sm text-gray-500 mb-4">
        Define how your organization’s AI agent behaves, greets, and responds.
      </p>

      {/* Conversation Flow */}
      <Divider orientation="left">Conversation Flow Prompt</Divider>
      <TextArea
        rows={5}
        placeholder="Write the base conversation tone or script for your AI..."
        value={applyDynamicValues(convoFlowPrompt)}
        onChange={(e) => setConvoFlowPrompt(e.target.value)}
      />

      {/* System Prompts */}
      <Divider orientation="left">System Prompts</Divider>
      <Collapse
        accordion
        items={Object.entries(systemPrompts).map(([key, value]) => ({
          key,
          label: formatKey(key),
          children: (
            <TextArea
              rows={4}
              value={value}
              onChange={(e) =>
                setSystemPrompts((prev) => ({ ...prev, [key]: e.target.value }))
              }
              placeholder={`Write details for ${formatKey(key)}...`}
            />
          ),
        }))}
      />

      {/* Controls */}
      <div className="flex items-center justify-between mt-4 mb-2">
        <Space size="middle">
          <Switch checked={autoSync} onChange={setAutoSync} />
          <span className="text-sm text-gray-700">
            Auto-sync Master Prompt from sections
          </span>
        </Space>

        <Tooltip title="Rebuild the Master Prompt from the sections above">
          <Button
            icon={<ReloadOutlined />}
            onClick={() => setMasterPrompt(buildMasterPrompt())}
          >
            Regenerate
          </Button>
        </Tooltip>
      </div>

      {/* Master Prompt */}
      <Divider orientation="left">Master Prompt (Editable)</Divider>
      <TextArea
        rows={12}
        value={masterPrompt}
        onChange={(e) => {
          if (autoSync) setAutoSync(false);
          setMasterPrompt(e.target.value);
        }}
        className="bg-gray-50 border-gray-200 text-gray-700 font-mono text-sm"
      />

      {!autoSync && (
        <p className="mt-2 text-xs text-gray-500">
          Auto-sync is <b>OFF</b>. Manual edits won't be overwritten. Turn it
          back on or click <em>Regenerate</em> to rebuild automatically.
        </p>
      )}
    </div>
  );
}
