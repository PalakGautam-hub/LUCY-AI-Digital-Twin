"use client";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useLucy } from "@/context/LucyContext";
import useVision from "@/hooks/useVision";

export default function VisionMonitor({ externalVideoRef }) {
  const { visionStatus, visionEnabled, setVisionEnabled } = useLucy();
  const { startVision, stopVision } = useVision();
  const localVideoRef = useRef(null);
  const videoRef = externalVideoRef || localVideoRef;

  useEffect(() => {
    if (visionEnabled && videoRef.current) {
      startVision(videoRef.current);
    }
  }, [visionEnabled, startVision, videoRef]);

  async function toggleVision() {
    if (visionEnabled) {
      stopVision();
      setVisionEnabled(false);
      localStorage.setItem("lucy_vision_enabled", "false");
    } else {
      setVisionEnabled(true);
      localStorage.setItem("lucy_vision_enabled", "true");
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button
        className="btn-icon"
        onClick={toggleVision}
        title={visionEnabled ? "Disable vision" : "Enable vision"}
        style={{
          width: 28, height: 28, fontSize: "0.65rem",
          color: visionEnabled ? "var(--accent-cyan)" : "var(--text-muted)",
          borderColor: visionEnabled ? "rgba(6, 255, 208, 0.2)" : undefined,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>
      {visionEnabled && (
        <motion.div
          className={`vision-indicator ${visionStatus}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {visionStatus.toUpperCase()}
        </motion.div>
      )}
    </div>
  );
}
