import React from "react";
import { URGENCY_STYLES } from "@/lib/fluxUtils";

export default function UrgencyBadge({ urgency, className = "" }) {
  const s = URGENCY_STYLES[urgency] || URGENCY_STYLES.MEDIUM;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${s.ring} ${s.text} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}