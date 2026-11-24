"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucyProvider, useLucy } from "@/context/LucyContext";
import HumanoidAvatar from "@/components/HumanoidAvatar";
import AvatarCustomizer from "@/components/AvatarCustomizer";
import SystemStatus from "@/components/SystemStatus";
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
    isOnboarded, nudge, userName,
    mode, sessionDuration, voiceState, visionEnabled, emotion,
  } = useLucy();
  const [showOnboarding, setShowOnboarding] = useState(!isOnboarded);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [showUserVideo, setShowUserVideo] = useState(false);
  const userVideoRef = useRef(null);

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
    <div className="lucy-app">
      {/* ── Top Bar ── */}
      <motion.header
        className="top-bar"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="top-bar-left">
          <div className="top-bar-logo">
            <span className="logo-text">LUCY</span>
            <span className="logo-version">v2.0</span>
          </div>
          {userName && <span className="top-bar-user">{userName}</span>}
        </div>
        <div className="top-bar-right">
          <VisionMonitor externalVideoRef={userVideoRef} />
          {mode === "focus" && sessionDuration > 0 && (
            <div className="session-timer">{formatTime(sessionDuration)}</div>
          )}
          <StatusIndicator />
        </div>
      </motion.header>

      {/* ── HUD Left: System Status (desktop only) ── */}
      <div className="hud-left">
        <SystemStatus />
      </div>

      {/* ── Main Stage ── */}
      <main className="main-stage">
        {/* Mode Selector */}
        <motion.div
          className="stage-modes"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <ModeSelector />
        </motion.div>

        {/* Avatar Hero */}
        <motion.div
          className="avatar-hero"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 80 }}
        >
          <HumanoidAvatar />

          {/* Avatar controls floating below */}
          <div className="avatar-controls">
            <motion.button
              className="avatar-action-btn"
              onClick={() => setShowCustomizer(!showCustomizer)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              <span>CUSTOMIZE</span>
            </motion.button>

            {visionEnabled && (
              <motion.button
                className="avatar-action-btn"
                onClick={() => setShowUserVideo(!showUserVideo)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <span>{showUserVideo ? "HIDE FEED" : "SHOW FEED"}</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* User Video Feed */}
        <AnimatePresence>
          {visionEnabled && showUserVideo && (
            <motion.div
              className="user-video-container"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <video
                ref={userVideoRef}
                style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", borderRadius: "50%" }}
                playsInline muted autoPlay
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Waveform & Voice */}
        <motion.div
          className="stage-voice"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <WaveformVisualizer />
          <VoiceControl />
        </motion.div>

        {/* Mode Label */}
        <motion.p
          className="mode-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {mode === "focus" ? "FOCUS MODE — Productivity shield active" :
           mode === "career" ? "CAREER MODE — Interview prep & guidance" :
           mode === "research" ? "RESEARCH MODE — Deep analysis active" :
           mode === "debug" ? "DEBUG MODE — Systematic problem-solving" :
           "COMPANION MODE — Your AI is listening"}
        </motion.p>
      </main>

      {/* ── Customizer Drawer ── */}
      <AnimatePresence>
        {showCustomizer && (
          <div className="customizer-overlay">
            <AvatarCustomizer onClose={() => setShowCustomizer(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* ── Chat Panel (right side) ── */}
      <ChatPanel isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />

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
            {nudge}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <LucyProvider>
      <LucyApp />
    </LucyProvider>
  );
}
