"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLucy } from "@/context/LucyContext";

const PARTICLE_COUNT = 80;

export default function Avatar() {
  const { voiceState } = useLucy();
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = 280;
    canvas.width = size * 2;
    canvas.height = size * 2;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.scale(2, 2);

    const cx = size / 2;
    const cy = size / 2;

    // Initialize particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = (Math.PI * 2 * i) / PARTICLE_COUNT;
        const radius = 60 + Math.random() * 30;
        particlesRef.current.push({
          angle,
          radius,
          baseRadius: radius,
          size: 1.5 + Math.random() * 2,
          speed: 0.003 + Math.random() * 0.008,
          offset: Math.random() * Math.PI * 2,
          opacity: 0.3 + Math.random() * 0.7,
        });
      }
    }

    let time = 0;
    const stateColors = {
      idle: { r: 0, g: 212, b: 255 },
      listening: { r: 0, g: 212, b: 255 },
      thinking: { r: 139, g: 92, b: 246 },
      speaking: { r: 6, g: 255, b: 208 },
    };

    function draw() {
      time += 0.016;
      ctx.clearRect(0, 0, size, size);
      const col = stateColors[voiceState] || stateColors.idle;

      // Core orb glow
      const glowSize = voiceState === "speaking" ? 45 + Math.sin(time * 4) * 8 : 
                        voiceState === "listening" ? 40 + Math.sin(time * 3) * 5 : 
                        voiceState === "thinking" ? 38 + Math.sin(time * 6) * 3 :
                        35 + Math.sin(time * 1.5) * 3;

      // Outer glow
      const grad1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize * 2.5);
      grad1.addColorStop(0, `rgba(${col.r},${col.g},${col.b},0.15)`);
      grad1.addColorStop(1, "transparent");
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(cx, cy, glowSize * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Core orb
      const grad2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize);
      grad2.addColorStop(0, `rgba(${col.r},${col.g},${col.b},0.9)`);
      grad2.addColorStop(0.5, `rgba(${col.r},${col.g},${col.b},0.3)`);
      grad2.addColorStop(1, `rgba(${col.r},${col.g},${col.b},0.05)`);
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(cx, cy, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Inner bright core
      const grad3 = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize * 0.3);
      grad3.addColorStop(0, `rgba(255,255,255,0.95)`);
      grad3.addColorStop(0.5, `rgba(${col.r},${col.g},${col.b},0.6)`);
      grad3.addColorStop(1, "transparent");
      ctx.fillStyle = grad3;
      ctx.beginPath();
      ctx.arc(cx, cy, glowSize * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Particles
      const expansionFactor = voiceState === "speaking" ? 1.3 + Math.sin(time * 5) * 0.15 :
                              voiceState === "listening" ? 1.1 + Math.sin(time * 3) * 0.1 :
                              voiceState === "thinking" ? 1.0 + Math.sin(time * 8) * 0.05 :
                              1.0 + Math.sin(time * 1) * 0.05;

      particlesRef.current.forEach((p) => {
        p.angle += p.speed;
        const r = p.baseRadius * expansionFactor + Math.sin(time * 2 + p.offset) * 8;
        const px = cx + Math.cos(p.angle) * r;
        const py = cy + Math.sin(p.angle) * r;
        const alpha = p.opacity * (0.5 + Math.sin(time * 3 + p.offset) * 0.5);

        ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Orbital rings
      ctx.strokeStyle = `rgba(${col.r},${col.g},${col.b},0.08)`;
      ctx.lineWidth = 1;
      [70, 95, 115].forEach((r, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r + Math.sin(time + i) * 3, 0, Math.PI * 2);
        ctx.stroke();
      });

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [voiceState]);

  const containerVariants = {
    idle: { scale: 1 },
    listening: { scale: 1.05 },
    thinking: { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 1.5 } },
    speaking: { scale: [1, 1.06, 1], transition: { repeat: Infinity, duration: 0.8 } },
  };

  return (
    <motion.div
      style={{ position: "relative", cursor: "pointer" }}
      variants={containerVariants}
      animate={voiceState}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </motion.div>
  );
}
