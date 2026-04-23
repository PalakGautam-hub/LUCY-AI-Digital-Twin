"use client";
import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const LucyContext = createContext(null);

export function LucyProvider({ children }) {
  // ── Core State ──
  const [voiceState, setVoiceState] = useState("idle"); // idle | listening | thinking | speaking
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState("companion"); // focus | companion | career
  const [personality, setPersonality] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(false);

  // ── Vision State ──
  const [visionStatus, setVisionStatus] = useState("absent"); // focused | distracted | absent
  const [visionEnabled, setVisionEnabled] = useState(false);

  // ── Session State ──
  const [sessionStart, setSessionStart] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const sessionInterval = useRef(null);

  // ── Nudge State ──
  const [nudge, setNudge] = useState(null);
  const lastActivityRef = useRef(Date.now());

  // Check localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("lucy_personality");
    if (saved) {
      try {
        setPersonality(JSON.parse(saved));
        setIsOnboarded(true);
      } catch { /* ignore */ }
    }
  }, []);

  // Session timer
  useEffect(() => {
    if (sessionStart) {
      sessionInterval.current = setInterval(() => {
        setSessionDuration(Math.floor((Date.now() - sessionStart) / 1000));
      }, 1000);
    }
    return () => clearInterval(sessionInterval.current);
  }, [sessionStart]);

  const startSession = useCallback(() => {
    setSessionStart(Date.now());
    setSessionDuration(0);
  }, []);

  const stopSession = useCallback(() => {
    setSessionStart(null);
    clearInterval(sessionInterval.current);
  }, []);

  // Add message
  const addMessage = useCallback((role, text) => {
    setMessages(prev => [...prev, { role, text, ts: Date.now() }]);
    lastActivityRef.current = Date.now();
  }, []);

  // Save personality
  const savePersonality = useCallback((p) => {
    setPersonality(p);
    setIsOnboarded(true);
    localStorage.setItem("lucy_personality", JSON.stringify(p));
  }, []);

  // Show nudge
  const showNudge = useCallback((text) => {
    setNudge(text);
    setTimeout(() => setNudge(null), 6000);
  }, []);

  const value = {
    voiceState, setVoiceState,
    messages, addMessage, setMessages,
    mode, setMode,
    personality, savePersonality,
    isOnboarded, setIsOnboarded,
    visionStatus, setVisionStatus,
    visionEnabled, setVisionEnabled,
    sessionStart, sessionDuration, startSession, stopSession,
    nudge, showNudge,
    lastActivityRef,
  };

  return <LucyContext.Provider value={value}>{children}</LucyContext.Provider>;
}

export function useLucy() {
  const ctx = useContext(LucyContext);
  if (!ctx) throw new Error("useLucy must be used within LucyProvider");
  return ctx;
}
