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

import { FaMicrophone } from "react-icons/fa";
import { FiImage } from "react-icons/fi";

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

        <div className="header bg-[#4A0082] py-[1rem] 2md:py-[1.175rem] px-[2.8rem]">
          <div className="text-[1.3rem] xl:text-[1.5625rem] font-bold">
            {(agentName || "Faisal Bank")?.toUpperCase()}
          </div>
        </div>
        <div className="body bg-white px-[.7rem] 3xs:px-[1rem] py-[1rem] sm:px-[2rem] sm:py-[1.5rem] 2md:px-[3.375rem] 2md:py-[2.5rem]">
<div
  ref={chatContainerRef}
  className="
    chat
    h-[52vh]          /* 🔥 height reduced */
    flex flex-col
    gap-[1.5rem]
    px-[.35rem]
    py-[1.1rem]
    3xs:px-[.5rem]
    3xs:py-[1.4rem]
    xs:py-[1.7rem]
    2md:px-[1.25rem]
    2md:py-[2.5rem]
    overflow-y-auto
    rounded-[1rem]
  "
>

            {/* <UserMessage />
              <UserMessage type='bot' /> */}
            {messages.map((msg, i) => (
              <UserMessage
                key={`msg-${i}-${msg.type}`}
                type={msg.type}
                message={msg.message}
              />
            ))}
          </div>
          <div className="bottom w-full flex flex-col items-center 3xs:items-stretch 3xs:flex-row gap-[.75rem] 3xs:gap-[.3rem] 2md:gap-[.5rem] mt-[1.3rem] xs:mt-[1.6rem] 3xl:mt-[2.1rem]">
            <input
              type="text"
              placeholder="Write message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={loading}
              className="w-full px-[1.375rem] py-[.5rem] 2md:py-[.6rem] bg-[#F7F7F7] text-[.9rem] 2md:text-[1rem] placeholder:text-[#595B62] text-[#595B62] rounded-[.5rem]"
            />
            <div className="flex gap-[.3rem] 2md:gap-[.5rem]">
              {/* IMAGE UPLOAD */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="
      icon
      w-[2.4rem] sm:w-[2.6rem] 2md:w-[3.125rem]
      aspect-square md:aspect-auto
      flex items-center justify-center
      bg-[#4A0082]
      rounded-[.5rem]
      cursor-pointer
      hover:opacity-90
    "
              >
                <FiImage className="text-white text-[1rem] 2md:text-[1.375rem]" />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageSelect}
              />

              {/* VOICE */}
              <div
                className="
      icon
      w-[2.4rem] sm:w-[2.6rem] 2md:w-[3.125rem]
      aspect-square md:aspect-auto
      flex items-center justify-center
      bg-[#4A0082]
      rounded-[.5rem]
      cursor-pointer
      hover:opacity-90
    "
              >
                <FaMicrophone className="text-white text-[1rem] 2md:text-[1.375rem]" />
              </div>

              {/* SEND */}
              <div
                onClick={sendMessage}
                className="
      icon
      w-[2.4rem] sm:w-[2.6rem] 2md:w-[3.125rem]
      aspect-square md:aspect-auto
      flex items-center justify-center
      bg-[#4A0082]
      rounded-[.5rem]
      cursor-pointer
      hover:opacity-90
    "
              >
                {loading ? (
                  <div className="loader-small"></div>
                ) : (
                  <BsSend className="text-white text-[1rem] 2md:text-[1.375rem]" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserMessage = ({ type, message }) => {
  return (
    <div className={`wrapper ${type !== "bot" ? "flex justify-end" : ""}`}>
      <div
        className={`user-message w-full sm:w-[90%] 2md:w-[85%] xl:w-[70%] flex gap-[.3rem] xs:gap-[.5rem] 2md:gap-[.8rem] xl:gap-[1.375rem] ${
          type !== "bot" ? "flex-row-reverse" : ""
        }`}
      >
        <div
          className={`logo w-[2.1rem] h-[2.1rem] xs:w-[2.5rem] xs:h-[2.5rem] 2md:w-[3.375rem] 2md:h-[3.375rem] flex items-center justify-center object-contain aspect-square ${
            type === "bot" ? "bg-[#4A0082]" : "bg-[#D9D9D9]"
          } rounded-[50%]`}
        >
          <img
            src={
              type === "bot" ? "/assets/Chat/bot.png" : "/assets/Chat/user.png"
            }
            className={`${
              type === "bot"
                ? "w-[1.7rem] h-[1.7rem] 2md:w-[2.4rem] 2md:h-[2.4rem]"
                : "w-full h-full"
            } object-contain rounded-[50%]`}
            alt=""
          />
        </div>
        <div
          className={`message min-w-[40%] flex flex-col gap-[.5rem] px-[.9rem] py-[.8rem] xs:px-[1.2rem] 2md:py-[1.375rem] 2md:px-[1.875rem] 2md:pb-[.9rem] ${
            type !== "bot" ? "bg-[#fff] text-[#202224]" : "bg-[#1E113B]"
          } rounded-[.75rem] rounded-bl-none`}
          style={{ boxShadow: "0px 4px 12.6px 0px rgba(0, 0, 0, 0.09)" }}
        >
          <div className="text-[.8rem] 2md:text-[.875rem] leading-normal xs:leading-relaxed">
            {message}
          </div>
          <div className="bottom flex items-center justify-end gap-[.7rem]">
            {type === "bot" && (
              <div className="icons flex items-center gap-[.4rem] py-[.25rem] px-[.3rem] bg-[#4A0082] rounded-[.5rem]">
                <img
                  src="/assets/Chat/copy.svg"
                  className="w-[.95rem] object-contain"
                  alt=""
                />
                <img
                  src="/assets/Chat/like.svg"
                  className="w-[.95rem] object-contain"
                  alt=""
                />
                <img
                  src="/assets/Chat/dislike.svg"
                  className="w-[.95rem] object-contain"
                  alt=""
                />
              </div>
            )}
            <div className="info flex items-center gap-[.45rem]">
              <div className="text-[.7rem] text-[#757575] leading-none">
                6.30 pm
              </div>
              <div className="icon">
                <img src="/assets/Chat/more.svg" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
