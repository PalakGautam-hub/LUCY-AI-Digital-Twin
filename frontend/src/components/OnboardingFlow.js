"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLucy } from "@/context/LucyContext";

const QUESTIONS = [
  {
    id: "decision",
    label: "How do you make decisions?",
    options: [
      { value: "analytical", label: "Data & logic first" },
      { value: "intuitive", label: "Gut feeling" },
      { value: "collaborative", label: "I ask others" },
      { value: "quick", label: "Fast & decisive" },
    ],
  },
  {
    id: "failure",
    label: "How do you react to failure?",
    options: [
      { value: "analyze", label: "Analyze what went wrong" },
      { value: "move_on", label: "Move on quickly" },
      { value: "emotional", label: "Feel it deeply, then recover" },
      { value: "stubborn", label: "Try again immediately" },
    ],
  },
  {
    id: "motivation",
    label: "What motivates you most?",
    options: [
      { value: "achievement", label: "Achievement & goals" },
      { value: "curiosity", label: "Learning & curiosity" },
      { value: "impact", label: "Helping others" },
      { value: "recognition", label: "Recognition & growth" },
    ],
  },
  {
    id: "discipline",
    label: "Discipline vs flexibility?",
    options: [
      { value: "strict", label: "Strict routine" },
      { value: "flexible", label: "Go with the flow" },
      { value: "balanced", label: "Balanced mix" },
      { value: "structured_flex", label: "Structure with room to adapt" },
    ],
  },
  {
    id: "stress",
    label: "How do you handle stress?",
    options: [
      { value: "calm", label: "Stay calm & methodical" },
      { value: "active", label: "Channel into action" },
      { value: "retreat", label: "Need alone time" },
      { value: "talk", label: "Talk it through" },
    ],
  },
  {
    id: "learning",
    label: "How do you prefer to learn?",
    options: [
      { value: "hands_on", label: "Hands-on practice" },
      { value: "theory", label: "Theory first" },
      { value: "visual", label: "Visual / diagrams" },
      { value: "discussion", label: "Discussion & debate" },
    ],
  },
  {
    id: "communication",
    label: "Communication preference?",
    options: [
      { value: "direct", label: "Direct & brief" },
      { value: "detailed", label: "Detailed & thorough" },
      { value: "warm", label: "Warm & personal" },
      { value: "structured", label: "Structured & organized" },
    ],
  },
  {
    id: "energy",
    label: "When are you most productive?",
    options: [
      { value: "morning", label: "Early morning" },
      { value: "afternoon", label: "Afternoon" },
      { value: "evening", label: "Late evening" },
      { value: "varies", label: "Varies day to day" },
    ],
  },
];

function derivePersonality(answers) {
  let tone = "friendly";
  let behavior = "balanced";

  const { decision, failure, motivation, discipline, stress, communication } = answers;

  if (decision === "analytical" && communication === "direct") tone = "analytical";
  else if (communication === "warm" || motivation === "impact") tone = "friendly";
  else if (discipline === "strict" && failure === "stubborn") tone = "strict";
  else if (decision === "quick" && stress === "active") tone = "direct";

  if (motivation === "achievement" || discipline === "strict") behavior = "motivational";
  else if (stress === "calm" || failure === "analyze") behavior = "calm";
  else if (communication === "direct" || decision === "quick") behavior = "direct";
  else behavior = "supportive";

  return { tone, behavior, answers, derived_at: new Date().toISOString() };
}

export default function OnboardingFlow({ onComplete }) {
  const { savePersonality, saveUserName } = useLucy();
  const [phase, setPhase] = useState("intro");
  const [name, setName] = useState("");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  function handleIntroSubmit() {
    if (name.trim()) {
      saveUserName(name.trim());
    }
    setPhase("questions");
  }

  function selectOption(questionId, value) {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }

  function next() {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      const personality = derivePersonality(answers);
      savePersonality(personality);
      fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/personality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "default",
          ...personality,
          user_name: name.trim() || null,
        }),
      }).catch(() => {});
      onComplete?.();
    }
  }

  function prev() {
    if (step > 0) setStep(step - 1);
  }

  // ── INTRO PHASE ──
  if (phase === "intro") {
    return (
      <div className="onboarding-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: "center", marginBottom: 8 }}
        >
          <div className="onboarding-logo-ring">
            <div className="onboarding-logo-inner">L</div>
          </div>
          <h1 className="onboarding-title">L.U.C.Y.</h1>
          <p className="onboarding-subtitle">
            Linked Unified Cognitive Yielding System
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 8 }}>
            Your personal AI companion. Like JARVIS, but yours.
          </p>
        </motion.div>

        <motion.div
          className="onboarding-card glass-strong"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <label className="customizer-label" style={{ marginBottom: 12, display: "block" }}>
            What should I call you?
          </label>
          <input
            className="chat-input"
            style={{ width: "100%", marginBottom: 20 }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleIntroSubmit()}
          />

          <motion.button
            className="btn-primary"
            onClick={handleIntroSubmit}
            whileTap={{ scale: 0.95 }}
            style={{ width: "100%" }}
          >
            Initialize Lucy
          </motion.button>

          <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginTop: 16, textAlign: "center" }}>
            Next: a quick personality calibration so I can adapt to you.
          </p>
        </motion.div>
      </div>
    );
  }

  // ── QUESTIONS PHASE ──
  const q = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;
  const canProceed = answers[q.id];

  return (
    <div className="onboarding-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", marginBottom: 8 }}
      >
        <h1 className="onboarding-title" style={{ fontSize: "1.8rem" }}>
          PERSONALITY CALIBRATION
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          {name ? `${name}, let me learn` : "Let me learn"} how you think so I can be your perfect AI.
        </p>
      </motion.div>

      <motion.div className="onboarding-card glass-strong" layout>
        <div className="progress-bar-track">
          <motion.div
            className="progress-bar-fill"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: 16 }}>
          {step + 1} of {QUESTIONS.length}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="question-group"
          >
            <label>{q.label}</label>
            <div className="option-grid">
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  className={`option-btn ${answers[q.id] === opt.value ? "selected" : ""}`}
                  onClick={() => selectOption(q.id, opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <button
            className="btn-icon"
            onClick={prev}
            disabled={step === 0}
            style={{ opacity: step === 0 ? 0.3 : 1, fontSize: "0.9rem" }}
          >
            &larr;
          </button>
          <motion.button
            className="btn-primary"
            onClick={next}
            disabled={!canProceed}
            style={{ opacity: canProceed ? 1 : 0.4 }}
            whileTap={{ scale: 0.95 }}
          >
            {step === QUESTIONS.length - 1 ? "Activate Lucy" : "Next"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
