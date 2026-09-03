// FLUX shared helpers
import { TrendingUp, Minus, TrendingDown } from "lucide-react";

export const SCORE_TIERS = [
  { min: 80, label: "ACT NOW", key: "act", color: "#DB0011" },
  { min: 60, label: "WATCH", key: "watch", color: "#D89B2A" },
  { min: 0, label: "NOISE", key: "noise", color: "#6B7A8F" },
];

export function getTier(score) {
  return SCORE_TIERS.find((t) => score >= t.min) || SCORE_TIERS[SCORE_TIERS.length - 1];
}

export const URGENCY_STYLES = {
  HIGH: { dot: "bg-flux-red", text: "text-flux-red", label: "High", ring: "border-flux-red/30 bg-flux-red/5" },
  MEDIUM: { dot: "bg-flux-amber", text: "text-flux-amber", label: "Medium", ring: "border-flux-amber/30 bg-flux-amber/5" },
  LOW: { dot: "bg-flux-slate", text: "text-flux-slate", label: "Low", ring: "border-flux-slate/30 bg-flux-slate/5" },
};

export const VELOCITY_STYLES = {
  Accelerating: { icon: TrendingUp, color: "text-emerald-600" },
  Stable: { icon: Minus, color: "text-flux-slate" },
  Declining: { icon: TrendingDown, color: "text-flux-red" },
};

export function formatGrowth(n) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n}%`;
}

export function scoreColor(score) {
  return getTier(score).color;
}

// Build a 30-day date array ending today
export function buildTrendDates(days = 30) {
  const dates = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

// Generate a smooth accelerating trend curve
export function genTrend(start, end, days = 30, jitter = 0.04) {
  const out = [];
  for (let i = 0; i < days; i++) {
    const t = i / (days - 1);
    const base = start + (end - start) * t;
    const noise = 1 + (Math.sin(i * 1.3) * jitter);
    out.push(Math.round(base * noise));
  }
  return out;
}