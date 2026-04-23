"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useLucy } from "@/context/LucyContext";

export default function StatusIndicator() {
  const { voiceState } = useLucy();

  const labels = {
    idle: "Idle",
    listening: "Listening",
    thinking: "Thinking",
    speaking: "Speaking",
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={voiceState}
        className={`status-badge ${voiceState}`}
        initial={{ opacity: 0, y: -10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.9 }}
        transition={{ duration: 0.25 }}
      >
        <span className="dot" />
        {labels[voiceState]}
      </motion.div>
    </AnimatePresence>
  );
}
