import React from "react";
import { getTier } from "@/lib/fluxUtils";

export default function ScoreRing({ score, size = 56, stroke = 6, showLabel = false }) {
  const tier = getTier(score);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="flex flex-col items-center justify-center" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E6E9EE" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={tier.color}
            strokeWidth={stroke}
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-num font-bold leading-none" style={{ fontSize: size * 0.3, color: tier.color }}>
            {score}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="mt-1 text-[10px] font-semibold tracking-wider uppercase" style={{ color: tier.color }}>
          {tier.label}
        </span>
      )}
    </div>
  );
}