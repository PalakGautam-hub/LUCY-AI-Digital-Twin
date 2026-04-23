"use client";
import { useRef } from "react";
import { motion } from "framer-motion";
import { useLucy } from "@/context/LucyContext";
import useVision from "@/hooks/useVision";

export default function VisionMonitor() {
  const { visionStatus, visionEnabled, setVisionEnabled } = useLucy();
  const { startVision, stopVision } = useVision();
  const videoRef = useRef(null);

  const icons = {
    focused: "👁",
    distracted: "😵‍💫",
    absent: "🚫",
  };

  const labels = {
    focused: "Focused",
    distracted: "Distracted",
    absent: "Absent",
  };

  async function toggleVision() {
    if (visionEnabled) {
      stopVision();
      setVisionEnabled(false);
    } else {
      setVisionEnabled(true);
      // Small delay to let state update
      setTimeout(() => {
        if (videoRef.current) startVision(videoRef.current);
      }, 100);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button
        className="btn-icon"
        onClick={toggleVision}
        title={visionEnabled ? "Disable camera" : "Enable camera"}
        style={{ width: 32, height: 32, fontSize: "0.8rem" }}
      >
        {visionEnabled ? "📷" : "📷"}
      </button>
      {visionEnabled && (
        <motion.div
          className={`vision-indicator ${visionStatus}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {icons[visionStatus]} {labels[visionStatus]}
        </motion.div>
      )}
      {/* Hidden video element for camera feed */}
      <video
        ref={videoRef}
        style={{ display: "none" }}
        playsInline
        muted
      />
    </div>
  );
}
