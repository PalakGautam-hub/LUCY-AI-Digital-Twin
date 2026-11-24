"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLucy } from "@/context/LucyContext";

export default function SystemStatus() {
  const { mode, voiceState, visionStatus, visionEnabled, sessionDuration, emotion } = useLucy();
  const [systemStatus, setSystemStatus] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API}/status`);
        if (res.ok) setSystemStatus(await res.json());
      } catch { /* ignore */ }
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  function formatSessionTime(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  const modeLabels = {
    companion: "COMPANION",
    focus: "FOCUS",
    career: "CAREER",
    research: "RESEARCH",
    debug: "DEBUG",
  };

  const stateColors = {
    idle: "var(--text-muted)",
    listening: "var(--accent-blue)",
    thinking: "var(--accent-purple)",
    speaking: "var(--accent-cyan)",
  };

  return (
    <motion.div
      className="system-status-panel"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="hud-block">
        <div className="hud-label">SYSTEM</div>
        <div className="hud-value" style={{ color: "var(--accent-cyan)" }}>
          {systemStatus?.system === "operational" ? "ONLINE" : "STANDBY"}
        </div>
      </div>

      <div className="hud-block">
        <div className="hud-label">TIME</div>
        <div className="hud-value hud-mono">
          {time.toLocaleTimeString("en-US", { hour12: false })}
        </div>
      </div>

      <div className="hud-block">
        <div className="hud-label">MODE</div>
        <div className="hud-value" style={{ color: "var(--accent-blue)" }}>
          {modeLabels[mode] || "COMPANION"}
        </div>
      </div>

      <div className="hud-block">
        <div className="hud-label">AI STATE</div>
        <div className="hud-value" style={{ color: stateColors[voiceState] }}>
          {voiceState.toUpperCase()}
        </div>
      </div>

      {emotion && emotion !== "neutral" && (
        <div className="hud-block">
          <div className="hud-label">EMOTION</div>
          <div className="hud-value" style={{ color: "var(--accent-purple)" }}>
            {emotion.toUpperCase()}
          </div>
        </div>
      )}

      {visionEnabled && (
        <div className="hud-block">
          <div className="hud-label">VISION</div>
          <div className="hud-value" style={{
            color: visionStatus === "focused" ? "var(--accent-cyan)" :
              visionStatus === "distracted" ? "var(--accent-amber)" : "var(--text-muted)"
          }}>
            {visionStatus.toUpperCase()}
          </div>
        </div>
      )}

      {sessionDuration > 0 && (
        <div className="hud-block">
          <div className="hud-label">SESSION</div>
          <div className="hud-value hud-mono">{formatSessionTime(sessionDuration)}</div>
        </div>
      )}

      {systemStatus && (
        <>
          <div className="hud-block">
            <div className="hud-label">LLM</div>
            <div className="hud-value" style={{
              color: systemStatus.ollama === "connected" ? "var(--accent-cyan)" : "var(--accent-amber)"
            }}>
              {systemStatus.ollama === "connected" ? "ACTIVE" : "OFFLINE"}
            </div>
          </div>
          <div className="hud-block">
            <div className="hud-label">MEMORY</div>
            <div className="hud-value hud-mono">{systemStatus.memory_entries || 0}</div>
          </div>
        </>
      )}
    </motion.div>
  );
}
