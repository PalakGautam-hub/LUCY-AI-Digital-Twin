"use client";
import { useCallback, useRef } from "react";
import { useLucy } from "@/context/LucyContext";

export default function useSpeechSynthesis() {
  const { setVoiceState } = useLucy();
  const utteranceRef = useRef(null);

  const speak = useCallback((text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.volume = 0.9;

    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes("Samantha") ||
      v.name.includes("Google UK English Female") ||
      v.name.includes("Microsoft Zira") ||
      (v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
    ) || voices.find(v => v.lang.startsWith("en")) || voices[0];

    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setVoiceState("speaking");
    utterance.onend = () => setVoiceState("idle");
    utterance.onerror = () => setVoiceState("idle");

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [setVoiceState]);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setVoiceState("idle");
    }
  }, [setVoiceState]);

  return { speak, stop };
}
