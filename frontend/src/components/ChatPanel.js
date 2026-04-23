"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLucy } from "@/context/LucyContext";
import { sendChat } from "@/lib/api";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";
import TypingEffect from "./TypingEffect";

export default function ChatPanel() {
  const {
    messages, addMessage, voiceState, setVoiceState,
    personality, mode, visionStatus, sessionDuration,
  } = useLucy();
  const { speak } = useSpeechSynthesis();
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [latestResponse, setLatestResponse] = useState(null);
  const messagesEndRef = useRef(null);
  const processedRef = useRef(new Set());

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Process new user messages (from voice or text)
  const processMessage = useCallback(async (userMsg) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setVoiceState("thinking");

    try {
      const memory = JSON.parse(localStorage.getItem("lucy_memory") || "[]");
      const result = await sendChat({
        message: userMsg,
        personality: personality || {},
        memory: memory.slice(-5),
        mode,
        visionStatus,
        sessionDuration,
      });
      const reply = result.response || result.reply || "I'm here.";
      addMessage("lucy", reply);
      setLatestResponse(reply);

      // Save to memory
      const updated = [...memory, { user: userMsg, lucy: reply, ts: Date.now() }].slice(-50);
      localStorage.setItem("lucy_memory", JSON.stringify(updated));

      // Speak the response
      speak(reply);
    } catch (err) {
      console.error("Chat error:", err);
      const fallback = "I'm having trouble connecting. Let me think about that...";
      addMessage("lucy", fallback);
      setVoiceState("idle");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, setVoiceState, personality, mode, visionStatus, sessionDuration, addMessage, speak]);

  // Watch for new user messages (from voice input)
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "user" && !processedRef.current.has(lastMsg.ts)) {
      processedRef.current.add(lastMsg.ts);
      processMessage(lastMsg.text);
    }
  }, [messages, processMessage]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    addMessage("user", input.trim());
    setInput("");
  }

  return (
    <motion.div
      className="chat-panel glass-strong"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.3 }}
    >
      <div className="chat-messages">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.ts + "-" + i}
              className={`chat-msg ${msg.role}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {msg.role === "lucy" && i === messages.length - 1 ? (
                <TypingEffect text={msg.text} speed={20} />
              ) : (
                msg.text
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isProcessing && (
          <motion.div
            className="chat-msg lucy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontStyle: "italic", color: "var(--text-muted)" }}
          >
            thinking...
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-row" onSubmit={handleSubmit}>
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "career" ? "Ask about interviews, resume, career..." : mode === "focus" ? "What are you working on?" : "Talk to Lucy..."}
          disabled={isProcessing}
        />
        <motion.button
          type="submit"
          className="btn-icon"
          disabled={isProcessing || !input.trim()}
          whileTap={{ scale: 0.9 }}
          style={{ opacity: input.trim() ? 1 : 0.4 }}
        >
          ↑
        </motion.button>
      </form>
    </motion.div>
  );
}
