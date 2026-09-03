import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, TrendingUp, TrendingDown, Minus, MessageSquare, Swords } from "lucide-react";
import ScoreRing from "./ScoreRing";
import UrgencyBadge from "./UrgencyBadge";
import { getTier, formatGrowth } from "@/lib/fluxUtils";

export default function SignalCard({ signal }) {
  const tier = getTier(signal.score);
  const VelocityIcon = signal.velocity_label === "Accelerating" ? TrendingUp : signal.velocity_label === "Declining" ? TrendingDown : Minus;

  return (
    <Link
      to={`/signals/${signal.id}`}
      className="group relative flex flex-col rounded-lg border border-border bg-card p-5 transition-all hover:border-flux-red/40 hover:shadow-[0_8px_30px_-12px_rgba(219,0,17,0.25)]"
    >
      <div className="absolute left-0 top-5 h-12 w-1 rounded-r" style={{ background: tier.color }} />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{signal.category}</span>
          </div>
          <h3 className="mt-1 truncate text-[15px] font-semibold leading-tight text-foreground">{signal.topic}</h3>
        </div>
        <ScoreRing score={signal.score} size={52} stroke={5} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 pl-2">
        <Metric label="Growth" value={formatGrowth(signal.mention_growth)} tone={signal.mention_growth > 0 ? "up" : "down"} />
        <Metric label="Sentiment" value={`${signal.sentiment_positive}%`} />
        <Metric label="Velocity" value={`${signal.velocity}x`} icon={VelocityIcon} />
      </div>

      <div className="mt-4 flex items-center justify-between pl-2">
        <UrgencyBadge urgency={signal.urgency} />
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Swords className="h-3 w-3" />
          <span>{signal.competitor_count} comp.</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 text-[12px] font-medium text-flux-red opacity-0 transition-opacity group-hover:opacity-100">
        View signal <ArrowUpRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}

function Metric({ label, value, tone, icon: Icon }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 flex items-center gap-1 font-num text-sm font-semibold text-foreground">
        {Icon && <Icon className={`h-3 w-3 ${tone === "up" ? "text-emerald-600" : tone === "down" ? "text-flux-red" : "text-muted-foreground"}`} />}
        {value}
      </div>
    </div>
  );
}