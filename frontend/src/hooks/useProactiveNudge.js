"use client";
import { useEffect, useRef } from "react";
import { useLucy } from "@/context/LucyContext";

export default function useProactiveNudge() {
  const { mode, visionStatus, showNudge, sessionDuration, lastActivityRef } = useLucy();
  const intervalRef = useRef(null);

  useEffect(() => {
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const inactiveSec = (Date.now() - lastActivityRef.current) / 1000;

      if (mode === "focus") {
        // Focus mode nudges
        if (visionStatus === "distracted" && inactiveSec > 30) {
          showNudge("You seem distracted. Let's refocus — you're doing great! 🎯");
        } else if (visionStatus === "absent" && inactiveSec > 120) {
          showNudge("You've been away for a bit. Ready to pick up where you left off?");
        } else if (inactiveSec > 300) {
          showNudge("You've been inactive for 5 minutes. Need a hand getting started?");
        } else if (sessionDuration > 0 && sessionDuration % 1800 < 3) {
          // Every 30 minutes
          const mins = Math.floor(sessionDuration / 60);
          showNudge(`${mins} minutes in! Consider a short break to recharge. 🧘`);
        }
      } else if (mode === "companion") {
        if (inactiveSec > 600) {
          showNudge("It's quiet here... want to chat? I'm always here. 💫");
        }
      } else if (mode === "career") {
        if (inactiveSec > 180) {
          showNudge("Ready for another practice question? Consistency is key! 🚀");
        }
      }
    }, 10000);

    return () => clearInterval(intervalRef.current);
  }, [mode, visionStatus, showNudge, sessionDuration, lastActivityRef]);
}
