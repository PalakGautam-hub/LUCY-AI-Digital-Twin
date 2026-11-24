"""
LUCY Backend — Command Service
Parses and identifies system commands from user input, like JARVIS's command interface.
"""
import re
from datetime import datetime

COMMAND_PATTERNS = {
    "set_mode": {
        "patterns": [
            r"(?:switch|change|set|go)\s+(?:to\s+)?(\w+)\s+mode",
            r"(?:activate|enable)\s+(\w+)\s+mode",
            r"mode\s+(\w+)",
        ],
        "description": "Switch operational mode",
    },
    "set_timer": {
        "patterns": [
            r"(?:set|start)\s+(?:a\s+)?timer\s+(?:for\s+)?(\d+)\s*(min|minute|minutes|hour|hours|sec|seconds)",
            r"(?:remind|alert)\s+me\s+in\s+(\d+)\s*(min|minute|minutes|hour|hours)",
        ],
        "description": "Set a countdown timer",
    },
    "status_report": {
        "patterns": [
            r"(?:give\s+me\s+a?\s*)?status\s*(?:report|update)?",
            r"(?:how|what)(?:'s|\s+is)\s+(?:my|the)\s+status",
            r"sitrep",
            r"what(?:'s|\s+is)\s+going\s+on",
        ],
        "description": "Request system status report",
    },
    "clear_memory": {
        "patterns": [
            r"(?:clear|reset|wipe|erase)\s+(?:my\s+)?(?:memory|history|chat)",
            r"forget\s+everything",
            r"start\s+fresh",
        ],
        "description": "Clear conversation memory",
    },
    "time_check": {
        "patterns": [
            r"what\s+time\s+is\s+it",
            r"what(?:'s|\s+is)\s+the\s+time",
            r"current\s+time",
        ],
        "description": "Check current time",
    },
    "greeting": {
        "patterns": [
            r"^(?:hey|hi|hello|yo|sup|good\s+(?:morning|afternoon|evening|night))(?:\s+lucy)?[!.\s]*$",
            r"^lucy[!.\s]*$",
            r"^(?:wake\s+up|you\s+(?:there|awake|up))\s*[?!.\s]*$",
        ],
        "description": "User greeting",
    },
}

VALID_MODES = {"companion", "focus", "career", "research", "debug"}


def parse_command(text: str) -> dict | None:
    """Parse user input for system commands. Returns command dict or None."""
    text_lower = text.strip().lower()

    for cmd_name, cmd_info in COMMAND_PATTERNS.items():
        for pattern in cmd_info["patterns"]:
            match = re.search(pattern, text_lower)
            if match:
                result = {
                    "command": cmd_name,
                    "description": cmd_info["description"],
                    "raw_text": text,
                }

                if cmd_name == "set_mode" and match.groups():
                    mode = match.group(1).lower()
                    if mode in VALID_MODES:
                        result["args"] = {"mode": mode}
                    else:
                        return None

                elif cmd_name == "set_timer" and match.groups():
                    amount = int(match.group(1))
                    unit = match.group(2).lower()
                    if "hour" in unit:
                        seconds = amount * 3600
                    elif "min" in unit:
                        seconds = amount * 60
                    else:
                        seconds = amount
                    result["args"] = {"seconds": seconds, "display": f"{amount} {unit}"}

                elif cmd_name == "time_check":
                    now = datetime.now()
                    result["args"] = {"time": now.strftime("%I:%M %p"), "date": now.strftime("%A, %B %d")}

                return result

    return None
