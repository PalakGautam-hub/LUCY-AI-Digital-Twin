"use client";
import { useRef, useCallback, useEffect } from "react";
import { useLucy } from "@/context/LucyContext";

export default function useSpeechRecognition() {
  const { setVoiceState, addMessage } = useLucy();
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

  const initRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    return recognition;
  }, []);

  const startListening = useCallback(() => {
    if (isListeningRef.current) return;
    const recognition = initRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    isListeningRef.current = true;

    let finalTranscript = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
    };

    recognition.onspeechstart = () => setVoiceState("listening");

    recognition.onend = () => {
      isListeningRef.current = false;
      if (finalTranscript.trim()) {
        addMessage("user", finalTranscript.trim());
        setVoiceState("thinking");
      } else {
        setVoiceState("idle");
      }
      finalTranscript = "";
    };

    recognition.onerror = (e) => {
      console.warn("Speech recognition error:", e.error);
      isListeningRef.current = false;
      setVoiceState("idle");
    };

    recognition.start();
    setVoiceState("listening");
  }, [initRecognition, setVoiceState, addMessage]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      isListeningRef.current = false;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return { startListening, stopListening, isListening: isListeningRef.current };
}
