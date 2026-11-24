"use client";
import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const LucyContext = createContext(null);

const DEFAULT_AVATAR = {
  gender: "female",
  bodyType: "athletic",
  skinTone: "#c8a882",
  hairStyle: "long",
  hairColor: "#1a1a2e",
  eyeColor: "#00d4ff",
  outfitStyle: "tech",
  holoColor: "#00d4ff",
};

export function LucyProvider({ children }) {
  // ── Core State ──
  const [voiceState, setVoiceState] = useState("idle");
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState("companion");
  const [personality, setPersonality] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userName, setUserName] = useState("");

  // ── Avatar State ──
  const [avatarConfig, setAvatarConfigState] = useState(DEFAULT_AVATAR);

  // ── Emotion State ──
  const [emotion, setEmotion] = useState("neutral");

  // ── Vision State ──
  const [visionStatus, setVisionStatus] = useState("absent");
  const [visionEnabled, setVisionEnabled] = useState(false);

  // ── Session State ──
  const [sessionStart, setSessionStart] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const sessionInterval = useRef(null);

  // ── Nudge State ──
  const [nudge, setNudge] = useState(null);
  const lastActivityRef = useRef(Date.now());

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lucy_personality");
      if (saved) {
        const parsed = JSON.parse(saved);
        setPersonality(parsed);
        setIsOnboarded(true);
      }
    } catch { /* ignore */ }

    try {
      const avatarSaved = localStorage.getItem("lucy_avatar");
      if (avatarSaved) {
        setAvatarConfigState({ ...DEFAULT_AVATAR, ...JSON.parse(avatarSaved) });
      }
    } catch { /* ignore */ }

    try {
      const nameSaved = localStorage.getItem("lucy_user_name");
      if (nameSaved) setUserName(nameSaved);
    } catch { /* ignore */ }

    try {
      if (localStorage.getItem("lucy_vision_enabled") === "true") {
        setVisionEnabled(true);
      }
    } catch { /* ignore */ }
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

  const addMessage = useCallback((role, text) => {
    setMessages(prev => [...prev, { role, text, ts: Date.now() }]);
    lastActivityRef.current = Date.now();
  }, []);

  const savePersonality = useCallback((p) => {
    setPersonality(p);
    setIsOnboarded(true);
    localStorage.setItem("lucy_personality", JSON.stringify(p));
  }, []);

  const setAvatarConfig = useCallback((config) => {
    setAvatarConfigState(config);
    localStorage.setItem("lucy_avatar", JSON.stringify(config));
  }, []);

  const saveUserName = useCallback((name) => {
    setUserName(name);
    localStorage.setItem("lucy_user_name", name);
  }, []);

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
    userName, saveUserName,
    avatarConfig, setAvatarConfig,
    emotion, setEmotion,
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
