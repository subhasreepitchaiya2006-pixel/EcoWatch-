import React from "react";

export const SEVERITY_LEVELS = {
  NORMAL: "NORMAL",
  SAFE: "NORMAL",
  ADVISORY: "ADVISORY",
  WARNING: "WARNING",
  EMERGENCY: "EMERGENCY",
  CRITICAL: "EMERGENCY",
};

export const LEVEL_CONFIG = {
  NORMAL: {
    label: "Safe / Normal",
    shortLabel: "Normal",
    emoji: "🟢",
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
    icon: "check_circle",
    summary: "No immediate threat. Baseline nominal.",
  },
  ADVISORY: {
    label: "Advisory",
    shortLabel: "Advisory",
    emoji: "🟡",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
    icon: "info",
    summary: "Potential risk. Users should remain aware.",
  },
  WARNING: {
    label: "Warning",
    shortLabel: "Warning",
    emoji: "🟠",
    color: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    dot: "bg-orange-500",
    icon: "warning",
    summary: "Significant risk exists. Users should take precautions.",
  },
  EMERGENCY: {
    label: "Emergency",
    shortLabel: "Emergency",
    emoji: "🔴",
    color: "text-red-700 dark:text-red-300",
    bg: "bg-red-500/15",
    border: "border-red-500/40",
    dot: "bg-red-600 animate-pulse",
    icon: "crisis_alert",
    summary: "Immediate danger. Follow emergency safety instructions.",
  },
};

export function normalizeLevel(level) {
  if (!level) return "NORMAL";
  const s = String(level).toUpperCase();
  if (s.includes("EMERG") || s.includes("CRIT") || s.includes("HIGH PRIORITY")) return "EMERGENCY";
  if (s.includes("WARN") || s.includes("HIGH") || s.includes("UNHEALTHY")) return "WARNING";
  if (s.includes("ADVIS") || s.includes("MODERATE")) return "ADVISORY";
  return "NORMAL";
}

export default function StatusIndicator({
  level = "NORMAL",
  labelOverride,
  size = "md",
  showIcon = true,
  showDot = true,
  pulse = false,
  className = "",
}) {
  const norm = normalizeLevel(level);
  const cfg = LEVEL_CONFIG[norm] || LEVEL_CONFIG.NORMAL;
  const displayLabel = labelOverride || cfg.label;

  const sizeClasses = {
    xs: "px-2 py-0.5 text-[10px] gap-1",
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3 py-1.5 text-xs gap-2",
    lg: "px-4 py-2 text-sm gap-2.5 font-bold",
  }[size] || "px-3 py-1.5 text-xs gap-2";

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold border transition-all ${cfg.bg} ${cfg.color} ${cfg.border} ${sizeClasses} ${className}`}
      title={cfg.summary}
    >
      {showDot && (
        <span
          className={`w-2 h-2 rounded-full ${cfg.dot} ${pulse || norm === "EMERGENCY" ? "animate-pulse" : ""}`}
        />
      )}
      {showIcon && (
        <span className="material-symbols-outlined text-[15px] leading-none">
          {cfg.icon}
        </span>
      )}
      <span>{displayLabel}</span>
    </span>
  );
}
