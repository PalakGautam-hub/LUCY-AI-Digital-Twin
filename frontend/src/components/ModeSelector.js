"use client";
import { useLucy } from "@/context/LucyContext";

const modes = [
  { id: "companion", label: "Companion", icon: "💬" },
  { id: "focus", label: "Focus", icon: "🎯" },
  { id: "career", label: "Career", icon: "🚀" },
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
          {m.icon} {m.label}
        </button>
      ))}
    </div>
  );
}
