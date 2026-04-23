"use client";
import { useState, useEffect, useRef } from "react";

export default function TypingEffect({ text, speed = 25, onComplete }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const prevTextRef = useRef("");

  useEffect(() => {
    if (text === prevTextRef.current) return;
    prevTextRef.current = text;
    indexRef.current = 0;
    setDisplayed("");

    const interval = setInterval(() => {
      indexRef.current++;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        clearInterval(interval);
        onComplete?.();
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span style={{
          display: "inline-block",
          width: 2,
          height: "1em",
          background: "var(--accent-blue)",
          marginLeft: 2,
          animation: "breathe 1s ease-in-out infinite",
          verticalAlign: "text-bottom",
        }} />
      )}
    </span>
  );
}
