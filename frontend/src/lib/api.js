const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "Unknown error");
      throw new Error(`API ${path}: ${res.status} - ${err}`);
    }
    return res.json();
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error("BACKEND_OFFLINE");
    }
    throw err;
  }
}

export async function sendChat({ message, personality, memory, mode, visionStatus, sessionDuration, userName }) {
  return request("/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      personality,
      memory,
      mode,
      vision_status: visionStatus,
      session_duration: sessionDuration,
      user_name: userName,
    }),
  });
}

export async function saveMemory(data) {
  return request("/memory", { method: "POST", body: JSON.stringify(data) });
}

export async function getMemory(userId = "default") {
  return request(`/memory?user_id=${userId}`);
}

export async function savePersonality(data) {
  return request("/personality", { method: "POST", body: JSON.stringify(data) });
}

export async function getPersonality(userId = "default") {
  return request(`/personality?user_id=${userId}`);
}

export async function saveSession(data) {
  return request("/session", { method: "POST", body: JSON.stringify(data) });
}

export async function getSession(userId = "default") {
  return request(`/session?user_id=${userId}`);
}

export async function getSystemStatus() {
  return request("/status");
}
