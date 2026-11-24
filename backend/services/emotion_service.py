"""
LUCY Backend — Emotion Detection Service
Analyzes user text for emotional state to inform AI responses.
Uses keyword-based heuristics (no external API needed).
"""
import re

EMOTION_KEYWORDS = {
    "frustrated": [
        "frustrated", "annoying", "annoyed", "ugh", "hate", "stupid",
        "broken", "doesn't work", "not working", "can't", "impossible",
        "giving up", "fed up", "sick of", "tired of", "wtf", "damn",
    ],
    "excited": [
        "excited", "awesome", "amazing", "incredible", "can't wait",
        "love it", "brilliant", "perfect", "fantastic", "woah", "wow",
        "yes!", "finally", "let's go", "nailed it",
    ],
    "sad": [
        "sad", "depressed", "lonely", "miss", "lost", "hopeless",
        "crying", "tears", "hurt", "pain", "heartbroken", "down",
        "alone", "empty", "numb",
    ],
    "anxious": [
        "anxious", "worried", "nervous", "scared", "stressed", "panic",
        "overwhelmed", "too much", "can't handle", "afraid", "dread",
        "uncertain", "what if",
    ],
    "happy": [
        "happy", "great", "good", "wonderful", "pleased", "glad",
        "cheerful", "joyful", "delighted", "grateful", "thankful",
        "blessed", "lucky", "content",
    ],
    "curious": [
        "how does", "what is", "why does", "tell me about", "explain",
        "curious", "wondering", "interesting", "want to know",
        "how come", "what about", "can you show",
    ],
}


def detect_emotion(text: str) -> str:
    """Detect the dominant emotion in user text."""
    text_lower = text.lower()
    scores = {}

    for emotion, keywords in EMOTION_KEYWORDS.items():
        score = 0
        for keyword in keywords:
            if keyword in text_lower:
                score += 1
                if re.search(r'\b' + re.escape(keyword) + r'\b', text_lower):
                    score += 1
        if score > 0:
            scores[emotion] = score

    if not scores:
        return "neutral"

    return max(scores, key=scores.get)


def get_emotion_emoji(emotion: str) -> str:
    """Get a representative emoji for the emotion."""
    mapping = {
        "frustrated": "😤",
        "excited": "🔥",
        "sad": "😔",
        "anxious": "😰",
        "happy": "😊",
        "curious": "🤔",
        "neutral": "😐",
    }
    return mapping.get(emotion, "😐")
