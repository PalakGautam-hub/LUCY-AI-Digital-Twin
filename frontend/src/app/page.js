"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucyProvider, useLucy } from "@/context/LucyContext";
import Avatar from "@/components/Avatar";
import StatusIndicator from "@/components/StatusIndicator";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import ModeSelector from "@/components/ModeSelector";
import VoiceControl from "@/components/VoiceControl";
import VisionMonitor from "@/components/VisionMonitor";
import ChatPanel from "@/components/ChatPanel";
import OnboardingFlow from "@/components/OnboardingFlow";
import useProactiveNudge from "@/hooks/useProactiveNudge";

function LucyApp() {
  const {
    isOnboarded, setIsOnboarded, nudge,
    mode, sessionDuration, voiceState,
  } = useLucy();
  const [showOnboarding, setShowOnboarding] = useState(!isOnboarded);

  useProactiveNudge();

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  if (showOnboarding && !isOnboarded) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <>
      {/* ── Top Bar ── */}
      <motion.div
        className="top-bar"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="top-bar-logo">LUCY</div>
        <div className="top-bar-right">
          <VisionMonitor />
          {mode === "focus" && sessionDuration > 0 && (
            <div className="session-timer">⏱ {formatTime(sessionDuration)}</div>
          )}
          <StatusIndicator />
        </div>
      </motion.div>

      {/* ── Main Content ── */}
      <div className="lucy-app" style={{ paddingTop: 80 }}>
        {/* Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ModeSelector />
        </motion.div>

        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
          style={{ position: "relative" }}
        >
          <Avatar />
        </motion.div>

        {/* Waveform */}
        <WaveformVisualizer />

        {/* Voice Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <VoiceControl />
        </motion.div>

        {/* Mode Label */}
        <motion.p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {mode === "focus" ? "🎯 Focus Mode — Stay on track" :
           mode === "career" ? "🚀 Career Mode — Interview prep & guidance" :
           "💬 Companion Mode — I'm here for you"}
        </motion.p>
      </div>

      {/* ── Chat Panel ── */}
      <ChatPanel />

      {/* ── Nudge Toast ── */}
      <AnimatePresence>
        {nudge && (
          <motion.div
            className="nudge-toast glass"
            initial={{ opacity: 0, x: 50, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            ✨ {nudge}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Home() {
  return (
    <LucyProvider>
      <LucyApp />
    </LucyProvider>
  );
}
