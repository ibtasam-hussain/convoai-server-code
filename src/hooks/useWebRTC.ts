"use client";  // Ensure this is a client component

import { pythonUrl } from "@/config/config";
import { useState, useEffect, useRef, useCallback } from "react";

const API_URL = pythonUrl;
const REALTIME_API = "https://api.openai.com/v1/realtime";
const MODEL = "gpt-4o-mini-realtime-preview-2024-12-17";

interface UseWebRTCProps {
  sessionSchema?: any;
  apiEndpoint?: string;
  indexName?: string;
  voice?: string;
  setInnerLoading: any;
}

export default function useWebRTC({ sessionSchema, apiEndpoint, indexName, voice, setInnerLoading }: UseWebRTCProps) {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [ephemeralKey, setEphemeralKey] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup on unmount:
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (dataChannelRef.current) {
        dataChannelRef.current.close();
        dataChannelRef.current = null;
      }
      setMicStream(null);
      setEphemeralKey(null);
      setIsMuted(true);
    };
  }, []);

  /**
   * Send initial session update to the AI with instructions, available tools, etc.
   */
  const sendSessionUpdate = useCallback(
    (dataChannel: RTCDataChannel) => {
      // Default fallback schema - should rarely be used as backend now generates from agent's prompt
      const defaultSessionSchema = {
        type: "session.update",
        session: {
          modalities: ["audio", "text"],
          tool_choice: "auto",
          instructions: `
            You are a helpful AI assistant. Answer questions helpfully and concisely, keeping responses under 60 words.
            
            When you need more information to answer a question:
              - Use the 'retrieve_context' tool to search the knowledge base for relevant information.
              - Transform vague queries into specific ones before searching.
              - Always provide accurate information based on retrieved context.
            
            If you cannot find the information needed, politely ask for more details or offer to escalate the request.
            
            Your goal is to provide fast, accurate, and helpful support while maintaining a friendly conversational tone.
          `,
          tools: [
            {
              type: "function",
              name: "retrieve_context",
              description: "Retrieve relevant information from the knowledge base.",
              parameters: {
                type: "object",
                properties: {
                  query: { type: "string", description: "The search query to find relevant information" },
                },
                required: ["query"],
              },
            },
          ],
        },
      };

      const sessionUpdate = sessionSchema || defaultSessionSchema;
      console.log("📤 Sending session update:", sessionUpdate);
      
      // Debug: Check if retrieve_context tool is present
      const tools = sessionUpdate?.session?.tools || [];
      const hasRetrieveTool = tools.some(tool => tool.name === 'retrieve_context');
      const instructions = sessionUpdate?.session?.instructions || '';
      const mentionsRetrieve = instructions.toLowerCase().includes('retrieve_context');
      
      console.log("🔍 Tool Check:", {
        hasRetrieveTool,
        mentionsRetrieve,
        toolCount: tools.length,
        toolNames: tools.map(t => t.name)
      });
      
      if (!hasRetrieveTool) {
        console.warn("⚠️ WARNING: retrieve_context tool is missing from sessionSchema!");
      }
      if (!mentionsRetrieve) {
        console.warn("⚠️ WARNING: Instructions don't mention retrieve_context!");
      }
      
      dataChannel.send(JSON.stringify(sessionUpdate));
    },
    [sessionSchema]
  );

  /**
   * Ensure we only start a conversation if there is no existing open PeerConnection.
   */
  const startConversation = useCallback(async () => {
    console.log("🎤 Starting WebRTC conversation...");

    if (
      peerConnectionRef.current &&
      peerConnectionRef.current.signalingState !== "closed"
    ) {
      console.warn("⚠️ A conversation is already in progress. Ignoring repeated start call.");
      return;
    }

    try {
      // 1. Retrieve ephemeral key from your Python backend.
      let attempts = 0;
      let data: any;

      while (attempts < 3) {
        try {
          const voiceParam = voice || "ash";
          let baseUrl = API_URL;
          baseUrl = baseUrl.replace(/\/$/, '');
          if (!baseUrl.endsWith('/python')) {
            if (!baseUrl.includes('/python')) {
              baseUrl = `${baseUrl}/python`;
            }
          }
          const sessionUrl = `${baseUrl}/session/${voiceParam}`;
          console.log(`🔄 Fetching session from: ${sessionUrl}`);
          console.log(`🔍 API_URL: ${API_URL}, baseUrl: ${baseUrl}, voice: ${voiceParam}`);
          
          const response = await fetch(sessionUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            let errorText = '';
            try {
              errorText = await response.text();
            } catch (e) {
              errorText = 'Could not read error response';
            }
            console.error(`❌ HTTP ${response.status} Error from ${sessionUrl}:`, errorText);
            
            if (response.status === 404) {
              throw new Error(`Python server not found at ${sessionUrl}. Please ensure the Python FastAPI server is running on port 8000.`);
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText.substring(0, 200)}`);
          }
          
          data = await response.json();
          console.log(`✅ Session response received:`, data);

          if (data?.client_secret?.value) {
            console.log(`✅ Client secret found, proceeding with WebRTC setup`);
            break;
          } else {
            console.error(`❌ Response missing client_secret.value:`, data);
            throw new Error("Response missing client_secret.value. Full response: " + JSON.stringify(data).substring(0, 200));
          }
        } catch (fetchError: any) {
          console.error(`❌ Session fetch attempt ${attempts + 1} failed:`, fetchError);
          attempts++;
          if (attempts < 3) {
            console.warn(`⚠️ Attempt ${attempts} failed. Retrying in 1 second...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            const errorMsg = fetchError.message || 'Unknown error';
            throw new Error(`Failed to get session after ${attempts} attempts. ${errorMsg}. Please check that the Python server is running on port 8000.`);
          }
        }
      }

      if (!data?.client_secret) {
        throw new Error("❌ Invalid session response (no client_secret found).");
      }

      const keyValue = data.client_secret.value;
      setEphemeralKey(keyValue);

      // 2. Create PeerConnection and attach event handlers.
      const pc = new RTCPeerConnection();
      pc.ontrack = (event) => {
        console.log("🎵 Received AI audio!");
        const audioElement = new Audio();
        audioElement.srcObject = event.streams[0];
        audioElement.autoplay = true;
      };

      peerConnectionRef.current = pc;

      // 3. Create data channel for exchanging messages (AI events, context, etc.).
      const dc = pc.createDataChannel("oai-events");
      dc.onopen = () => {
        console.log("✅ Data channel open, sending session update...");
        sendSessionUpdate(dc);
      };
      dc.onmessage = (e) => {
        handleAIMessage(e.data, dc);
      };

      dataChannelRef.current = dc;

      // 4. Get user's microphone stream and add tracks to the PeerConnection.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const [micTrack] = stream.getAudioTracks();
      micTrack.enabled = !isMuted;
      pc.addTransceiver(micTrack, { direction: "sendrecv" });
      
      setMicStream(stream);

      // 5. Create the SDP Offer, set local description.
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      setInnerLoading(false);

      // 6. Send offer SDP to OpenAI Realtime, get the answer back.
      const sdpResponse = await fetch(`${REALTIME_API}?model=${MODEL}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${keyValue}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });

      // 7. Parse the Answer SDP and set remote description.
      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      console.log("✅ WebRTC setup complete!");
    } catch (error) {
      console.error("🚨 WebRTC setup failed:", error);
    }
  }, [API_URL, isMuted, sessionSchema, sendSessionUpdate, setInnerLoading, voice]);

  /**
   * Toggle microphone mute state on or off.
   */
  const toggleMute = useCallback(() => {
    if (!micStream) {
      console.warn("⚠️ No microphone stream available to toggle mute.");
      return;
    }

    setIsMuted((prevMuted) => {
      const newMuteState = !prevMuted;
      micStream.getAudioTracks().forEach((track) => (track.enabled = !newMuteState));
      console.log(`${newMuteState ? "🔇 Muting" : "🎤 Unmuting"} microphone`);
      return newMuteState;
    });
  }, [micStream]);

  /**
   * Cleanly end the conversation, close data channel/peer connection, and reset state.
   */
  const endConversation = useCallback(() => {
    console.log("🛑 Ending conversation...");

    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
      console.log("✅ Data channel closed.");
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      console.log("✅ RTCPeerConnection closed.");
    }

    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop());
    }

    setMicStream(null);
    setEphemeralKey(null);
    setIsMuted(true);

    console.log("✅ Conversation ended and state reset.");
  }, [micStream]);

  /**
   * Handle messages received from the AI via the data channel (function calls, final text, etc.).
   */
  const handleAIMessage = useCallback(
    async (rawMessage: string, dataChannel: RTCDataChannel) => {
      try {
        const serverEvent = JSON.parse(rawMessage);
        console.log("📩 MODEL EVENT:", serverEvent);

        if (serverEvent.type === "response.done") {
          const firstOutput = serverEvent?.response?.output?.[0];
          if (firstOutput?.type === "function_call" && firstOutput?.name === "retrieve_context") {
            console.log(`🛠 Tool 'retrieve_context' invoked with args: ${JSON.stringify(firstOutput.arguments)}`);
            const query = JSON.parse(firstOutput.arguments).query;
            const callId = firstOutput.call_id;

            try {
              const indexNameClean = indexName?.replace(/^\//, '') || 'bnba';
              let baseUrl = API_URL.replace(/\/$/, '');
              if (!baseUrl.endsWith('/python')) {
                if (!baseUrl.includes('/python')) {
                  baseUrl = `${baseUrl}/python`;
                }
              }
              const queryEndpoint = `${baseUrl}/retrieve/${indexNameClean}?query=${encodeURIComponent(query)}`;
              console.log(`🔍 Retrieving context from: ${queryEndpoint}`);
              const res = await fetch(queryEndpoint);
              if (!res.ok) {
                throw new Error(`Retrieve failed: ${res.status} ${res.statusText}`);
              }
              const resultData = await res.json();
              const docs = resultData.retrieved_docs || "No relevant documents found.";

              console.log("📖 Retrieved Docs Sent to AI:", docs);

              dataChannel.send(
                JSON.stringify({
                  type: "conversation.item.create",
                  item: {
                    type: "function_call_output",
                    call_id: callId,
                    output: JSON.stringify({ context: docs }),
                  },
                })
              );

              console.log("📤 Requesting AI to generate final response...");
              dataChannel.send(JSON.stringify({ type: "response.create" }));
            } catch (error) {
              console.error("🚨 Failed to retrieve context:", error);
            }
          }
        } else if (serverEvent.type === "conversation.item.create") {
          if (serverEvent?.item?.type === "text") {
            console.log("🗣 AI's Final Response:", serverEvent.item.text);
          }
        }
      } catch (parseError) {
        console.error("🚨 Failed to parse AI message:", parseError, rawMessage);
      }
    },
    [API_URL, indexName]
  );

  return {
    startConversation,
    toggleMute,
    endConversation,
    isMuted,
  };
}
