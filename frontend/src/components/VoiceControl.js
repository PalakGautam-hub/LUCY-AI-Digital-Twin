"use client";
import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useLucy } from "@/context/LucyContext";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";

export default function VoiceControl({ onUserMessage }) {
  const { voiceState, setVoiceState } = useLucy();
  const { startListening, stopListening } = useSpeechRecognition();
  const { stop: stopSpeaking } = useSpeechSynthesis();
  const [continuousMode, setContinuousMode] = useState(false);

  function handleMicClick() {
    if (voiceState === "listening") {
      stopListening();
    } else if (voiceState === "speaking") {
      stopSpeaking();
    } else {
      startListening();
    }
  }

  function toggleContinuous() {
    setContinuousMode(!continuousMode);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <motion.button
        className={`btn-icon ${voiceState === "listening" ? "active" : ""}`}
        onClick={handleMicClick}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        title={voiceState === "listening" ? "Stop listening" : voiceState === "speaking" ? "Interrupt" : "Start listening"}
        style={{
          width: 48,
          height: 48,
          fontSize: "1.3rem",
          ...(voiceState === "listening" ? {
            boxShadow: "0 0 20px rgba(0,212,255,0.4)",
            borderColor: "rgba(0,212,255,0.5)",
          } : {}),
        }}
      >
        {voiceState === "listening" ? "⏹" : voiceState === "speaking" ? "✋" : "🎤"}
      </motion.button>

      <button
        className={`btn-icon ${continuousMode ? "active" : ""}`}
        onClick={toggleContinuous}
        title="Toggle continuous listening"
        style={{ width: 32, height: 32, fontSize: "0.75rem" }}
      >
        🔄
      </button>
    </div>
  );
}
