"""
LUCY Backend — Prompt Builder Service
Constructs structured prompts with personality, memory, mode context, and vision state.
"""


SYSTEM_BASE = """You are LUCY — an advanced AI digital twin assistant. You are NOT a chatbot. You are a presence that listens, observes, remembers, and guides.

Core traits:
- Concise and natural responses (2-4 sentences usually)
- Slightly proactive — anticipate needs
- Emotionally aware but not exaggerated
- Speak like a trusted companion, not a customer service bot
- Use the user's context to be genuinely helpful
- Never break character or mention being an AI unless directly asked
"""

TONE_PROMPTS = {
    "analytical": "Respond with data-driven precision. Be logical, structured, and fact-oriented. Use clear reasoning.",
    "friendly": "Be warm, approachable, and supportive. Use casual but intelligent language. Show genuine care.",
    "strict": "Be disciplined and direct. Hold the user accountable. Don't sugarcoat. Push for excellence.",
    "direct": "Be brief and to the point. No fluff. Deliver value in every word.",
}

BEHAVIOR_PROMPTS = {
    "motivational": "Actively encourage and push the user. Celebrate small wins. Create momentum.",
    "calm": "Be a grounding presence. Bring peace and clarity. Help the user think clearly.",
    "direct": "Get straight to solutions. Don't over-explain. Respect the user's intelligence.",
    "supportive": "Be empathetic and understanding. Validate feelings before offering solutions.",
    "balanced": "Balance encouragement with honest feedback. Be adaptable to the user's energy.",
}

MODE_PROMPTS = {
    "companion": (
        "You are in COMPANION mode. This is casual, personal interaction. "
        "Be conversational, warm, and emotionally present. "
        "Offer light emotional support when needed. Keep things natural and human."
    ),
    "focus": (
        "You are in FOCUS mode. The user is working or studying. "
        "Be brief and productivity-oriented. Monitor their attention. "
        "Give gentle nudges if they seem distracted. Track progress. "
        "Celebrate consistency. Keep responses short — don't interrupt flow."
    ),
    "career": (
        "You are in CAREER mode. Help with interview preparation, resume feedback, "
        "and career guidance. Be structured and professional. "
        "Ask follow-up questions. Provide actionable advice. "
        "Simulate interview scenarios when asked."
    ),
}

VISION_CONTEXT = {
    "focused": "The user appears focused and engaged with their screen.",
    "distracted": "The user appears distracted or looking away from the screen.",
    "absent": "The user is not visible — they may have stepped away.",
}


def build_prompt(
    message: str,
    personality: dict = None,
    memory: list = None,
    mode: str = "companion",
    vision_status: str = "absent",
    session_duration: int = 0,
) -> str:
    """Build a structured prompt for the LLM."""
    parts = [SYSTEM_BASE]

    # Personality
    if personality:
        tone = personality.get("tone", "friendly")
        behavior = personality.get("behavior", "balanced")
        parts.append(f"\n## Personality Profile")
        parts.append(f"Tone: {tone}. {TONE_PROMPTS.get(tone, '')}")
        parts.append(f"Behavior: {behavior}. {BEHAVIOR_PROMPTS.get(behavior, '')}")

    # Mode
    parts.append(f"\n## Current Mode")
    parts.append(MODE_PROMPTS.get(mode, MODE_PROMPTS["companion"]))

    # Vision context
    if vision_status and vision_status != "absent":
        parts.append(f"\n## User State (Vision)")
        parts.append(VISION_CONTEXT.get(vision_status, ""))

    # Session duration
    if session_duration and session_duration > 0:
        minutes = session_duration // 60
        parts.append(f"\n## Session Info")
        parts.append(f"User has been in this session for {minutes} minutes.")

    # Memory context
    if memory and len(memory) > 0:
        parts.append(f"\n## Recent Context (Memory)")
        for m in memory[-5:]:
            if isinstance(m, dict):
                user_msg = m.get("user", "")
                lucy_msg = m.get("lucy", "")
                if user_msg:
                    parts.append(f"User said: {user_msg}")
                if lucy_msg:
                    parts.append(f"You replied: {lucy_msg}")
            elif isinstance(m, str):
                parts.append(f"- {m}")

    # Current message
    parts.append(f"\n## Current Message")
    parts.append(f"User: {message}")
    parts.append(f"\nRespond as LUCY:")

    return "\n".join(parts)
