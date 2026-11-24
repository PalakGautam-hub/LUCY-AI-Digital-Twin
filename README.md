# L.U.C.Y. — AI Digital Twin v2.0

<p align="center">
  <strong>Linked Unified Cognitive Yielding System</strong><br/>
  A JARVIS/FRIDAY-class AI digital twin with customizable humanoid avatar, voice, vision, memory, emotion detection, and adaptive personality.
</p>

---

## What is LUCY?

LUCY is your personal AI companion — think Tony Stark's JARVIS but running on your machine. She speaks, listens, sees you through your camera, remembers your conversations, detects your emotions, responds to voice commands, and adapts her personality to match yours. She even has a fully customizable holographic humanoid avatar.

---

## Features

| Feature | Description |
|---------|-------------|
| **Humanoid Avatar** | Customizable holographic humanoid with hair, eyes, skin, outfit, and hologram color — game-style character creator |
| **JARVIS Personality** | Witty, intelligent, proactive AI with JARVIS/FRIDAY-class conversational ability |
| **Voice Interaction** | Full speech-to-text to AI to text-to-speech loop with Web Speech API |
| **AI Core** | Local LLM via Ollama (llama3.2) with structured prompt pipeline |
| **Computer Vision** | Real-time presence & focus detection via camera |
| **Emotion Detection** | Analyzes user text for emotional state and adapts responses accordingly |
| **Command System** | Natural language commands: mode switching, timers, status reports |
| **Personality System** | Onboarding quiz that calibrates LUCY's tone & behavior to you |
| **Memory** | MongoDB-backed conversation history, goals, and context retrieval |
| **5 Modes** | Companion, Focus, Career, Research, Debug |
| **Proactive Nudges** | Context-aware suggestions based on activity, time, and attention |
| **HUD Interface** | JARVIS-style holographic UI with system status, real-time telemetry |

---

## Architecture

```
Frontend (Next.js)  ──HTTP──►  Backend (FastAPI)  ──HTTP──►  Ollama (Local LLM)
     │                              │
     ├── Voice (Web Speech API)     ├── /chat (prompt builder → emotion → LLM)
     ├── Vision (Camera + CV)       ├── /memory (store/retrieve/search)
     ├── Humanoid Avatar (Canvas)   ├── /personality (profile + avatar config)
     ├── Avatar Customizer          ├── /session (tracking)
     ├── System Status HUD          ├── /status (system diagnostics)
     ├── Mode System (5 modes)      │
     └── Emotion Display            ├── Emotion Detection Service
                                    └── Command Parsing Service
```

---

## Quick Start

### Prerequisites

- **Node.js** >= 18
- **Python** >= 3.10
- **Ollama** — [Install Ollama](https://ollama.ai)
- **MongoDB** — [Install MongoDB](https://www.mongodb.com/try/download/community) or use MongoDB Atlas

### 1. Start Ollama

```bash
ollama serve
ollama pull llama3.2
```

### 2. Start MongoDB

```bash
mongod --dbpath /data/db
```

Or set `MONGODB_URI` in `.env` for a remote/Atlas connection.

### 3. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** — LUCY will greet you with the personality onboarding!

---

## Project Structure

```
LUCY-AI-Digital-Twin/
├── frontend/                        # Next.js app
│   ├── src/
│   │   ├── app/                     # Pages & layout
│   │   ├── components/
│   │   │   ├── HumanoidAvatar.js    # Canvas-based humanoid with holographic effects
│   │   │   ├── AvatarCustomizer.js  # Game-style character customization panel
│   │   │   ├── SystemStatus.js      # JARVIS HUD system status display
│   │   │   ├── ChatPanel.js         # Enhanced chat with emotion indicators
│   │   │   ├── VoiceControl.js      # Mic controls
│   │   │   ├── ModeSelector.js      # 5-mode selector (Companion/Focus/Career/Research/Debug)
│   │   │   ├── VisionMonitor.js     # Camera toggle & status
│   │   │   ├── OnboardingFlow.js    # Name input + personality questionnaire
│   │   │   ├── StatusIndicator.js   # AI state badge
│   │   │   ├── WaveformVisualizer.js
│   │   │   └── TypingEffect.js
│   │   ├── context/LucyContext.js   # Global state (avatar, emotion, voice, vision, etc.)
│   │   ├── hooks/                   # useSpeechRecognition, useSpeechSynthesis, useVision, useProactiveNudge
│   │   └── lib/api.js              # Backend API client
│   └── package.json
│
├── backend/                         # FastAPI server
│   ├── main.py                      # Entry point with all routers
│   ├── database.py                  # MongoDB async connection
│   ├── routers/
│   │   ├── chat.py                  # AI chat with emotion + command detection
│   │   ├── memory.py                # Memory store/retrieve
│   │   ├── personality.py           # Profile + avatar config storage
│   │   ├── session.py               # Session tracking
│   │   └── status.py                # System diagnostics endpoint
│   ├── services/
│   │   ├── ollama_service.py        # LLM communication
│   │   ├── prompt_builder.py        # JARVIS-class prompt construction
│   │   ├── memory_service.py        # Memory operations
│   │   ├── emotion_service.py       # Text emotion detection
│   │   └── command_service.py       # Natural language command parsing
│   ├── models/schemas.py            # Pydantic models
│   └── requirements.txt
│
└── README.md
```

---

## Avatar Customization

The game-style character creator lets you customize:

| Category | Options |
|----------|---------|
| **Gender** | Female, Male, Androgynous |
| **Body Type** | Slim, Athletic, Standard |
| **Skin Tone** | 7 presets including Holographic |
| **Hair Style** | Long, Short, Mohawk, Buzz, Ponytail, Bun |
| **Hair Color** | 10 colors including Cyan, Purple, Pink |
| **Eye Color** | 8 colors with holographic glow effects |
| **Outfit** | Tech Suit, Business, Casual, Military, Lab Coat |
| **Hologram Color** | 7 accent colors that affect the entire avatar glow |

The avatar animates in real-time: breathing idle, eye glow when listening, lip sync when speaking, eye movement when thinking, and emotion-based facial expressions.

---

## AI Modes

| Mode | Purpose |
|------|---------|
| **Companion** | Casual, warm conversation — your AI friend |
| **Focus** | Productivity shield — brief responses, attention monitoring, session timer |
| **Career** | Interview prep, resume feedback, career strategy |
| **Research** | Deep analysis, multi-angle exploration |
| **Debug** | Systematic problem-solving, step-by-step isolation |

---

## Open Source Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16, React 19, Framer Motion |
| Backend | FastAPI, Python 3.10+ |
| Database | MongoDB (via Motor async driver) |
| AI/LLM | Ollama (llama3.2 — runs 100% locally) |
| Voice | Web Speech API (browser-native) |
| Vision | Canvas pixel analysis (no external API) |
| Emotion | Keyword-based heuristic detection |
| Avatar | HTML5 Canvas 2D rendering |

Everything runs locally. No cloud AI APIs required. No data leaves your machine.

---

## License

MIT
