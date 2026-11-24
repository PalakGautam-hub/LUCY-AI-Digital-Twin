"use client";
import { useEffect, useRef, useMemo } from "react";
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

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function shadeColor(hex, amt) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.max(0, Math.min(255, r + amt))},${Math.max(0, Math.min(255, g + amt))},${Math.max(0, Math.min(255, b + amt))})`;
}

function drawHairStyle(ctx, style, cx, headTop, headW, headH, color, gender) {
  ctx.fillStyle = color;
  const highlight = shadeColor(color, 30);

  switch (style) {
    case "short": {
      ctx.beginPath();
      ctx.ellipse(cx, headTop + 10, headW * 0.6, 22, 0, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - headW * 0.42, headTop + 22, 10, 26, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + headW * 0.42, headTop + 22, 10, 26, 0.25, 0, Math.PI * 2);
      ctx.fill();
      // highlight
      ctx.fillStyle = highlight;
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.ellipse(cx - 6, headTop + 6, headW * 0.3, 10, -0.2, Math.PI, 0);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case "long": {
      ctx.beginPath();
      ctx.ellipse(cx, headTop + 10, headW * 0.62, 24, 0, Math.PI, 0);
      ctx.fill();
      // Left flow
      ctx.beginPath();
      ctx.moveTo(cx - headW * 0.56, headTop + 14);
      ctx.bezierCurveTo(cx - headW * 0.68, headTop + 50, cx - headW * 0.65, headTop + 85, cx - headW * 0.4, headTop + 110);
      ctx.lineTo(cx - headW * 0.32, headTop + 14);
      ctx.fill();
      // Right flow
      ctx.beginPath();
      ctx.moveTo(cx + headW * 0.56, headTop + 14);
      ctx.bezierCurveTo(cx + headW * 0.68, headTop + 50, cx + headW * 0.65, headTop + 85, cx + headW * 0.4, headTop + 110);
      ctx.lineTo(cx + headW * 0.32, headTop + 14);
      ctx.fill();
      // Highlight streak
      ctx.fillStyle = highlight;
      ctx.globalAlpha = 0.12;
      ctx.beginPath();
      ctx.moveTo(cx - 8, headTop + 2);
      ctx.bezierCurveTo(cx - 12, headTop + 30, cx - 14, headTop + 60, cx - 10, headTop + 90);
      ctx.lineTo(cx - 4, headTop + 90);
      ctx.bezierCurveTo(cx - 6, headTop + 60, cx - 4, headTop + 30, cx, headTop + 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case "mohawk": {
      ctx.beginPath();
      ctx.moveTo(cx - 10, headTop + 14);
      ctx.bezierCurveTo(cx - 6, headTop - 20, cx + 6, headTop - 20, cx + 10, headTop + 14);
      ctx.fill();
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * 4 - 2, headTop + 14);
        ctx.quadraticCurveTo(cx + i * 4, headTop - 12 - Math.abs(i) * 2, cx + i * 4 + 2, headTop + 14);
        ctx.fill();
      }
      break;
    }
    case "buzz": {
      ctx.fillStyle = color + "99";
      ctx.beginPath();
      ctx.ellipse(cx, headTop + 12, headW * 0.54, 16, 0, Math.PI, 0);
      ctx.fill();
      break;
    }
    case "ponytail": {
      ctx.beginPath();
      ctx.ellipse(cx, headTop + 10, headW * 0.58, 20, 0, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 2, headTop + 6);
      ctx.bezierCurveTo(cx + headW * 0.75, headTop + 20, cx + headW * 0.6, headTop + 70, cx + headW * 0.35, headTop + 100);
      ctx.quadraticCurveTo(cx + headW * 0.15, headTop + 95, cx + 2, headTop + 12);
      ctx.fill();
      break;
    }
    case "bun": {
      ctx.beginPath();
      ctx.ellipse(cx, headTop + 10, headW * 0.58, 20, 0, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, headTop - 2, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = highlight;
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.arc(cx - 3, headTop - 5, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
  }
}

const OUTFIT_STYLES = {
  tech: { collar: true, lines: true, shoulderPads: true, color: "#1a1a2e", accent: true },
  suit: { collar: true, lines: false, shoulderPads: false, color: "#0d0d1a", lapel: true, accent: false },
  casual: { collar: false, lines: false, shoulderPads: false, color: "#1e293b", accent: false },
  military: { collar: true, lines: true, shoulderPads: true, color: "#1a2a1a", accent: true },
  labcoat: { collar: true, lines: false, shoulderPads: false, color: "#d8d8e8", accent: false },
};

export default function HumanoidAvatar() {
  const { voiceState, avatarConfig, emotion } = useLucy();
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  const config = useMemo(() => ({ ...DEFAULT_AVATAR, ...avatarConfig }), [avatarConfig]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 380;
    const H = 520;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.scale(dpr, dpr);

    const cx = W / 2;
    const isFemale = config.gender === "female";
    const isMale = config.gender === "male";
    const isAthletic = config.bodyType === "athletic";
    const isSlim = config.bodyType === "slim";

    const holo = hexToRgb(config.holoColor);
    const eye = hexToRgb(config.eyeColor);
    const skinLight = shadeColor(config.skinTone, 20);
    const skinDark = shadeColor(config.skinTone, -25);

    function draw() {
      timeRef.current += 0.016;
      const t = timeRef.current;
      ctx.clearRect(0, 0, W, H);

      const breathe = Math.sin(t * 1.5) * 2.5;
      const speakPulse = voiceState === "speaking" ? Math.sin(t * 8) * 3 : 0;
      const thinkPulse = voiceState === "thinking" ? Math.sin(t * 5) * 0.5 : 0;
      const listenGlow = voiceState === "listening" ? 0.4 + Math.sin(t * 3) * 0.2 : 0;
      const isActive = voiceState !== "idle";

      // ── ATMOSPHERIC BACKGROUND ──
      const bgGrad = ctx.createRadialGradient(cx, H * 0.45, 30, cx, H * 0.45, W * 0.7);
      bgGrad.addColorStop(0, `rgba(${holo.r},${holo.g},${holo.b},${0.04 + (isActive ? 0.03 : 0)})`);
      bgGrad.addColorStop(0.5, `rgba(${holo.r},${holo.g},${holo.b},0.015)`);
      bgGrad.addColorStop(1, "transparent");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // ── BODY PROPORTIONS ──
      const headCy = 82 + breathe * 0.3;
      const headW = 36;
      const headH = 42;
      const neckTop = headCy + headH - 6;
      const neckH = 18;
      const shoulderY = neckTop + neckH;
      const shoulderW = isMale ? 72 : (isAthletic ? 66 : (isSlim ? 56 : 62));
      const torsoH = isMale ? 100 : 95;
      const torsoBottom = shoulderY + torsoH;
      const waistW = isFemale ? 34 : (isMale ? 42 : 38);
      const hipW = isFemale ? 50 : (isMale ? 46 : 44);
      const hipY = torsoBottom + 8;
      const legTop = hipY + 4;
      const legBottom = H - 40;
      const legW = isMale ? 18 : 15;

      ctx.save();
      ctx.translate(0, breathe);

      // ── LEGS ──
      ctx.fillStyle = "#0d0d1a";
      const legGap = isFemale ? hipW * 0.28 : hipW * 0.25;
      // Left
      ctx.beginPath();
      ctx.moveTo(cx - legGap - legW * 0.3, legTop);
      ctx.lineTo(cx - legGap - legW * 0.5, legBottom);
      ctx.lineTo(cx - legGap + legW * 0.8, legBottom);
      ctx.lineTo(cx - legGap + legW * 0.3, legTop);
      ctx.fill();
      // Right
      ctx.beginPath();
      ctx.moveTo(cx + legGap - legW * 0.3, legTop);
      ctx.lineTo(cx + legGap - legW * 0.8, legBottom);
      ctx.lineTo(cx + legGap + legW * 0.5, legBottom);
      ctx.lineTo(cx + legGap + legW * 0.3, legTop);
      ctx.fill();

      // Leg accent lines
      ctx.strokeStyle = `rgba(${holo.r},${holo.g},${holo.b},0.15)`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx - legGap, legTop + 20);
      ctx.lineTo(cx - legGap - 2, legBottom - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + legGap, legTop + 20);
      ctx.lineTo(cx + legGap + 2, legBottom - 10);
      ctx.stroke();

      // Boots
      const bootH = 22;
      ctx.fillStyle = "#1a1a2e";
      ctx.beginPath();
      ctx.roundRect(cx - legGap - legW * 0.7, legBottom - 6, legW * 1.6, bootH, [0, 0, 5, 5]);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(cx + legGap - legW * 0.9, legBottom - 6, legW * 1.6, bootH, [0, 0, 5, 5]);
      ctx.fill();
      // Boot glow
      ctx.strokeStyle = `rgba(${holo.r},${holo.g},${holo.b},0.35)`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - legGap - legW * 0.5, legBottom + 8);
      ctx.lineTo(cx - legGap + legW * 0.7, legBottom + 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + legGap - legW * 0.7, legBottom + 8);
      ctx.lineTo(cx + legGap + legW * 0.5, legBottom + 8);
      ctx.stroke();

      // ── TORSO ──
      const outfit = OUTFIT_STYLES[config.outfitStyle] || OUTFIT_STYLES.tech;
      const torsoGrad = ctx.createLinearGradient(cx, shoulderY, cx, torsoBottom);
      torsoGrad.addColorStop(0, shadeColor(outfit.color, 10));
      torsoGrad.addColorStop(0.5, outfit.color);
      torsoGrad.addColorStop(1, shadeColor(outfit.color, -10));
      ctx.fillStyle = torsoGrad;

      ctx.beginPath();
      ctx.moveTo(cx - shoulderW, shoulderY + 6);
      ctx.quadraticCurveTo(cx - shoulderW + 4, shoulderY, cx - shoulderW + 20, shoulderY);
      ctx.lineTo(cx + shoulderW - 20, shoulderY);
      ctx.quadraticCurveTo(cx + shoulderW - 4, shoulderY, cx + shoulderW, shoulderY + 6);
      ctx.quadraticCurveTo(cx + waistW + 8, shoulderY + torsoH * 0.5, cx + waistW, torsoBottom);
      ctx.lineTo(cx + hipW, hipY);
      ctx.lineTo(cx - hipW, hipY);
      ctx.lineTo(cx - waistW, torsoBottom);
      ctx.quadraticCurveTo(cx - waistW - 8, shoulderY + torsoH * 0.5, cx - shoulderW, shoulderY + 6);
      ctx.closePath();
      ctx.fill();

      // Shoulder pads
      if (outfit.shoulderPads) {
        const padGrad = ctx.createLinearGradient(cx - shoulderW, shoulderY, cx - shoulderW + 20, shoulderY + 16);
        padGrad.addColorStop(0, `rgba(${holo.r},${holo.g},${holo.b},0.15)`);
        padGrad.addColorStop(1, "transparent");
        ctx.fillStyle = padGrad;
        ctx.beginPath();
        ctx.ellipse(cx - shoulderW + 8, shoulderY + 8, 18, 10, -0.2, 0, Math.PI * 2);
        ctx.fill();
        const padGrad2 = ctx.createLinearGradient(cx + shoulderW, shoulderY, cx + shoulderW - 20, shoulderY + 16);
        padGrad2.addColorStop(0, `rgba(${holo.r},${holo.g},${holo.b},0.15)`);
        padGrad2.addColorStop(1, "transparent");
        ctx.fillStyle = padGrad2;
        ctx.beginPath();
        ctx.ellipse(cx + shoulderW - 8, shoulderY + 8, 18, 10, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Outfit detail lines
      if (outfit.lines) {
        ctx.strokeStyle = `rgba(${holo.r},${holo.g},${holo.b},0.2)`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(cx, shoulderY + 12);
        ctx.lineTo(cx, torsoBottom - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, shoulderY + 28, 22, 0.25, Math.PI - 0.25);
        ctx.stroke();
        // Side seams
        ctx.beginPath();
        ctx.moveTo(cx - shoulderW + 18, shoulderY + 10);
        ctx.quadraticCurveTo(cx - waistW - 2, shoulderY + torsoH * 0.5, cx - waistW + 2, torsoBottom);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + shoulderW - 18, shoulderY + 10);
        ctx.quadraticCurveTo(cx + waistW + 2, shoulderY + torsoH * 0.5, cx + waistW - 2, torsoBottom);
        ctx.stroke();
      }

      if (outfit.collar) {
        ctx.strokeStyle = `rgba(${holo.r},${holo.g},${holo.b},0.3)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 18, shoulderY);
        ctx.quadraticCurveTo(cx, shoulderY + 8, cx + 18, shoulderY);
        ctx.stroke();
      }

      // ── ARC REACTOR ──
      const reactorY = shoulderY + 32;
      const reactorPulse = 0.6 + Math.sin(t * 2.5) * 0.25 + (isActive ? 0.15 : 0);
      const rGrad = ctx.createRadialGradient(cx, reactorY, 0, cx, reactorY, 18);
      rGrad.addColorStop(0, `rgba(${holo.r},${holo.g},${holo.b},${reactorPulse})`);
      rGrad.addColorStop(0.3, `rgba(${holo.r},${holo.g},${holo.b},${reactorPulse * 0.5})`);
      rGrad.addColorStop(0.6, `rgba(${holo.r},${holo.g},${holo.b},${reactorPulse * 0.15})`);
      rGrad.addColorStop(1, "transparent");
      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.arc(cx, reactorY, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(${holo.r},${holo.g},${holo.b},${reactorPulse * 0.7})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, reactorY, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, reactorY, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(255,255,255,${reactorPulse * 0.85})`;
      ctx.beginPath();
      ctx.arc(cx, reactorY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // ── ARMS ──
      const armSwing = voiceState === "speaking" ? Math.sin(t * 3.5) * 5 : Math.sin(t * 0.7) * 1.5;
      const armLen = isMale ? 85 : 78;
      const armW = isMale ? 16 : 13;

      // Left arm
      ctx.save();
      ctx.translate(cx - shoulderW + 6, shoulderY + 8);
      ctx.rotate(-0.06 + armSwing * 0.008);
      const armGrad = ctx.createLinearGradient(0, 0, 0, armLen);
      armGrad.addColorStop(0, shadeColor(outfit.color, 8));
      armGrad.addColorStop(1, shadeColor(outfit.color, -8));
      ctx.fillStyle = armGrad;
      ctx.beginPath();
      ctx.roundRect(-armW / 2, 0, armW, armLen, 7);
      ctx.fill();
      if (outfit.lines) {
        ctx.strokeStyle = `rgba(${holo.r},${holo.g},${holo.b},0.12)`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.lineTo(0, armLen - 8);
        ctx.stroke();
      }
      // Hand
      const skinGrad = ctx.createRadialGradient(0, armLen + 6, 0, 0, armLen + 6, 10);
      skinGrad.addColorStop(0, skinLight);
      skinGrad.addColorStop(1, config.skinTone);
      ctx.fillStyle = skinGrad;
      ctx.beginPath();
      ctx.ellipse(0, armLen + 6, 8, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Right arm
      ctx.save();
      ctx.translate(cx + shoulderW - 6, shoulderY + 8);
      ctx.rotate(0.06 - armSwing * 0.008);
      ctx.fillStyle = armGrad;
      ctx.beginPath();
      ctx.roundRect(-armW / 2, 0, armW, armLen, 7);
      ctx.fill();
      if (outfit.lines) {
        ctx.strokeStyle = `rgba(${holo.r},${holo.g},${holo.b},0.12)`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.lineTo(0, armLen - 8);
        ctx.stroke();
      }
      const skinGrad2 = ctx.createRadialGradient(0, armLen + 6, 0, 0, armLen + 6, 10);
      skinGrad2.addColorStop(0, skinLight);
      skinGrad2.addColorStop(1, config.skinTone);
      ctx.fillStyle = skinGrad2;
      ctx.beginPath();
      ctx.ellipse(0, armLen + 6, 8, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── NECK ──
      const neckGrad = ctx.createLinearGradient(cx - 10, neckTop, cx + 10, neckTop + neckH);
      neckGrad.addColorStop(0, skinLight);
      neckGrad.addColorStop(1, skinDark);
      ctx.fillStyle = neckGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 10, neckTop, 20, neckH, 4);
      ctx.fill();

      // ── HEAD ──
      const headGrad = ctx.createRadialGradient(cx - 6, headCy - 6, 2, cx, headCy, headW + 4);
      headGrad.addColorStop(0, skinLight);
      headGrad.addColorStop(0.6, config.skinTone);
      headGrad.addColorStop(1, skinDark);
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.ellipse(cx, headCy, headW, headH, 0, 0, Math.PI * 2);
      ctx.fill();

      // Jaw definition
      if (isMale) {
        ctx.fillStyle = skinDark;
        ctx.globalAlpha = 0.08;
        ctx.beginPath();
        ctx.moveTo(cx - headW * 0.8, headCy + headH * 0.3);
        ctx.quadraticCurveTo(cx, headCy + headH + 2, cx + headW * 0.8, headCy + headH * 0.3);
        ctx.lineTo(cx + headW * 0.8, headCy + headH * 0.5);
        ctx.quadraticCurveTo(cx, headCy + headH - 2, cx - headW * 0.8, headCy + headH * 0.5);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // ── FACE ──
      const eyeY = headCy - 3;
      const eyeSpacing = 14;
      const eyeW = 6;
      const eyeH = 4;

      // Eye sockets (subtle shadow)
      ctx.fillStyle = skinDark;
      ctx.globalAlpha = 0.08;
      ctx.beginPath();
      ctx.ellipse(cx - eyeSpacing, eyeY, eyeW + 3, eyeH + 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + eyeSpacing, eyeY, eyeW + 3, eyeH + 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Eye whites
      ctx.fillStyle = "#f0f0f4";
      ctx.beginPath();
      ctx.ellipse(cx - eyeSpacing, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + eyeSpacing, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iris with gradient
      const lookX = voiceState === "thinking" ? Math.sin(t * 2) * 2 : 0;
      const lookY = voiceState === "thinking" ? Math.cos(t * 1.5) * 0.5 : 0;
      const irisR = 3;
      for (const side of [-1, 1]) {
        const iCx = cx + side * eyeSpacing + lookX;
        const iCy = eyeY + lookY;
        const iGrad = ctx.createRadialGradient(iCx, iCy, 0, iCx, iCy, irisR + 0.5);
        iGrad.addColorStop(0, config.eyeColor);
        iGrad.addColorStop(0.7, config.eyeColor);
        iGrad.addColorStop(1, shadeColor(config.eyeColor, -40));
        ctx.fillStyle = iGrad;
        ctx.beginPath();
        ctx.arc(iCx, iCy, irisR, 0, Math.PI * 2);
        ctx.fill();
        // Pupil
        ctx.fillStyle = "#0a0a14";
        ctx.beginPath();
        ctx.arc(iCx, iCy, 1.4, 0, Math.PI * 2);
        ctx.fill();
        // Catchlight
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.beginPath();
        ctx.arc(iCx - 1, iCy - 1, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Eye glow (active states)
      if (voiceState === "listening" || voiceState === "speaking") {
        ctx.save();
        ctx.shadowColor = config.eyeColor;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = `rgba(${eye.r},${eye.g},${eye.b},${0.3 + listenGlow * 0.3})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(cx - eyeSpacing, eyeY, eyeW + 2, eyeH + 1.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx + eyeSpacing, eyeY, eyeW + 2, eyeH + 1.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Eyebrows
      ctx.strokeStyle = config.hairColor;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      let browAngle = 0;
      let browLift = 0;
      if (emotion === "frustrated" || emotion === "angry") { browAngle = 0.18; }
      else if (emotion === "sad") { browAngle = -0.12; browLift = 1; }
      else if (emotion === "curious") { browAngle = -0.1; browLift = -1; }
      else if (emotion === "excited" || emotion === "happy") { browLift = -1; }

      ctx.save();
      ctx.translate(cx - eyeSpacing, eyeY - 8 + browLift);
      ctx.rotate(-browAngle);
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.quadraticCurveTo(0, isFemale ? -1.5 : -0.5, 6, 0);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(cx + eyeSpacing, eyeY - 8 + browLift);
      ctx.rotate(browAngle);
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.quadraticCurveTo(0, isFemale ? -1.5 : -0.5, 6, 0);
      ctx.stroke();
      ctx.restore();

      // Nose
      ctx.strokeStyle = skinDark;
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx, eyeY + 5);
      ctx.quadraticCurveTo(cx + 2, eyeY + 14, cx, eyeY + 15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 3, eyeY + 14);
      ctx.quadraticCurveTo(cx, eyeY + 16, cx + 3, eyeY + 14);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Mouth
      const mouthY = headCy + 16;
      if (voiceState === "speaking") {
        const openH = 3 + Math.abs(speakPulse) * 1.8;
        ctx.fillStyle = "#8a3045";
        ctx.beginPath();
        ctx.ellipse(cx, mouthY, 7, openH, 0, 0, Math.PI * 2);
        ctx.fill();
        // Teeth hint
        ctx.fillStyle = "rgba(240,240,240,0.5)";
        ctx.beginPath();
        ctx.ellipse(cx, mouthY - openH * 0.3, 5, openH * 0.3, 0, 0, Math.PI);
        ctx.fill();
      } else {
        ctx.strokeStyle = "#a04058";
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        if (emotion === "happy" || emotion === "excited") {
          ctx.beginPath();
          ctx.arc(cx, mouthY - 2, 7, 0.15, Math.PI - 0.15);
          ctx.stroke();
        } else if (emotion === "sad") {
          ctx.beginPath();
          ctx.arc(cx, mouthY + 5, 7, Math.PI + 0.3, -0.3);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(cx - 6, mouthY);
          ctx.quadraticCurveTo(cx, mouthY + 2.5, cx + 6, mouthY);
          ctx.stroke();
        }
      }

      // ── HAIR (drawn after face) ──
      const headTop = headCy - headH;
      drawHairStyle(ctx, config.hairStyle, cx, headTop, headW, headH, config.hairColor, config.gender);

      ctx.restore(); // end breathe translate

      // ── HOLOGRAPHIC EFFECTS ──

      // Subtle scanlines
      ctx.save();
      ctx.globalAlpha = 0.025;
      for (let y = 0; y < H; y += 3) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, y, W, 1);
      }
      ctx.restore();

      // Figure edge glow
      ctx.save();
      ctx.globalAlpha = 0.08 + thinkPulse * 0.08 + (isActive ? 0.04 : 0);
      ctx.shadowColor = config.holoColor;
      ctx.shadowBlur = 25;
      ctx.strokeStyle = config.holoColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, headCy + breathe * 0.3, headW + 6, headH + 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Energy particles
      const particleCount = isActive ? 20 : 10;
      for (let i = 0; i < particleCount; i++) {
        const angle = t * 0.4 + i * (Math.PI * 2 / particleCount);
        const radius = 90 + Math.sin(t * 0.8 + i * 0.7) * 40;
        const px = cx + Math.cos(angle) * radius;
        const py = H * 0.4 + Math.sin(t * 0.5 + i * 0.9) * 140 + breathe;
        const pa = 0.12 + Math.sin(t * 2.5 + i) * 0.08 + (isActive ? 0.06 : 0);
        const ps = 1.2 + Math.sin(t + i * 0.5) * 0.6;
        ctx.fillStyle = `rgba(${holo.r},${holo.g},${holo.b},${pa})`;
        ctx.beginPath();
        ctx.arc(px, py, ps, 0, Math.PI * 2);
        ctx.fill();
      }

      // Platform rings
      const platformY = H - 25 + breathe * 0.5;
      const ringAlpha = isActive ? 0.3 + Math.sin(t * 3) * 0.1 : 0.1 + Math.sin(t * 1) * 0.04;
      ctx.strokeStyle = `rgba(${holo.r},${holo.g},${holo.b},${ringAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, platformY, 70, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(cx, platformY, 55, 8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = `rgba(${holo.r},${holo.g},${holo.b},${ringAlpha * 0.5})`;
      ctx.beginPath();
      ctx.ellipse(cx, platformY, 85, 15, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Platform glow
      const platGrad = ctx.createRadialGradient(cx, platformY, 0, cx, platformY, 90);
      platGrad.addColorStop(0, `rgba(${holo.r},${holo.g},${holo.b},${ringAlpha * 0.4})`);
      platGrad.addColorStop(1, "transparent");
      ctx.fillStyle = platGrad;
      ctx.fillRect(cx - 90, platformY - 15, 180, 30);

      // Rotating ring segments (subtle)
      ctx.save();
      ctx.translate(cx, platformY);
      ctx.scale(1, 0.17);
      ctx.strokeStyle = `rgba(${holo.r},${holo.g},${holo.b},${ringAlpha * 0.6})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const segStart = t * 0.5 + i * Math.PI * 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, 65, segStart, segStart + 0.6);
        ctx.stroke();
      }
      ctx.restore();

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
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </motion.div>
  );
}
