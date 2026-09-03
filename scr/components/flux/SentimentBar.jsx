import React from "react";

export default function SentimentBar({ positive = 0, neutral = 0, negative = 0 }) {
  const total = positive + neutral + negative || 100;
  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="bg-emerald-500" style={{ width: `${(positive / total) * 100}%` }} />
        <div className="bg-flux-slate/40" style={{ width: `${(neutral / total) * 100}%` }} />
        <div className="bg-flux-red" style={{ width: `${(negative / total) * 100}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <SentItem label="Positive" value={positive} color="bg-emerald-500" />
        <SentItem label="Neutral" value={neutral} color="bg-flux-slate/40" />
        <SentItem label="Negative" value={negative} color="bg-flux-red" />
      </div>
    </div>
  );
}

function SentItem({ label, value, color }) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        <span className="text-muted-foreground">{label}</span>
      </div>
      <div className="mt-0.5 font-num font-semibold text-foreground">{value}%</div>
    </div>
  );
}