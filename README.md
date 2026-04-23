# LUCY — AI Digital Twin Assistant

<p align="center">
  <strong>A JARVIS-like AI digital twin with voice, vision, memory, and adaptive personality.</strong>
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎙️ **Voice Interaction** | Full speech-to-text → AI → text-to-speech loop |
| 🧠 **AI Core** | Local LLM via Ollama with structured prompt pipeline |
| 👁️ **Computer Vision** | Real-time presence & focus detection via camera |
| 🎭 **Personality System** | Onboarding quiz that shapes LUCY's tone & behavior |
| 💾 **Memory** | Conversation history, goals, habits stored & retrieved |
| 🎯 **Modes** | Focus (productivity), Companion (casual), Career (interview prep) |
| ⚡ **Proactive Nudges** | LUCY initiates interaction based on context |
| 🌌 **Futuristic UI** | Dark, neon-glowing, glassmorphism with particle avatar |

---

## 🏗️ Architecture

```
Frontend (Next.js)  ──HTTP──►  Backend (FastAPI)  ──HTTP──►  Ollama (Local LLM)
     │                              │
     ├── Voice (Web Speech API)     ├── /chat (prompt builder → LLM)
     ├── Vision (Camera + CV)       ├── /memory (store/retrieve)
     ├── Animated Avatar            ├── /personality (profile)
     └── Mode System                └── /session (tracking)
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **Ollama** — [Install Ollama](https://ollama.ai)

### 1. Start Ollama

```bash
ollama serve
ollama pull llama3.2
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** — LUCY will greet you with the personality onboarding!

---

## 📁 Project Structure

```
LUCY-AI-Digital-Twin/
├── frontend/                    # Next.js app
│   ├── src/
│   │   ├── app/                 # Pages & layout
│   │   ├── components/          # UI components
│   │   │   ├── Avatar.js        # Particle-based animated avatar
│   │   │   ├── ChatPanel.js     # Message display & input
│   │   │   ├── VoiceControl.js  # Mic controls
│   │   │   ├── ModeSelector.js  # Focus/Companion/Career
│   │   │   ├── VisionMonitor.js # Camera toggle & status
│   │   │   ├── OnboardingFlow.js# Personality questionnaire
│   │   │   ├── WaveformVisualizer.js
│   │   │   ├── StatusIndicator.js
│   │   │   └── TypingEffect.js
│   │   ├── context/             # React context (state)
│   │   ├── hooks/               # Custom hooks
│   │   └── lib/                 # API client
│   └── package.json
│
├── backend/                     # FastAPI server
│   ├── main.py                  # Entry point
│   ├── database.py              # SQLite models
│   ├── routers/                 # API endpoints
│   │   ├── chat.py
│   │   ├── memory.py
│   │   ├── personality.py
│   │   └── session.py
│   ├── services/                # Business logic
│   │   ├── ollama_service.py
│   │   ├── prompt_builder.py
│   │   └── memory_service.py
│   ├── models/
│   │   └── schemas.py
│   └── requirements.txt
│
└── README.md
```

---

## 🎨 UI Design

- **Dark minimal** with neon blue/purple accents
- **Glassmorphism** panels with backdrop blur
- **Particle-based avatar** that reacts to voice state
- **Waveform visualizer** for audio feedback
- **Smooth animations** via Framer Motion

---

## 🎭 Personality System

The onboarding asks 8 questions about:
- Decision making style
- Reaction to failure
- Motivation type
- Discipline vs flexibility
- Stress handling
- Learning preference
- Communication style
- Peak productivity time

This derives a **tone** (analytical/friendly/strict/direct) and **behavior** (motivational/calm/direct/supportive) that shapes all of LUCY's responses.

---

## 📝 License

MIT
