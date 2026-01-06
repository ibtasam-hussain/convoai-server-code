"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, Steps, Button, message, Spin } from "antd";
import axios from "axios";
import Step5_Agent from "@/Components/steps/Agent";
import Step2_Prompt from "@/Components/steps/Prompt";
import Step3_Knowledge from "@/Components/steps/Knowledge";
import Step4_Confirmation from "@/Components/steps/Confirmation";
import { getAgents, createAgent, updateAgent, toggleAgent } from "@/Components/services/agents";
import { useRouter } from "next/navigation";

const { Step } = Steps;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Org = {
  id: number;
  name: string;
  email: string;
  region: string;
  language: string;
  logo?: string;
  bio?: string;
};

export default function OrganizationDetailPage() {
  const { id } = useParams();
  const orgId = Number(id);
const router = useRouter();

  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
const [wizardKey, setWizardKey] = useState(0);

  const [formData, setFormData] = useState<any>({});
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  // 🟢 Fetch organization
  useEffect(() => {
    const fetchOrganization = async () => {
      const token = localStorage.getItem("token");
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/organizations/organization/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrg(res.data);
      } catch (err: any) {
        console.error(err);
        message.error("Failed to load organization details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrganization();
  }, [id]);

  // 🟢 Fetch agents
  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      const data = await getAgents(orgId);
      setAgents(data);
      console.log("Fetched agents:", data);
    } catch {
      message.error("Failed to load agents");
    } finally {
      setLoadingAgents(false);
    }
  };

  useEffect(() => {
    if (orgId) fetchAgents();
  }, [orgId]);

  // 🧭 Wizard Steps
  const steps = [
    {
      title: "Agent Setup",
      component: (
        <Step5_Agent
          organizationId={orgId}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          formData={formData}
          setFormData={setFormData}
        />
      ),
    },
{
  title: "Prompt Setup",
  component: (
    <Step2_Prompt
      formData={formData}
      setFormData={setFormData}
      agentName={formData.name}
      agentRole={formData.role}
      agentGender={formData.gender}
      organizationName={org?.name}
      primaryLanguage={formData.primaryLanguage}
      additionalLanguages={formData.additionalLanguages || []}
    />
  ),
},
    {
      title: "Knowledge Sources",
      component: (
        <Step3_Knowledge 
          organizationId={orgId} 
          agentId={selectedAgent?.id}
          agentName={formData.name}
        />
      ),
    },
   {
  title: "Add Users",
  component: (
    <Step4_Confirmation
      organizationId={orgId}
      agentId={selectedAgent?.id} // 🔥 IMPORTANT
    />
  ),
}

  ];

  // ✅ Finish handler (Create or Update)
  const handleFinish = async () => {
    try {
      message.loading(isEditMode ? "Updating agent..." : "Creating agent...", 0);

      // Auto-generate prompt if missing
      if (!formData.prompt) {
        const autoPrompt = `## Auto-Generated Prompt for ${formData.name} (${org?.name})
Agent Language: ${formData.primaryLanguage || org?.language}
Organization: ${org?.name}
-----------------------------------
${formData.description || "No description provided."}`;
        setFormData((prev: any) => ({ ...prev, prompt: autoPrompt }));
      }



const payload = {
  organizationId: orgId,
  name: formData.name,
  type: formData.type || "support",
  voice: formData.voice || null,
  gender: formData.gender || "Female",
  primaryLanguage: formData.primaryLanguage || "English",
  additionalLanguages: formData.additionalLanguages || [],
  apiKey: formData.apiKey || null,
  escalationContact: formData.escalationContact || null,

  // 🔥 ADD THESE TWO
  promptTemplateId: formData.promptTemplateId,
  promptVars: formData.promptVars,

  prompt: formData.prompt || null,
  description: formData.description || null,
  settings: formData.settings || {},
};
console.log("FINAL PAYLOAD", payload);


      if (isEditMode && selectedAgent?.id) {
        await updateAgent(selectedAgent.id, payload);
        message.success("Agent updated successfully!");
      } else {
          console.log("Creating new agent...", payload);
        
        await createAgent(payload);
        message.success("Agent created successfully!");
      }

      message.destroy();
      await fetchAgents();
      setShowWizard(false);
      setCurrentStep(0);
      setIsEditMode(false);
    } catch (err) {
      console.error("❌ Agent save error:", err);
      message.destroy();
      message.error("Failed to save agent. Please try again.");
    }
  };

  // 🧩 Handle Click on Existing Agent → Edit Mode
  const handleAgentClick = (agent: any) => {
    setSelectedAgent(agent);
    
    // Parse JSON fields if they come as strings from the database
    let parsedPrompt = agent.prompt;
    if (typeof parsedPrompt === 'string') {
      try {
        parsedPrompt = JSON.parse(parsedPrompt);
      } catch {
        // Keep as string if not valid JSON
      }
    }
    
    let parsedAdditionalLanguages = agent.additionalLanguages;
    if (typeof parsedAdditionalLanguages === 'string') {
      try {
        parsedAdditionalLanguages = JSON.parse(parsedAdditionalLanguages);
      } catch {
        parsedAdditionalLanguages = [];
      }
    }
    
    setFormData({
      ...agent,
      prompt: parsedPrompt || "",
      organizationName: org?.name || "",
      primaryLanguage: agent.primaryLanguage || org?.language || "English",
      additionalLanguages: parsedAdditionalLanguages || [],
      agentGender: agent.gender || "Male",
      agentRole: agent.type || "support",
    });
    setIsEditMode(true);
    setShowWizard(true);
    setCurrentStep(0);
  };


  
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        <Spin size="large" />
      </div>
    );

  if (!org)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Organization not found.
      </div>
    );

  return (
    <main className="min-h-screen bg-[#F6F7FB] py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-10">
<div
  className="
    bg-[#2A155A]
    rounded-2xl
    p-2
    shadow-md hover:shadow-lg
    transition-all
    cursor-pointer
    flex
    h-[320px]              /* 🔥 CARD HEIGHT INCREASED */
  "
>
  {/* LEFT IMAGE */}
  <div
    className="
      w-1/2
      h-full
      rounded-xl
      overflow-hidden
      flex-shrink-0
    "
  >
    <img
      src={org.logo || "https://placehold.co/600x400?text=ORG"}
      alt={org.name}
      className="w-full h-full  object-cover"
    />
  </div>

  {/* RIGHT CONTENT */}
  <div className="w-1/2 pl-10 flex flex-col justify-center">
    <h2 className="text-3xl font-semibold text-white mb-1">
      {org.name}
    </h2>

    <p className="text-gray-300 text-lg">
      {org.email}
    </p>

    <p className="text-gray-400 text-lg mb-3">
      {org.region} • {org.language}
    </p>

    {/* BIO — LIMITED BUT TALLER */}
    {org.bio && (
      <div
        className="
          text-gray-300
          text-sm
          leading-relaxed
          overflow-hidden
          max-h-[110px]        /* 🔥 BIO HEIGHT INCREASED */
          relative
        "
      >
        {org.bio}

        {/* FADE */}
        <div
          className="
            absolute
            bottom-0
            left-0
            w-full
            h-8
            bg-gradient-to-t
            from-[#2A155A]
            to-transparent
          "
        />
      </div>
    )}
  </div>
</div>




<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

  {/* EXISTING AGENTS */}
  {agents.map((a) => (
    <div
      key={a.id}
      className="
        relative bg-white rounded-2xl overflow-hidden shadow-lg 
        hover:scale-[1.03] transition cursor-pointer
        w-full h-[260px]
      "
      onClick={() => handleAgentClick(a)}
    >
<div className="absolute top-4 right-4 z-20">
<label className="flex items-center cursor-pointer">
  <input
    type="checkbox"
    className="sr-only peer"
    checked={a.isActive}
    onChange={async (e) => {
      e.stopPropagation();
      try {
        await toggleAgent(a.id);
        setAgents((prev: any[]) =>
          prev.map((agent: any) =>
            agent.id === a.id
              ? { ...agent, isActive: !agent.isActive }
              : agent
          )
        );
        message.success(
          `${a.name} is now ${!a.isActive ? "active" : "inactive"}`
        );
      } catch (err) {
        console.error("Toggle error:", err);
        message.error("Failed to toggle agent status");
      }
    }}
  />
  <div className="relative w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-all duration-300 ease-in-out">
    <span
      className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-all duration-300 ease-in-out ${
        a.isActive ? "translate-x-6" : "translate-x-0"
      }`}
    ></span>
  </div>
</label>
</div>



      {/* Image */}
      <div className="h-[150px] bg-white flex items-center justify-center">
        {a.avatar ? (
          <img src={a.avatar} className="h-full w-full object-contain p-5" />
        ) : (
          <div className="text-5xl font-bold text-gray-600">
            {a.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="bg-[#2A155A] p-4 text-center h-[110px]">
        <p className="text-white font-semibold text-lg">{a.name}</p>

        <div className="flex gap-3 mt-4">
<Button
  className="flex-1 bg-[#A855F7] border-none text-white"
  onClick={(e) => {
    e.stopPropagation();
    const lang = [{ name: a.primaryLanguage, image: a.avatar }];
    const encoded = encodeURIComponent(JSON.stringify(lang));
    // Open in new window/tab
    window.open(
      `/start?agent=${a.name}&agentId=${a.id}&image=${a.avatar}&languages=${encoded}`,
      '_blank'
    );
  }}
>
  Test Call
</Button>

<Button
  className="flex-1 bg-[#A855F7] border-none text-white"
  onClick={(e) => {
    e.stopPropagation();
    // Open in new window/tab
    window.open(`/chat/${a.id}?agent=${a.name}&image=${a.avatar}&languages=${a.primaryLanguage}`, '_blank');
  }}
>
  Test Chat
</Button>

        </div>
      </div>
    </div>
  ))}

  {/* ADD NEW AGENT — LAST CARD */}
  <div

    onClick={() => {
  setSelectedAgent(null);

  setFormData({
    name: "",
    type: "support",
    voice: "",
    primaryLanguage: org?.language || "English",
    additionalLanguages: [],
    apiKey: "",
    escalationContact: "",
    prompt: "",
    description: "",
    settings: {},
    organizationName: org?.name || "",
    agentGender: "",
    agentRole: "",
  });

  setIsEditMode(false);
  setCurrentStep(0);
  setWizardKey((k) => k + 1);   // 🔥 force reset of step components
  setShowWizard(true);
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
    <p className="text-white font-medium text-lg mt-4">Add New Agent</p>
  </div>
</div>





        {/* 🧩 Setup Wizard */}
        {showWizard && (
          <Card className="shadow-sm rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {isEditMode
                  ? `Edit Agent: ${selectedAgent?.name}`
                  : "Setup New Agent"}
              </h3>
              <Button onClick={() => setShowWizard(false)}>Close</Button>
            </div>

            <Steps
              current={currentStep}
              onChange={setCurrentStep}
              responsive
              className="mb-10"
            >
              {steps.map((s, i) => (
                <Step key={i} title={s.title} />
              ))}
            </Steps>

            <div className="bg-white p-6 rounded-lg shadow-inner min-h-[300px]">
<div key={wizardKey}>
  {steps[currentStep].component}
</div>

            </div>

            <div className="flex justify-end gap-3 mt-6">
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep((s) => s - 1)}>
                  Previous
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button
                  className="bg-[#5B2ECC] text-white"
                  onClick={() => setCurrentStep((s) => s + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  className="bg-[#5B2ECC] text-white"
                  onClick={handleFinish}
                >
                  {isEditMode ? "Update Agent" : "Finish"}
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
