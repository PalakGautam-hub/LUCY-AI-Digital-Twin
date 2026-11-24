"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLucy } from "@/context/LucyContext";

const SKIN_TONES = [
  { label: "Light", value: "#f5d0b0" },
  { label: "Fair", value: "#e8c09a" },
  { label: "Medium", value: "#c8a882" },
  { label: "Tan", value: "#a67c5b" },
  { label: "Brown", value: "#8b6243" },
  { label: "Dark", value: "#5c3d2e" },
  { label: "Holographic", value: "#a0c4e8" },
];

const HAIR_STYLES = [
  { label: "Long", value: "long" },
  { label: "Short", value: "short" },
  { label: "Mohawk", value: "mohawk" },
  { label: "Buzz", value: "buzz" },
  { label: "Ponytail", value: "ponytail" },
  { label: "Bun", value: "bun" },
];

const HAIR_COLORS = [
  { label: "Black", value: "#1a1a2e" },
  { label: "Brown", value: "#4a3226" },
  { label: "Blonde", value: "#c4a35a" },
  { label: "Red", value: "#8b3a3a" },
  { label: "Silver", value: "#a8a8b8" },
  { label: "Blue", value: "#2a4a8a" },
  { label: "Purple", value: "#6a2a8a" },
  { label: "Pink", value: "#c45a8a" },
  { label: "Cyan", value: "#2a8a8a" },
  { label: "White", value: "#e0e0e8" },
];

const EYE_COLORS = [
  { label: "Cyan", value: "#00d4ff" },
  { label: "Purple", value: "#8b5cf6" },
  { label: "Green", value: "#06ffd0" },
  { label: "Gold", value: "#fbbf24" },
  { label: "Red", value: "#ef4444" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Brown", value: "#92652d" },
  { label: "Silver", value: "#c0c0d0" },
];

const OUTFIT_STYLES = [
  { label: "Tech Suit", value: "tech" },
  { label: "Business", value: "suit" },
  { label: "Casual", value: "casual" },
  { label: "Military", value: "military" },
  { label: "Lab Coat", value: "labcoat" },
];

const BODY_TYPES = [
  { label: "Slim", value: "slim" },
  { label: "Athletic", value: "athletic" },
  { label: "Standard", value: "standard" },
];

const GENDERS = [
  { label: "Female", value: "female" },
  { label: "Male", value: "male" },
  { label: "Androgynous", value: "androgynous" },
];

const HOLO_COLORS = [
  { label: "Cyan", value: "#00d4ff" },
  { label: "Purple", value: "#8b5cf6" },
  { label: "Green", value: "#06ffd0" },
  { label: "Gold", value: "#fbbf24" },
  { label: "Red", value: "#ef4444" },
  { label: "Pink", value: "#f472b6" },
  { label: "White", value: "#e0e0e8" },
];

const CATEGORIES = [
  { key: "identity", label: "Identity", icon: "ID" },
  { key: "face", label: "Face", icon: "FX" },
  { key: "hair", label: "Hair", icon: "HR" },
  { key: "outfit", label: "Outfit", icon: "FT" },
  { key: "holo", label: "Holo", icon: "HG" },
];

function ColorSwatch({ colors, value, onChange }) {
  return (
    <div className="customizer-swatches">
      {colors.map((c) => (
        <button
          key={c.value}
          className={`swatch ${value === c.value ? "active" : ""}`}
          style={{ background: c.value }}
          onClick={() => onChange(c.value)}
          title={c.label}
        >
          {value === c.value && <span className="swatch-check">&#10003;</span>}
        </button>
      ))}
    </div>
  );
}

function OptionGrid({ options, value, onChange }) {
  return (
    <div className="customizer-options">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`customizer-opt-btn ${value === opt.value ? "active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function AvatarCustomizer({ onClose }) {
  const { avatarConfig, setAvatarConfig } = useLucy();
  const [category, setCategory] = useState("identity");

  const config = {
    gender: "female",
    bodyType: "athletic",
    skinTone: "#c8a882",
    hairStyle: "long",
    hairColor: "#1a1a2e",
    eyeColor: "#00d4ff",
    outfitStyle: "tech",
    holoColor: "#00d4ff",
    ...avatarConfig,
  };

  function update(key, val) {
    const next = { ...config, [key]: val };
    setAvatarConfig(next);
  }

  return (
    <motion.div
      className="customizer-panel glass-strong"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      <div className="customizer-header">
        <h3 className="customizer-title">AVATAR CONFIGURATOR</h3>
        <button className="btn-icon" onClick={onClose} style={{ width: 28, height: 28, fontSize: "0.7rem" }}>
          &#10005;
        </button>
      </div>

      <div className="customizer-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`customizer-tab ${category === cat.key ? "active" : ""}`}
            onClick={() => setCategory(cat.key)}
          >
            <span className="customizer-tab-icon">{cat.icon}</span>
            <span className="customizer-tab-label">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="customizer-body">
        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {category === "identity" && (
              <>
                <div className="customizer-section">
                  <label className="customizer-label">Gender</label>
                  <OptionGrid options={GENDERS} value={config.gender} onChange={(v) => update("gender", v)} />
                </div>
                <div className="customizer-section">
                  <label className="customizer-label">Body Type</label>
                  <OptionGrid options={BODY_TYPES} value={config.bodyType} onChange={(v) => update("bodyType", v)} />
                </div>
                <div className="customizer-section">
                  <label className="customizer-label">Skin Tone</label>
                  <ColorSwatch colors={SKIN_TONES} value={config.skinTone} onChange={(v) => update("skinTone", v)} />
                </div>
              </>
            )}

            {category === "face" && (
              <>
                <div className="customizer-section">
                  <label className="customizer-label">Eye Color</label>
                  <ColorSwatch colors={EYE_COLORS} value={config.eyeColor} onChange={(v) => update("eyeColor", v)} />
                </div>
              </>
            )}

            {category === "hair" && (
              <>
                <div className="customizer-section">
                  <label className="customizer-label">Hair Style</label>
                  <OptionGrid options={HAIR_STYLES} value={config.hairStyle} onChange={(v) => update("hairStyle", v)} />
                </div>
                <div className="customizer-section">
                  <label className="customizer-label">Hair Color</label>
                  <ColorSwatch colors={HAIR_COLORS} value={config.hairColor} onChange={(v) => update("hairColor", v)} />
                </div>
              </>
            )}

            {category === "outfit" && (
              <>
                <div className="customizer-section">
                  <label className="customizer-label">Outfit Style</label>
                  <OptionGrid options={OUTFIT_STYLES} value={config.outfitStyle} onChange={(v) => update("outfitStyle", v)} />
                </div>
              </>
            )}

            {category === "holo" && (
              <>
                <div className="customizer-section">
                  <label className="customizer-label">Hologram Accent</label>
                  <ColorSwatch colors={HOLO_COLORS} value={config.holoColor} onChange={(v) => update("holoColor", v)} />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="customizer-footer">
        <button className="btn-primary" onClick={onClose}>
          Apply
        </button>
      </div>
    </motion.div>
  );
}
