"use client";
import { apiUrl } from "@/config/config";
import useWebRTC from "@/hooks/useWebRTC";
import { axiosClient } from "@/utils/axiosClient";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { useRouter } from "next/navigation";
import { message } from "antd";

const StartPage = ({ searchParams }) => {
  const router = useRouter();

  const [start, setStart] = useState(false);
  const [pause, setPause] = useState(false);
  const [loading, setLoading] = useState(true);
  const [innerLoading, setInnerLoading] = useState(true);

  const startRef = useRef(false);

  const [modelData, setModelData] = useState({
    sessionSchema: "",
    apiEndpoint: "",
    voice: "",
    indexName: "",
  });

  const agent = searchParams.get("agent"); // Retrieve agent name
  const image = searchParams.get("image"); // Retrieve agent image
  const agentId = searchParams.get("agentId"); // Retrieve agent id
  console.log("agentId in /start: ", agentId);
  const languagesParam = searchParams.get("languages");
  const languages = languagesParam
    ? JSON.parse(decodeURIComponent(languagesParam))
    : [];

  const { startConversation, toggleMute, endConversation, isMuted } = useWebRTC(
    { ...modelData, setInnerLoading }
  );

  const handleStart = () => {
    setStart(true);
    setPause(false);
    // startConversation(); // start webrtc
    toggleMute(); // start webrtc
  };

  const handlePause = () => {
    setPause(!pause);
    toggleMute(); // pause or resume webrtc
  };

  const handleEnd = () => {
    setStart(false);
    endConversation(); // end webrtc
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    // console.log('user: ', user);
    if (!token) return router.push("/login");

    const AuthUser = async () => {
      try {
        const response = await axios.post(apiUrl + "/auth/validate-user", {
          token: token,
          email: user?.email,
        });
        console.log("res.data in /auth: ", response?.data);
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
        const response = await axiosClient.get("/agents/model/" + agentId);
        console.log("res.data in /model: ", response?.data);
        const res = response?.data;
        const indexName = res?.indexName ? `/${res?.indexName}` : "bnba";
        const sessionSchema =
          typeof res?.sessionSchema == "string"
            ? JSON.parse(res?.sessionSchema)
            : res?.sessionSchema;
        // console.log('sessionSchema: ', sessionSchema);
        response?.data?.sessionSchema &&
          setModelData({
            sessionSchema: sessionSchema,
            apiEndpoint: res?.apiEndpoint || "/python",
            voice: res?.voice || "ash", // Default to "ash" voice
            indexName: indexName,
          });
      } catch (error) {
        console.log(
          "Error in /model: ",
          error?.response?.data || error?.message || error
        );
        // If model not found, use default values
        if (error?.response?.status === 404) {
          message.warning('Model configuration not found. Using default settings for test call.');
          // Set default model data to allow test calls to proceed
          setModelData({
            sessionSchema: null, // Will use default from useWebRTC
            apiEndpoint: "/python",
            voice: "ash", // Use "ash" as default voice (more reliable)
            indexName: "/bnba",
          });
        }
      }
    };

    const asyncFunction = async () => {
      if (startRef.current) return; // if already run, do nothing
      startRef.current = true;
      try {
        await Promise.all([AuthUser(), getModelData()]);
        // await startConversation();
      } catch (error) {
        console.error(
          "Error in main(): ",
          error?.response?.data || error?.message || error
        );
      } finally {
        setLoading(false);
      }
    };

    asyncFunction();
  }, []);

  useEffect(() => {
    if (!loading && (modelData?.sessionSchema || modelData?.indexName)) {
      console.log("startConversation() start called!");
      startConversation();
    }
  }, [loading, modelData?.sessionSchema, modelData?.indexName]);
  // useEffect(() => {
  //     if (!loading) {
  //         console.log('startConversation() start called!');
  //       startConversation();
  //     }
  // }, [loading]);


  if (loading)
    return (
      <div className="wrapper w-full h-[75vh] flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );

  return (
    // <div className="start-page min-h-[75vh] flex flex-col gap-[6.75rem] items-center">
    <div className="start-page min-h-[82vh] flex flex-col gap-[3rem] xs:gap-[4.5rem] items-center justify-between">
      <div className="w-[90%] xs:w-[80%] lg:w-[52.5%] mx-auto text-[.95rem] xs:text-[1rem] md:text-[1.0625rem] text-center leading-relaxed">
        Applying LLM-driven sentiment analysis and trend forecasting, we help
        businesses identify customer needs, guiding product development and
        fostering innovation to stay competitive.
      </div>
      <div className="main-wave">
        {start && !pause ? (
          <img
            src="/assets/Start/wave.gif"
            loading="lazy"
            className="w-[27.5rem] mix-blend-screen"
            alt=""
          />
        ) : (
          <img
            src="/assets/Start/wave.png"
            loading="lazy"
            className="w-[27.5rem] mix-blend-screen"
            alt=""
          />
        )}
      </div>
      <div className="bottom w-[92.5%] pb-[1.5rem] flex flex-col md:flex-row items-center md:items-end justify-between gap-[1.5rem] md:gap-0">
        <div className="buttons flex flex-col gap-[1.3rem] text-[1.0625rem] leading-relaxed">
          {languages?.map((item, index) => (
            <div
              key={`lang-${index}-${item?.name || 'default'}`}
              className="button relative w-[13.9rem] aspect-[4.1] flex items-center justify-center gap-[.375rem] border-[1px] border-[rgba(255,255,255,0.30)] backdrop-blur-[40px] rounded-[.625rem]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(96, 92, 241, 0.10) 0%, rgba(160, 57, 252, 0.10) 100%)",
              }}
            >
              <div className="image">
                <img
                  src={item?.image || "/assets/Agents/urdu.png"}
                  loading="lazy"
                  className="w-[2.625rem]"
                  alt=""
                />
              </div>
              <div className="text">{item?.name || "Urdu"}</div>
              <div className="icon w-[1.375rem] h-[1.375rem] absolute right-[-.4rem] top-[-.4rem] flex items-center justify-center bg-[#108E2B] rounded-[50%]">
                <img src="/assets/Start/tick-icon.svg" alt="" />
              </div>
            </div>
          ))}
          <div
            className="button relative w-[13.9rem] aspect-[4.1] flex items-center justify-center gap-[.375rem] border-[1px] border-[rgba(255,255,255,0.30)] backdrop-blur-[40px] rounded-[.625rem]"
            style={{
              background:
                "linear-gradient(90deg, rgba(96, 92, 241, 0.10) 0%, rgba(160, 57, 252, 0.10) 100%)",
            }}
          >
            <div className="image">
              <img
                src={image || "/assets/Start/agent-icon.png"}
                loading="lazy"
                className="w-[2.625rem] rounded-[50%]"
                alt=""
              />
            </div>
            <div className="text">{agent || "Maya Willow"}</div>
            <div className="icon w-[1.375rem] h-[1.375rem] absolute right-[-.4rem] top-[-.4rem] flex items-center justify-center bg-[#108E2B] rounded-[50%]">
              <img src="/assets/Start/tick-icon.svg" alt="" />
            </div>
          </div>
        </div>
        {innerLoading ? (
          <div className="wrapper max-w-[9rem] w-[40%] flex items-center justify-center">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="middle">
            {/* {start ? <div className="button" onClick={() => setPause(prev => !prev)}> */}
            {start ? (
              <div className="button" onClick={handlePause}>
                {pause ? (
                  <img
                    src="/assets/Start/mic-2.svg"
                    loading="lazy"
                    className="w-[9rem]"
                    alt=""
                  />
                ) : (
                  <img
                    src="/assets/Start/mic.svg"
                    loading="lazy"
                    className="w-[9rem]"
                    alt=""
                  />
                )}
              </div>
            ) : (
              <div
                onClick={handleStart}
                className="button w-fit lg:w-[20rem] h-[3.375rem] px-[2.5rem] flex items-center justify-center gap-[.6rem] bg-[#EF0B64] rounded-[.625rem] text-[1.125rem] font-medium"
              >
                <img
                  src="/assets/Start/mic-icon2.svg"
                  loading="lazy"
                  className="h-[1.4rem]"
                  alt=""
                />
                Get Started
              </div>
            )}
          </div>
        )}
        <div
          className="button w-[13.3rem] aspect-[3.94] flex items-center justify-center bg-[#EF0B64] rounded-[.625rem] text-[1.125rem] font-medium"
          onClick={handleEnd}
        >
          End Session
        </div>
      </div>
    </div>
  );
};

export default StartPage;
