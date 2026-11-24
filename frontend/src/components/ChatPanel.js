"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLucy } from "@/context/LucyContext";
import { sendChat } from "@/lib/api";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";
import TypingEffect from "./TypingEffect";

const FALLBACK_RESPONSES = [
  "I'm currently running in offline mode — my neural core isn't connected to the backend server. Start the FastAPI server on port 8000 and I'll be fully operational.",
  "Backend systems are offline. I can still listen and remember, but my AI responses need the server running. Launch it with: uvicorn main:app --reload --port 8000",
  "Neural link is down — I need my backend to generate intelligent responses. Everything else still works: voice, vision, and avatar are all browser-based.",
];

export default function ChatPanel({ isOpen, onToggle }) {
  const {
    messages, addMessage, voiceState, setVoiceState,
    personality, mode, setMode, visionStatus, sessionDuration,
    emotion, setEmotion, userName, startSession, stopSession,
  } = useLucy();
  const { speak } = useSpeechSynthesis();
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const messagesEndRef = useRef(null);
  const processedRef = useRef(new Set());
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        userName,
      });
      const reply = result.response || result.reply || "Systems online. How can I assist?";

      if (result.emotion) setEmotion(result.emotion);
      if (result.command) handleCommand(result.command);

      addMessage("lucy", reply);
      setIsOffline(false);

      const updated = [...memory, { user: userMsg, lucy: reply, ts: Date.now() }].slice(-50);
      localStorage.setItem("lucy_memory", JSON.stringify(updated));

      speak(reply);
    } catch (err) {
      const isBackendDown = err.message === "BACKEND_OFFLINE" || err.message.includes("fetch");
      setIsOffline(isBackendDown);

      const fallback = isBackendDown
        ? FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
        : "Neural link experiencing interference. Recalibrating...";
      addMessage("lucy", fallback);
      speak(fallback);
    } finally {
      setIsProcessing(false);
      setVoiceState("idle");
    }
  }, [isProcessing, setVoiceState, personality, mode, visionStatus, sessionDuration, addMessage, speak, setEmotion, userName]);

  function handleCommand(cmd) {
    if (!cmd) return;
    if (cmd.command === "set_mode" && cmd.args?.mode) {
      const newMode = cmd.args.mode;
      if (newMode === "focus" && mode !== "focus") startSession();
      else if (mode === "focus" && newMode !== "focus") stopSession();
      setMode(newMode);
    }
  }

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

  const modeHints = {
    companion: "Talk to Lucy...",
    focus: "Quick command or question...",
    career: "Interview prep, resume, career...",
    research: "What should we investigate?",
    debug: "Describe the issue...",
  };

  return (
    <>
      {/* Toggle button — always visible */}
      <motion.button
        className="chat-toggle-btn"
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ borderColor: isOpen ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.08)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {isOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </>
          )}
        </svg>
        {!isOpen && messages.length > 0 && (
          <span className="chat-toggle-badge">{messages.length}</span>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-panel"
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-left">
                <div className="chat-header-dot" style={{
                  background: isOffline ? "var(--accent-amber)" :
                    voiceState === "thinking" ? "var(--accent-purple)" :
                    voiceState === "speaking" ? "var(--accent-cyan)" :
                    "var(--accent-blue)"
                }} />
                <span className="chat-header-title">LUCY</span>
                <span className="chat-header-status">
                  {isOffline ? "OFFLINE" :
                   isProcessing ? "PROCESSING" :
                   voiceState === "speaking" ? "SPEAKING" : "ONLINE"}
                </span>
              </div>
              <div className="chat-header-right">
                <span className="chat-mode-pill">{(mode || "companion").toUpperCase()}</span>
              </div>
            </div>

            {/* Offline banner */}
            {isOffline && (
              <div className="chat-offline-banner">
                Backend offline — responses are limited. Start the server for full AI.
              </div>
            )}

            {/* Messages */}
            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="chat-empty">
                  <div className="chat-empty-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                  </div>
                  <p>Say something to Lucy — type or use voice.</p>
                </div>
              )}
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.ts + "-" + i}
                    className={`chat-msg ${msg.role}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="chat-msg-avatar">
                      {msg.role === "lucy" ? "L" : (userName?.[0] || "U").toUpperCase()}
                    </div>
                    <div className="chat-msg-content">
                      <span className="chat-msg-sender">
                        {msg.role === "lucy" ? "LUCY" : userName || "YOU"}
                      </span>
                      <div className="chat-msg-text">
                        {msg.role === "lucy" && i === messages.length - 1 ? (
                          <TypingEffect text={msg.text} speed={18} />
                        ) : (
                          msg.text
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isProcessing && (
                <motion.div
                  className="chat-msg lucy"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="chat-msg-avatar">L</div>
                  <div className="chat-msg-content">
                    <span className="chat-msg-sender">LUCY</span>
                    <div className="chat-msg-text">
                      <span className="thinking-dots">
                        <span /><span /><span />
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="chat-input-row" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={modeHints[mode] || "Talk to Lucy..."}
                disabled={isProcessing}
                autoComplete="off"
              />
              <motion.button
                type="submit"
                className="btn-send"
                disabled={isProcessing || !input.trim()}
                whileTap={{ scale: 0.9 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
