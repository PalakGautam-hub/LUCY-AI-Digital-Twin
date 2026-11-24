"use client";
import { useLucy } from "@/context/LucyContext";

const modes = [
  { id: "companion", label: "Companion", tag: "CMP" },
  { id: "focus", label: "Focus", tag: "FCS" },
  { id: "career", label: "Career", tag: "CAR" },
  { id: "research", label: "Research", tag: "RSH" },
  { id: "debug", label: "Debug", tag: "DBG" },
];

export default function ModeSelector() {
  const { mode, setMode, startSession, stopSession } = useLucy();

  function handleModeChange(newMode) {
    if (newMode === "focus" && mode !== "focus") {
      startSession();
    } else if (mode === "focus" && newMode !== "focus") {
      stopSession();
    }
    setMode(newMode);
  }

  return (
    <div className="mode-selector">
      {modes.map((m) => (
        <button
          key={m.id}
          className={`mode-btn ${mode === m.id ? "active" : ""}`}
          onClick={() => handleModeChange(m.id)}
        >
          <span className="mode-tag">{m.tag}</span> {m.label}
        </button>
      ))}
    </div>
  );
}
