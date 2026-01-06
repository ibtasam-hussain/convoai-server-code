"use client";
import { apiUrl, pythonUrl2 } from "@/config/config";
import { axiosClient } from "@/utils/axiosClient";
import { message } from "antd";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import "@ant-design/v5-patch-for-react-19";
import secureLocalStorage from "react-secure-storage";
import { useRouter, useSearchParams } from "next/navigation";
import { BsSend } from "react-icons/bs";
import { IoMicOutline,IoAttachSharp  } from "react-icons/io5";
import { FiImage ,FiSend  } from "react-icons/fi";

const Chat = ({ id }) => {
  const router = useRouter();
  const [messages, setMessages] = useState([
    // { type: 'user', message: 'Hello' },
  ]);
  const [input, setInput] = useState("");
  const [indexName, setIndexName] = useState("");
  const [agentPrompt, setAgentPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const searchParams = useSearchParams();
  const agentName = searchParams.get("agent");
  const agentImage = searchParams.get("image");
  const agentId = searchParams.get("agentId");
  const agentLanguages = searchParams.get("languages");

  const chatContainerRef = useRef(null);

  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    message.success(`Image selected: ${file.name}`);
    // later: preview / upload
  };

  useEffect(() => {
    const id = sessionStorage.getItem("sessionId");
    if (id) return setSessionId(id);

    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    sessionStorage.setItem("sessionId", newSessionId);
  }, []);

  const sendMessage = async () => {
    if (loading) return;
    if (!indexName) return message.error("Chat model not found!");
    if (!input.trim()) return; // Don't send empty messages

    setMessages((prev) => [...prev, { type: "user", message: input }]);
    setLoading(true);

    try {
      // Remove leading slash from indexName if present, as the route expects just the index name
      const cleanIndexName = indexName.startsWith("/")
        ? indexName.slice(1)
        : indexName;
      // Ensure pythonUrl2 includes the /python2 prefix even if env omits it
      const chatBase = pythonUrl2.endsWith("/python2")
        ? pythonUrl2
        : `${pythonUrl2}/python2`;

      const response = await axios.post(`${chatBase}/chat/${cleanIndexName}`, {
        message: input,
        session_id: sessionId,
        indexName: cleanIndexName,
        // Include agent prompt for dynamic behavior (if Python server supports it)
        system_prompt: agentPrompt || undefined,
      });
      console.log("res.data in /chat: ", response?.data);
      response?.data?.response
        ? setMessages((prev) => [
            ...prev,
            { type: "bot", message: response?.data?.response },
          ])
        : setMessages((prev) => [
            ...prev,
            { type: "bot", message: "There was an error. Please try again!" },
          ]);
    } catch (error) {
      console.error(
        "Error in /chat: ",
        error?.response?.data || error?.message || error
      );
      const msg =
        JSON.stringify(error?.response?.data?.message) ||
        JSON.stringify(error?.response?.data) ||
        JSON.stringify(error?.message) ||
        JSON.stringify(error);
      message.error("There is an error while sending message: " + msg);
    } finally {
      setInput("");
      setLoading(false);
    }

    // setTimeout(() => {
    //   setInput('');
    //   setMessages(prev => ([...prev, { type: 'bot', message: 'Hi, How can i assist you today!' }]));
    //   setLoading(false);
    // }, 1000);
  };

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userRaw =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = userRaw ? JSON.parse(userRaw) : null;
    if (!token) return router.push("/login");

    const AuthUser = async () => {
      try {
        const response = await axios.post(apiUrl + "/auth/validate-user", {
          token: token,
          email: user?.email,
        });
        console.log("res.data in /auth: ", response?.data);
        if (!response?.data?.valid) {
          throw new Error("Token invalid");
        }
      } catch (error) {
        console.log(
          "Error in /auth: ",
          error?.response?.data || error?.message || error
        );
        const msg =
          JSON.stringify(error?.response?.data?.message) ||
          JSON.stringify(error?.response?.data) ||
          JSON.stringify(error?.message) ||
          JSON.stringify(error);
        message.error("You are not authenticated: " + msg);
        router.push("/login");
      }
    };

    const getModelData = async () => {
      try {
        // axiosClient already has baseURL set to apiUrl, so don't prefix it again
        const response = await axiosClient.get("/agents/model/" + id);
        console.log("res.data in /model: ", response?.data);
        const res = response?.data;
        // Store indexName without leading slash for the Python API route
        let index = res?.indexName || "bnba";
        // Remove leading slash if present
        index = index.startsWith("/") ? index.slice(1) : index;
        setIndexName(index);

        // Extract and store the agent's prompt from sessionSchema if available
        if (res?.sessionSchema) {
          try {
            const schema =
              typeof res.sessionSchema === "string"
                ? JSON.parse(res.sessionSchema)
                : res.sessionSchema;
            const instructions = schema?.session?.instructions;
            if (instructions) {
              setAgentPrompt(instructions);
            }
          } catch (e) {
            console.warn("Could not parse sessionSchema for prompt");
          }
        }

        // Show warning if using auto-generated model config
        if (res?._generated) {
          message.info(
            "Using auto-generated model configuration for this agent."
          );
        }
      } catch (error) {
        console.error(
          "Error in /model: ",
          error?.response?.data || error?.message || error
        );
        // If model not found (404), the backend should now auto-generate one
        // This catch is for other errors
        message.error("Failed to load chat model. Please try again.");
        setIndexName("bnba"); // Fallback default
      }
    };

    const asyncFunction = async () => {
      try {
        await Promise.all([AuthUser(), getModelData()]);
      } catch (error) {
        console.error(
          "Error in main(): ",
          error?.response?.data || error?.message || error
        );
      }
    };
    asyncFunction();
  }, [id, router]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages?.length]);

  return (
    <div>
      <div className="w-[90%] xs:w-[80%] lg:w-[52.5%] mx-auto text-[.95rem] xs:text-[1rem] -mt-16 mb-[1.5rem] md:text-[1.0625rem] text-center leading-relaxed">
        Applying LLM-driven sentiment analysis and trend forecasting, we help
        businesses identify customer needs, guiding product development and
        fostering innovation to stay competitive.
      </div>
<div
  className="
    chatbot
    w-full
    sm:w-[75%]
    md:w-[55%]
    lg:w-[45%]
    xl:w-[40%]
    2xl:w-[35%]
    max-w-[600px]      /* 🔥 narrower but not tiny */
    mx-auto
    rounded-[.875rem]
    overflow-hidden
  "
>

<div className="bg-[#A855F7] px-5 py-4 flex items-center justify-between">
  <div>
    <h3 className="text-white font-semibold text-[17px] leading-tight">
      {agentName || "K9 Coach AI"}
    </h3>
    <p className="text-white/90 text-[12px] mt-[4px]">
      Your personal pet expert
    </p>
  </div>

  <div className="flex items-center gap-4">
    <h3 className="text-white text-[15px] font-medium cursor-pointer">
    {agentLanguages || "English"}
    </h3>
  </div>
</div>


       <div className="body     bg-[#F8F8F8] 
  px-[0.5rem] py-[0.45rem]
  xs:px-[0.6rem] xs:py-[0.55rem]
  sm:px-[0.75rem] sm:py-[0.75rem]
  2md:px-[1.1rem] 2md:py-[1.1rem]
">

<div
  ref={chatContainerRef}
  className="
    bg-[#F8F8F8]
    min-h-[470px]
    max-h-[520px]
    px-4
    py-3
    overflow-y-auto
    flex
    flex-col
    justify-end
    gap-3
  "
>

  {messages.map((msg, i) => (
    <UserMessage
      key={i}
      type={msg.type}
      message={msg.message}
    />
  ))}
</div>

<div className="bg-white border-t px-4 py-3 flex items-center gap-3">
  {/* INPUT */}
  <input
    type="text"
    placeholder="Type your message..."
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
    className="flex-1 px-5 py-3 text-[14px] bg-[#F1F1F1] rounded-full outline-none"
  />

  {/* ACTION BUTTONS */}
  <div className="flex items-center gap-4">
    {/* Upload */}
    <div className="flex flex-col items-center text-[11px] text-gray-500">
      <button
        onClick={() => fileInputRef.current.click()}
        className="w-9 h-9 rounded-full bg-[#A855F7] flex items-center justify-center text-white mb-1"
      >
        <IoAttachSharp size={22} />
      </button>
    </div>

    {/* Mic */}
    <div className="flex flex-col items-center text-[11px] text-gray-500">
      <button
        className="w-9 h-9 rounded-full bg-[#A855F7] flex items-center justify-center text-white mb-1"
      >
        <IoMicOutline size={22} />
      </button>
    </div>

    {/* Send */}
    <div className="flex flex-col items-center text-[11px] text-gray-500">
      <button
        onClick={sendMessage}
        className="w-9 h-9 rounded-full bg-[#A855F7] flex items-center justify-center text-white mb-1"
      >
        <FiSend size={20} />
      </button>
    </div>
  </div>
</div>


        </div>
      </div>
    </div>
  );
};

const UserMessage = ({ type, message }) => {
  const isBot = type === "bot";

  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
      <div
        className={`
          max-w-[75%]
          px-4
          py-3
          text-[14px]
          leading-relaxed
          ${
            isBot
              ? "bg-[#F3B34D] text-[#1E1E1E] rounded-[14px] rounded-bl-none"
              : "bg-[#1F2937] text-white rounded-[14px] rounded-br-none"
          }
        `}
      >
        {message}
      </div>
    </div>
  );
};


export default Chat;
