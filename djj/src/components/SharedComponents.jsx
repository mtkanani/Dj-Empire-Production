import { useState, useMemo } from "react";
import { CheckCircle2, Radio } from "lucide-react";
import { C } from "../constants";

function Badge({ children, tone = "muted" }) {
  const map = {
    muted: { bg: C.panel2, fg: C.muted },
    gold: { bg: C.goldDim, fg: C.gold },
    amber: { bg: C.amberDim, fg: C.amber },
    red: { bg: C.redDim, fg: C.red },
    purple: { bg: C.purpleDim, fg: C.purple },
    green: { bg: C.greenDim, fg: C.green },
    pink: { bg: C.pinkDim, fg: C.pink },
    orange: { bg: C.orangeDim, fg: C.orange },
  };
  const t = map[tone];
  return (
    <span style={{ background: t.bg, color: t.fg, fontFamily: "Inter", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function Panel({ children, style }) {
  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.03)",
      backdropFilter: "blur(20px)",
      border: `1px solid ${C.border}`,
      borderRadius: 20,
      padding: 32,
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      ...style
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
      e.currentTarget.style.borderColor = C.borderGold;
      e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
      e.currentTarget.style.boxShadow = `0 16px 48px ${C.goldGlow}`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0) scale(1)";
      e.currentTarget.style.borderColor = C.border;
      e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
      e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)";
    }}>
      {/* Glassmorphism shine effect */}
      <div style={{
        position: "absolute",
        top: 0,
        left: -100,
        width: "50%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
        transform: "skewX(-20deg)",
        transition: "left 0.5s ease",
        pointerEvents: "none"
      }} />
      {children}
    </div>
  );
}

function Btn({ children, onClick, tone = "default", disabled, style, icon: Icon }) {
  const styles = {
    default: { 
      background: `linear-gradient(135deg, ${C.gold} 0%, ${C.amber} 100%)`, 
      color: "#000", 
      border: "none", 
      boxShadow: `0 8px 32px ${C.goldGlow}` 
    },
    gold: { 
      background: `linear-gradient(135deg, ${C.gold} 0%, ${C.amber} 100%)`, 
      color: "#000", 
      border: "none", 
      boxShadow: `0 8px 32px ${C.goldGlow}` 
    },
    ghost: { 
      background: "rgba(255, 255, 255, 0.05)", 
      color: C.text, 
      border: `2px solid ${C.border}`,
      backdropFilter: "blur(10px)"
    },
    blue: {
      background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDim} 100%)`,
      color: "#000",
      border: "none",
      boxShadow: `0 8px 32px ${C.blueGlow}`
    },
    purple: { background: "linear-gradient(135deg, #9b7653 0%, #6b4423 100%)", color: "#fff", border: "none", boxShadow: "0 4px 20px rgba(155, 118, 83, 0.4)" },
    pink: { background: "linear-gradient(135deg, #d4af37 0%, #b8860b 100%)", color: "#000", border: "none", boxShadow: "0 4px 20px rgba(212, 175, 55, 0.4)" },
    green: { background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "#000", border: "none", boxShadow: "0 4px 20px rgba(34, 197, 94, 0.4)" },
  };

  const handleMouseMove = (e) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    e.currentTarget.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.05)`;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = styles[tone].boxShadow || "none";
    if (Icon) {
      e.currentTarget.querySelector('svg')?.style.setProperty('transform', 'scale(1) rotate(0deg)');
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[tone], 
        fontFamily: "Montserrat", 
        fontWeight: 600, 
        fontSize: 14,
        letterSpacing: 1,
        padding: "16px 32px", 
        borderRadius: 50, 
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1, 
        display: "inline-flex", 
        alignItems: "center", 
        gap: 12,
        transition: "transform 0.2s ease-out, box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)", 
        position: "relative", 
        overflow: "hidden",
        textTransform: "uppercase",
        ...style
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.boxShadow = tone === "ghost"
            ? `0 16px 48px ${C.goldGlow}`
            : `0 20px 60px ${C.goldGlow}`;
          if (Icon) {
            e.currentTarget.querySelector('svg')?.style.setProperty('transform', 'scale(1.3) rotate(15deg)');
          }
        }
      }}
    >
      {Icon && <Icon size={18} style={{ transition: "transform 0.3s ease" }} />} {children}
    </button>
  );
}

function ScanRing() {
  return (
    <div style={{ position: "relative", width: 280, height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{
          position: "absolute", width: 80 + i * 55, height: 80 + i * 55, borderRadius: "50%",
          border: `2px solid ${C.gold}`, opacity: 0.35 - i * 0.08,
          animation: `pulseRing 3s ease-out infinite`, animationDelay: `${i * 0.4}s`
        }} />
      ))}
      <style>{`@keyframes pulseRing { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.2); opacity: 0; } }`}</style>
      <div style={{ 
        width: 72, height: 72, borderRadius: 20, 
        background: "linear-gradient(135deg, #ffd700 0%, #b8860b 100%)", 
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, 
        boxShadow: "0 8px 32px rgba(255, 215, 0, 0.4)",
        animation: "float 3s ease-in-out infinite"
      }}>
        <Radio size={32} color="#000" style={{ animation: "rotate 8s linear infinite" }} />
      </div>
      <style>{`@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } } @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function FeatureList({ items }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 14 }}>
      {items.map((f, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <CheckCircle2 size={16} color={C.gold} style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontFamily: "Inter", fontSize: 14, color: C.muted, lineHeight: 1.5 }}>{f}</span>
        </div>
      ))}
    </div>
  );
}

function PageHeader({ eyebrow, title, body }) {
  return (
    <div style={{ 
      padding: "80px 40px 30px", maxWidth: "1200px", margin: "0 auto", textAlign: "center",
      animation: "fadeInUp 0.8s ease-out"
    }}>
      <Badge tone="gold" style={{ animation: "fadeIn 1s ease-out 0.2s both" }}>{eyebrow}</Badge>
      <h1 style={{ 
        fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 48, color: C.text, 
        margin: "24px 0 16px", lineHeight: 1.1, 
        background: "linear-gradient(135deg, #ffd700 0%, #daa520 50%, #b8860b 100%)", 
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        backgroundSize: "200% 200%",
        animation: "gradientShift 3s ease infinite, fadeInUp 0.8s ease-out 0.3s both"
      }}>{title}</h1>
      <p style={{ 
        fontFamily: "Inter", fontSize: 18, color: C.muted, lineHeight: 1.7, 
        maxWidth: 800, margin: "0 auto",
        animation: "fadeInUp 0.8s ease-out 0.4s both"
      }}>{body}</p>
      <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>
    </div>
  );
}

export { Badge, Panel, Btn, ScanRing, FeatureList, PageHeader };
