"use client";
import { useCallback, useRef, useEffect } from "react";
import { useLucy } from "@/context/LucyContext";

export default function useSpeechSynthesis() {
  const { setVoiceState } = useLucy();
  const utteranceRef = useRef(null);
  const voicesLoadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const loadVoices = () => { voicesLoadedRef.current = true; };
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    if (window.speechSynthesis.getVoices().length > 0) voicesLoadedRef.current = true;
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const speak = useCallback((text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.volume = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes("Samantha") ||
      v.name.includes("Google UK English Female") ||
      v.name.includes("Microsoft Zira") ||
      v.name.includes("Microsoft Jenny") ||
      (v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
    ) || voices.find(v => v.lang.startsWith("en")) || voices[0];

    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setVoiceState("speaking");
    utterance.onend = () => setVoiceState("idle");
    utterance.onerror = (e) => {
      if (e.error !== "canceled") setVoiceState("idle");
    };

    utteranceRef.current = utterance;

    // iOS Safari workaround: resume if paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);

    // Chrome bug workaround: long texts pause after ~15s
    const watchdog = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(watchdog);
        return;
      }
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 10000);

    utterance.onend = () => {
      clearInterval(watchdog);
      setVoiceState("idle");
    };
    utterance.onerror = (e) => {
      clearInterval(watchdog);
      if (e.error !== "canceled") setVoiceState("idle");
    };
  }, [setVoiceState]);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setVoiceState("idle");
    }
  }, [setVoiceState]);

  return { speak, stop };
}
