"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useLucy } from "@/context/LucyContext";

export default function WaveformVisualizer() {
  const { voiceState } = useLucy();
  const bars = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const isActive = voiceState === "listening" || voiceState === "speaking";

  return (
    <div className="waveform-container" style={{ opacity: isActive ? 1 : 0.2, transition: "opacity 0.3s" }}>
      {bars.map((i) => (
        <motion.div
          key={i}
          className="waveform-bar"
          animate={isActive ? {
            height: [4, 8 + Math.random() * 20, 4],
            opacity: [0.4, 0.9, 0.4],
          } : { height: 4, opacity: 0.2 }}
          transition={isActive ? {
            duration: 0.4 + Math.random() * 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.03,
            ease: "easeInOut",
          } : { duration: 0.3 }}
          style={{
            background: voiceState === "speaking"
              ? "var(--accent-cyan)"
              : "var(--accent-blue)",
          }}
        />
      ))}
    </div>
  );
}
