"use client";
import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useLucy } from "@/context/LucyContext";

const DEFAULT_AVATAR = {
  gender: "female",
  bodyType: "athletic",
  skinTone: "#c8a882",
  hairStyle: "long",
  hairColor: "#1a1a2e",
  eyeColor: "#00d4ff",
  outfitStyle: "tech",
  holoColor: "#00d4ff",
};

function hex(h) {
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return { r, g, b };
}

function shade(h, a) {
  const c = hex(h);
  const cl = (v) => Math.max(0, Math.min(255, v + a));
  return `rgb(${cl(c.r)},${cl(c.g)},${cl(c.b)})`;
}

function rgba(h, a) {
  const c = hex(h);
  return `rgba(${c.r},${c.g},${c.b},${a})`;
}

const OUTFIT_COLORS = {
  tech:     { top: "#1e1e3a", bottom: "#12122a", accent: true },
  suit:     { top: "#1a1a28", bottom: "#0d0d1a", accent: false },
  casual:   { top: "#6b4c3b", bottom: "#f0e6d6", accent: false },
  military: { top: "#2a3a2a", bottom: "#1a2a1a", accent: true },
  labcoat:  { top: "#e8e8f0", bottom: "#2a2a3a", accent: false },
};

export default function HumanoidAvatar() {
  const { voiceState, avatarConfig, emotion } = useLucy();
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const blinkRef = useRef({ next: 3, closing: false, openness: 1 });
  const reactRef = useRef({ type: null, t: 0 });
  const idleRef = useRef({ pose: 0, shift: 0 });

  const config = useMemo(() => ({ ...DEFAULT_AVATAR, ...avatarConfig }), [avatarConfig]);

  const handlePointer = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  const handleTap = useCallback(() => {
    const reactions = ["wave", "nod", "wink", "peace"];
    const r = reactions[Math.floor(Math.random() * reactions.length)];
    reactRef.current = { type: r, t: 0 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("pointermove", handlePointer);
    canvas.addEventListener("click", handleTap);
    canvas.addEventListener("touchstart", (e) => {
      if (e.touches[0]) {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
          x: (e.touches[0].clientX - rect.left) / rect.width,
          y: (e.touches[0].clientY - rect.top) / rect.height,
        };
      }
      handleTap();
    }, { passive: true });

    return () => {
      canvas.removeEventListener("pointermove", handlePointer);
      canvas.removeEventListener("click", handleTap);
    };
  }, [handlePointer, handleTap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 400;
    const H = 580;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.scale(dpr, dpr);

    const cx = W / 2;
    const isFemale = config.gender !== "male";
    const isMale = config.gender === "male";
    const holo = hex(config.holoColor);
    const eyeC = hex(config.eyeColor);
    const skinL = shade(config.skinTone, 22);
    const skinM = config.skinTone;
    const skinD = shade(config.skinTone, -30);
    const skinDD = shade(config.skinTone, -50);
    const outfit = OUTFIT_COLORS[config.outfitStyle] || OUTFIT_COLORS.tech;

    function draw() {
      const dt = 0.016;
      timeRef.current += dt;
      const t = timeRef.current;
      ctx.clearRect(0, 0, W, H);

      // ── Mouse tracking (smoothed) ──
      const mx = (mouseRef.current.x - 0.5) * 2;
      const my = (mouseRef.current.y - 0.5) * 2;

      // ── Blink system ──
      const blink = blinkRef.current;
      blink.next -= dt;
      if (blink.next <= 0 && !blink.closing) {
        blink.closing = true;
      }
      if (blink.closing) {
        blink.openness -= dt * 12;
        if (blink.openness <= 0) {
          blink.openness = 0;
          blink.closing = false;
        }
      } else if (blink.openness < 1) {
        blink.openness += dt * 10;
        if (blink.openness >= 1) {
          blink.openness = 1;
          blink.next = 2.5 + Math.random() * 4;
        }
      }

      // ── Reaction system ──
      const react = reactRef.current;
      if (react.type) {
        react.t += dt;
        if (react.t > 1.5) react.type = null;
      }

      // ── Idle animations ──
      const breathe = Math.sin(t * 1.4) * 2;
      const weightShift = Math.sin(t * 0.4) * 1.5;
      const speakPulse = voiceState === "speaking" ? Math.sin(t * 9) * 3 : 0;
      const isActive = voiceState !== "idle";

      // ── Atmospheric glow ──
      const bgGrad = ctx.createRadialGradient(cx, H * 0.4, 20, cx, H * 0.4, W * 0.65);
      bgGrad.addColorStop(0, `rgba(${holo.r},${holo.g},${holo.b},${0.05 + (isActive ? 0.03 : 0)})`);
      bgGrad.addColorStop(1, "transparent");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(weightShift * 0.3, breathe * 0.5);

      // ══ BODY PROPORTIONS (stylized) ══
      const headCy = 108;
      const headW = 48;
      const headH = 54;
      const neckTop = headCy + headH - 10;
      const shoulderY = neckTop + 20;
      const shoulderW = isMale ? 78 : 68;
      const torsoH = 110;
      const torsoBot = shoulderY + torsoH;
      const waistW = isFemale ? 36 : 44;
      const hipW = isFemale ? 54 : 48;
      const hipY = torsoBot + 6;
      const legBot = H - 50;

      // ═══ LEGS ═══
      const legGap = isFemale ? 18 : 16;
      const legW = isFemale ? 18 : 20;

      // Left leg
      ctx.fillStyle = outfit.bottom;
      ctx.beginPath();
      ctx.moveTo(cx - legGap - legW * 0.4, hipY);
      ctx.bezierCurveTo(cx - legGap - legW * 0.5, hipY + 60, cx - legGap - legW * 0.6, legBot - 20, cx - legGap - legW * 0.5, legBot);
      ctx.lineTo(cx - legGap + legW * 0.6, legBot);
      ctx.bezierCurveTo(cx - legGap + legW * 0.5, legBot - 20, cx - legGap + legW * 0.4, hipY + 60, cx - legGap + legW * 0.3, hipY);
      ctx.closePath();
      ctx.fill();

      // Right leg
      ctx.beginPath();
      ctx.moveTo(cx + legGap - legW * 0.3, hipY);
      ctx.bezierCurveTo(cx + legGap - legW * 0.4, hipY + 60, cx + legGap - legW * 0.5, legBot - 20, cx + legGap - legW * 0.6, legBot);
      ctx.lineTo(cx + legGap + legW * 0.5, legBot);
      ctx.bezierCurveTo(cx + legGap + legW * 0.6, legBot - 20, cx + legGap + legW * 0.5, hipY + 60, cx + legGap + legW * 0.4, hipY);
      ctx.closePath();
      ctx.fill();

      // Leg shading
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.beginPath();
      ctx.ellipse(cx - legGap, hipY + 50, legW * 0.3, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + legGap, hipY + 50, legW * 0.3, 40, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shoes
      ctx.fillStyle = shade(outfit.top, -15);
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(cx + side * legGap, legBot + 6, legW * 0.7, 8, 0, 0, Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(cx + side * legGap - legW * 0.65, legBot - 2, legW * 1.3, 10, [0, 0, 4, 4]);
        ctx.fill();
      }

      // ═══ TORSO ═══
      const topGrad = ctx.createLinearGradient(cx - shoulderW, shoulderY, cx + shoulderW, torsoBot);
      topGrad.addColorStop(0, shade(outfit.top, 12));
      topGrad.addColorStop(0.5, outfit.top);
      topGrad.addColorStop(1, shade(outfit.top, -10));
      ctx.fillStyle = topGrad;

      ctx.beginPath();
      ctx.moveTo(cx - shoulderW + 10, shoulderY);
      ctx.quadraticCurveTo(cx - shoulderW, shoulderY + 2, cx - shoulderW, shoulderY + 8);
      ctx.bezierCurveTo(cx - shoulderW + 2, shoulderY + torsoH * 0.5, cx - waistW - 6, torsoBot - 10, cx - waistW, torsoBot);
      ctx.lineTo(cx - hipW, hipY);
      ctx.lineTo(cx + hipW, hipY);
      ctx.lineTo(cx + waistW, torsoBot);
      ctx.bezierCurveTo(cx + waistW + 6, torsoBot - 10, cx + shoulderW - 2, shoulderY + torsoH * 0.5, cx + shoulderW, shoulderY + 8);
      ctx.quadraticCurveTo(cx + shoulderW, shoulderY + 2, cx + shoulderW - 10, shoulderY);
      ctx.closePath();
      ctx.fill();

      // Torso shading (3D depth)
      const torsoShade = ctx.createRadialGradient(cx + 10, shoulderY + 30, 5, cx, shoulderY + 50, shoulderW);
      torsoShade.addColorStop(0, "rgba(255,255,255,0.04)");
      torsoShade.addColorStop(1, "rgba(0,0,0,0.08)");
      ctx.fillStyle = torsoShade;
      ctx.fill();

      // Neckline / collar
      if (isFemale && (config.outfitStyle === "casual" || config.outfitStyle === "tech")) {
        ctx.strokeStyle = shade(outfit.top, 15);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 28, shoulderY + 2);
        ctx.quadraticCurveTo(cx, shoulderY + 14, cx + 28, shoulderY + 2);
        ctx.stroke();
      }

      // Tech lines
      if (outfit.accent) {
        ctx.strokeStyle = rgba(config.holoColor, 0.15);
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(cx, shoulderY + 15);
        ctx.lineTo(cx, torsoBot - 8);
        ctx.stroke();
        // Arc reactor
        const ry = shoulderY + 35;
        const rPulse = 0.5 + Math.sin(t * 2.5) * 0.2 + (isActive ? 0.2 : 0);
        const rGrad = ctx.createRadialGradient(cx, ry, 0, cx, ry, 14);
        rGrad.addColorStop(0, rgba(config.holoColor, rPulse));
        rGrad.addColorStop(0.4, rgba(config.holoColor, rPulse * 0.3));
        rGrad.addColorStop(1, "transparent");
        ctx.fillStyle = rGrad;
        ctx.beginPath();
        ctx.arc(cx, ry, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = rgba(config.holoColor, rPulse * 0.6);
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(cx, ry, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `rgba(255,255,255,${rPulse * 0.7})`;
        ctx.beginPath();
        ctx.arc(cx, ry, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // ═══ ARMS ═══
      const armLen = isMale ? 90 : 82;
      const armW = isMale ? 15 : 12;
      const waveAngle = react.type === "wave" ? Math.sin(react.t * 8) * 0.4 - 0.6 : 0;
      const peaceAngle = react.type === "peace" ? -0.7 : 0;

      for (const side of [-1, 1]) {
        ctx.save();
        const armX = cx + side * (shoulderW - 6);
        const armRot = side === 1 ? (waveAngle || peaceAngle) : 0;
        ctx.translate(armX, shoulderY + 8);
        ctx.rotate(side * 0.05 + armRot + Math.sin(t * 0.7 + side) * 0.015);

        // Upper arm
        const aGrad = ctx.createLinearGradient(-armW / 2, 0, armW / 2, 0);
        aGrad.addColorStop(0, shade(outfit.top, side < 0 ? -8 : 8));
        aGrad.addColorStop(1, shade(outfit.top, side < 0 ? 8 : -8));
        ctx.fillStyle = aGrad;
        ctx.beginPath();
        ctx.roundRect(-armW / 2, 0, armW, armLen * 0.55, 7);
        ctx.fill();

        // Forearm (skin)
        const fGrad = ctx.createLinearGradient(-armW / 2, armLen * 0.5, armW / 2, armLen * 0.5);
        fGrad.addColorStop(0, side < 0 ? skinD : skinL);
        fGrad.addColorStop(1, side < 0 ? skinL : skinD);
        ctx.fillStyle = fGrad;
        ctx.beginPath();
        ctx.roundRect(-armW * 0.45, armLen * 0.5, armW * 0.9, armLen * 0.45, 6);
        ctx.fill();

        // Hand
        ctx.fillStyle = skinM;
        if (react.type === "peace" && side === 1) {
          // Peace sign fingers
          ctx.beginPath();
          ctx.roundRect(-3, armLen * 0.9, 4, 18, 2);
          ctx.fill();
          ctx.beginPath();
          ctx.roundRect(3, armLen * 0.9, 4, 18, 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(0, armLen * 0.92, 7, 6, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.ellipse(0, armLen * 0.95 + 4, 7, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          // Fingers hint
          for (let f = -2; f <= 1; f++) {
            ctx.beginPath();
            ctx.roundRect(f * 3.5 - 1, armLen * 0.95 + 8, 3, 5, 1.5);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // ═══ NECK ═══
      const neckGrad = ctx.createLinearGradient(cx - 12, neckTop, cx + 12, neckTop + 20);
      neckGrad.addColorStop(0, skinL);
      neckGrad.addColorStop(0.5, skinM);
      neckGrad.addColorStop(1, skinD);
      ctx.fillStyle = neckGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 12, neckTop, 24, 22, 4);
      ctx.fill();

      // Neck shadow under chin
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.beginPath();
      ctx.ellipse(cx, neckTop + 2, 16, 5, 0, 0, Math.PI);
      ctx.fill();

      // ═══ HEAD (follows mouse slightly) ═══
      const headTurn = mx * 4;
      const headTilt = my * 2;

      ctx.save();
      ctx.translate(cx + headTurn, headCy + headTilt + breathe * 0.2);

      // Head shape with 3D gradient
      const hGrad = ctx.createRadialGradient(-8 + headTurn * 0.5, -8, 4, 0, 0, headW + 6);
      hGrad.addColorStop(0, skinL);
      hGrad.addColorStop(0.5, skinM);
      hGrad.addColorStop(1, skinD);
      ctx.fillStyle = hGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, headW, headH, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cheek blush
      ctx.fillStyle = "rgba(220,140,140,0.08)";
      ctx.beginPath();
      ctx.ellipse(-headW * 0.55, 10, 10, 7, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(headW * 0.55, 10, 10, 7, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // ═══ FACE ═══
      const eyeY = -2;
      const eyeSpacing = 16;
      const eyeW = 9;
      const eyeH = 7 * blinkRef.current.openness;

      // Eye sockets
      ctx.fillStyle = skinDD;
      ctx.globalAlpha = 0.06;
      ctx.beginPath();
      ctx.ellipse(-eyeSpacing, eyeY, eyeW + 4, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(eyeSpacing, eyeY, eyeW + 4, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (blinkRef.current.openness > 0.1) {
        // Eye whites
        ctx.fillStyle = "#f8f6f4";
        ctx.beginPath();
        ctx.ellipse(-eyeSpacing, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(eyeSpacing, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
        ctx.fill();

        // Iris (follows mouse)
        const lookX = mx * 3;
        const lookY = my * 1.5;
        const irisR = 4.5;
        const winkMod = react.type === "wink" && react.t < 0.4 ? 0 : 1;

        for (const side of [-1, 1]) {
          const iCx = side * eyeSpacing + lookX;
          const iCy = eyeY + lookY;
          const thisOpen = side === 1 && react.type === "wink" && react.t < 0.5 ? 0.1 : 1;

          if (thisOpen < 0.5) {
            ctx.strokeStyle = config.hairColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(side * eyeSpacing - eyeW, eyeY);
            ctx.lineTo(side * eyeSpacing + eyeW, eyeY);
            ctx.stroke();
            continue;
          }

          // Iris gradient
          const iGrad = ctx.createRadialGradient(iCx, iCy, 0, iCx, iCy, irisR + 1);
          iGrad.addColorStop(0, shade(config.eyeColor, 30));
          iGrad.addColorStop(0.4, config.eyeColor);
          iGrad.addColorStop(0.8, shade(config.eyeColor, -40));
          iGrad.addColorStop(1, shade(config.eyeColor, -60));
          ctx.fillStyle = iGrad;
          ctx.beginPath();
          ctx.arc(iCx, iCy, irisR, 0, Math.PI * 2);
          ctx.fill();

          // Pupil
          ctx.fillStyle = "#080810";
          ctx.beginPath();
          ctx.arc(iCx, iCy, 2, 0, Math.PI * 2);
          ctx.fill();

          // Catchlight (two points like anime eyes)
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.beginPath();
          ctx.arc(iCx - 1.5, iCy - 1.5, 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.beginPath();
          ctx.arc(iCx + 1.5, iCy + 1, 0.7, 0, Math.PI * 2);
          ctx.fill();
        }

        // Upper eyelids / eyelashes
        ctx.strokeStyle = shade(config.hairColor, -10);
        ctx.lineWidth = isFemale ? 2 : 1.5;
        ctx.lineCap = "round";
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(side * eyeSpacing, eyeY - 1, eyeW + 1, eyeH + 1, 0, Math.PI + 0.1, -0.1);
          ctx.stroke();
          // Lashes (female)
          if (isFemale) {
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(side * eyeSpacing + side * (eyeW + 0.5), eyeY - 1);
            ctx.lineTo(side * eyeSpacing + side * (eyeW + 4), eyeY - 4);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(side * eyeSpacing + side * (eyeW - 1), eyeY - eyeH + 1);
            ctx.lineTo(side * eyeSpacing + side * (eyeW + 2), eyeY - eyeH - 2);
            ctx.stroke();
          }
        }
      } else {
        // Closed eyes
        ctx.strokeStyle = shade(config.hairColor, -10);
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY, eyeW, 0.1, Math.PI - 0.1);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(eyeSpacing, eyeY, eyeW, 0.1, Math.PI - 0.1);
        ctx.stroke();
      }

      // Eye glow (active states)
      if ((voiceState === "listening" || voiceState === "speaking") && blinkRef.current.openness > 0.5) {
        ctx.save();
        ctx.shadowColor = config.eyeColor;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = rgba(config.eyeColor, 0.25);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(-eyeSpacing, eyeY, eyeW + 2, Math.max(1, eyeH + 2), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(eyeSpacing, eyeY, eyeW + 2, Math.max(1, eyeH + 2), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Eyebrows
      ctx.strokeStyle = config.hairColor;
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      let browA = 0, browLift = 0;
      if (emotion === "frustrated") { browA = 0.2; }
      else if (emotion === "sad") { browA = -0.12; browLift = 1.5; }
      else if (emotion === "curious") { browA = -0.1; browLift = -1.5; }
      else if (emotion === "happy" || emotion === "excited") { browLift = -1; }

      // Nod reaction
      const nodY = react.type === "nod" ? Math.sin(react.t * 10) * 3 * Math.max(0, 1 - react.t) : 0;

      for (const side of [-1, 1]) {
        ctx.save();
        ctx.translate(side * eyeSpacing, eyeY - 11 + browLift);
        ctx.rotate(-browA * side);
        ctx.beginPath();
        ctx.moveTo(-7, 0);
        ctx.quadraticCurveTo(0, isFemale ? -2.5 : -1, 7, 0);
        ctx.stroke();
        ctx.restore();
      }

      // Nose
      ctx.strokeStyle = skinDD;
      ctx.globalAlpha = 0.18;
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, eyeY + 6);
      ctx.bezierCurveTo(1, eyeY + 12, 2, eyeY + 16, 0, eyeY + 17);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-3.5, eyeY + 16);
      ctx.quadraticCurveTo(0, eyeY + 19, 3.5, eyeY + 16);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Mouth
      const mouthY = 20 + nodY;
      if (voiceState === "speaking") {
        const openH = 3 + Math.abs(speakPulse) * 1.5;
        ctx.fillStyle = "#7a2838";
        ctx.beginPath();
        ctx.ellipse(0, mouthY, 7, openH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(240,235,230,0.4)";
        ctx.beginPath();
        ctx.ellipse(0, mouthY - openH * 0.35, 5, openH * 0.25, 0, 0, Math.PI);
        ctx.fill();
      } else {
        // Lips
        const smileAmt = (emotion === "happy" || emotion === "excited") ? 1.5 :
                         (emotion === "sad") ? -1.5 : 0.5;
        // Upper lip
        ctx.fillStyle = shade(config.skinTone, -20);
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.moveTo(-7, mouthY);
        ctx.quadraticCurveTo(-3, mouthY - 2, 0, mouthY - 1);
        ctx.quadraticCurveTo(3, mouthY - 2, 7, mouthY);
        ctx.quadraticCurveTo(3.5, mouthY + 0.5, 0, mouthY + 0.5);
        ctx.quadraticCurveTo(-3.5, mouthY + 0.5, -7, mouthY);
        ctx.fill();
        ctx.globalAlpha = 1;
        // Mouth line
        ctx.strokeStyle = "#a04858";
        ctx.lineWidth = 1.3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-6, mouthY);
        ctx.quadraticCurveTo(0, mouthY + smileAmt + 1, 6, mouthY);
        ctx.stroke();
      }

      // ═══ HAIR ═══
      const headTop = -headH;
      const hc = config.hairColor;
      const hcL = shade(hc, 25);
      ctx.fillStyle = hc;

      switch (config.hairStyle) {
        case "long": {
          // Top cap
          ctx.beginPath();
          ctx.ellipse(0, headTop + 12, headW * 0.65, 26, 0, Math.PI, 0);
          ctx.fill();
          // Left flow
          ctx.beginPath();
          ctx.moveTo(-headW * 0.6, headTop + 16);
          ctx.bezierCurveTo(-headW * 0.75, headTop + 50, -headW * 0.7, headTop + 90, -headW * 0.45, headTop + 120);
          ctx.lineTo(-headW * 0.35, headTop + 16);
          ctx.fill();
          // Right flow
          ctx.beginPath();
          ctx.moveTo(headW * 0.6, headTop + 16);
          ctx.bezierCurveTo(headW * 0.75, headTop + 50, headW * 0.7, headTop + 90, headW * 0.45, headTop + 120);
          ctx.lineTo(headW * 0.35, headTop + 16);
          ctx.fill();
          // Shine streak
          ctx.fillStyle = hcL;
          ctx.globalAlpha = 0.12;
          ctx.beginPath();
          ctx.moveTo(-6, headTop + 4);
          ctx.bezierCurveTo(-10, headTop + 35, -12, headTop + 70, -8, headTop + 100);
          ctx.lineTo(-2, headTop + 100);
          ctx.bezierCurveTo(-4, headTop + 70, -2, headTop + 35, 2, headTop + 4);
          ctx.fill();
          ctx.globalAlpha = 1;
          break;
        }
        case "short": {
          ctx.beginPath();
          ctx.ellipse(0, headTop + 12, headW * 0.62, 24, 0, Math.PI, 0);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(-headW * 0.46, headTop + 24, 11, 28, -0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(headW * 0.46, headTop + 24, 11, 28, 0.2, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "ponytail": {
          ctx.beginPath();
          ctx.ellipse(0, headTop + 12, headW * 0.6, 22, 0, Math.PI, 0);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(2, headTop + 6);
          ctx.bezierCurveTo(headW * 0.8, headTop + 22, headW * 0.65, headTop + 75, headW * 0.4, headTop + 110);
          ctx.quadraticCurveTo(headW * 0.2, headTop + 105, 2, headTop + 14);
          ctx.fill();
          break;
        }
        case "bun": {
          ctx.beginPath();
          ctx.ellipse(0, headTop + 12, headW * 0.6, 22, 0, Math.PI, 0);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(0, headTop - 4, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = hcL;
          ctx.globalAlpha = 0.12;
          ctx.beginPath();
          ctx.arc(-4, headTop - 7, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          break;
        }
        case "mohawk": {
          ctx.beginPath();
          ctx.moveTo(-10, headTop + 14);
          ctx.bezierCurveTo(-6, headTop - 22, 6, headTop - 22, 10, headTop + 14);
          ctx.fill();
          break;
        }
        case "buzz": {
          ctx.fillStyle = hc + "88";
          ctx.beginPath();
          ctx.ellipse(0, headTop + 14, headW * 0.56, 18, 0, Math.PI, 0);
          ctx.fill();
          break;
        }
      }

      // Ear hint
      ctx.fillStyle = skinD;
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.ellipse(-headW - 2, eyeY + 4, 4, 7, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(headW + 2, eyeY + 4, 4, 7, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.restore(); // end head transform

      ctx.restore(); // end body breathe/shift

      // ═══ HOLOGRAPHIC EFFECTS ═══
      // Scanlines
      ctx.save();
      ctx.globalAlpha = 0.02;
      for (let y = 0; y < H; y += 3) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, y, W, 1);
      }
      ctx.restore();

      // Particles
      const pCount = isActive ? 18 : 8;
      for (let i = 0; i < pCount; i++) {
        const angle = t * 0.35 + i * (Math.PI * 2 / pCount);
        const r = 95 + Math.sin(t * 0.7 + i * 0.8) * 45;
        const px = cx + Math.cos(angle) * r;
        const py = H * 0.4 + Math.sin(t * 0.5 + i * 0.9) * 150;
        const pa = 0.1 + Math.sin(t * 2.5 + i) * 0.06 + (isActive ? 0.05 : 0);
        const ps = 1 + Math.sin(t + i * 0.5) * 0.5;
        ctx.fillStyle = `rgba(${holo.r},${holo.g},${holo.b},${pa})`;
        ctx.beginPath();
        ctx.arc(px, py, ps, 0, Math.PI * 2);
        ctx.fill();
      }

      // Platform
      const platY = H - 32;
      const rAlpha = isActive ? 0.25 + Math.sin(t * 3) * 0.08 : 0.08 + Math.sin(t) * 0.03;
      ctx.strokeStyle = `rgba(${holo.r},${holo.g},${holo.b},${rAlpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, platY, 72, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.ellipse(cx, platY, 58, 8, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating segments
      ctx.save();
      ctx.translate(cx, platY);
      ctx.scale(1, 0.17);
      ctx.strokeStyle = `rgba(${holo.r},${holo.g},${holo.b},${rAlpha * 0.5})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const s = t * 0.6 + i * Math.PI * 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, 66, s, s + 0.5);
        ctx.stroke();
      }
      ctx.restore();

      // Platform glow
      const pGrad = ctx.createRadialGradient(cx, platY, 0, cx, platY, 85);
      pGrad.addColorStop(0, `rgba(${holo.r},${holo.g},${holo.b},${rAlpha * 0.35})`);
      pGrad.addColorStop(1, "transparent");
      ctx.fillStyle = pGrad;
      ctx.fillRect(cx - 85, platY - 12, 170, 24);

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [voiceState, config, emotion]);

  return (
    <motion.div
      className="humanoid-avatar-container"
      animate={voiceState === "listening" ? { scale: 1.02, y: -4 } :
               voiceState === "speaking" ? { scale: 1.01, y: -2 } :
               { scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      style={{ cursor: "pointer", touchAction: "none" }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </motion.div>
  );
}
