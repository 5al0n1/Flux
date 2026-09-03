import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, AlertTriangle, TrendingUp, Frown, Swords, Activity, Zap, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { URGENCY_STYLES } from "@/lib/fluxUtils";

const TYPE_META = {
  opportunity: { icon: Zap, label: "New Opportunity", color: "text-flux-red" },
  acceleration: { icon: TrendingUp, label: "Trend Acceleration", color: "text-emerald-600" },
  sentiment_shift: { icon: Frown, label: "Sentiment Shift", color: "text-flux-amber" },
  competitor_response: { icon: Swords, label: "Competitor Response", color: "text-flux-navy" },
  decline: { icon: AlertTriangle, label: "Trend Decline", color: "text-flux-red" },
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    base44.entities.Alert.list("-created_date", 50).then(setAlerts).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await base44.entities.Alert.update(id, { read: true });
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.type === filter);
  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-flux-red"><Bell className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-widest">Alert Feed</span></div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-flux-navy">Real-time alerts</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{unread} unread of {alerts.length} alerts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        <FilterBtn active={filter === "all"} onClick={() => setFilter("all")} label="All" count={alerts.length} />
        {Object.entries(TYPE_META).map(([k, m]) => (
          <FilterBtn key={k} active={filter === k} onClick={() => setFilter(k)} label={m.label} count={alerts.filter((a) => a.type === k).length} />
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-white/60" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && <div className="rounded-lg border border-dashed border-border bg-white py-16 text-center text-sm text-muted-foreground">No alerts in this category.</div>}
          {filtered.map((a) => {
            const meta = TYPE_META[a.type] || TYPE_META.opportunity;
            const Icon = meta.icon;
            const s = URGENCY_STYLES[a.severity] || URGENCY_STYLES.MEDIUM;
            return (
              <div key={a.id} className={`rounded-lg border bg-white p-4 transition-colors ${a.read ? "border-border opacity-70" : "border-flux-red/30"}`}>
                <div className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary ${meta.color}`}><Icon className="h-4 w-4" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{a.title}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${s.ring} ${s.text}`}>{a.severity}</span>
                      {!a.read && <span className="h-2 w-2 rounded-full bg-flux-red" />}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
                    <div className="mt-2 flex items-center gap-3">
                      {a.signal_id && <Link to={`/signals/${a.signal_id}`} className="text-xs font-semibold text-flux-red hover:underline">View signal →</Link>}
                      {!a.read && <button onClick={() => markRead(a.id)} className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"><Check className="h-3 w-3" /> Mark read</button>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterBtn({ active, onClick, label, count }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${active ? "border-flux-red bg-flux-red text-white" : "border-border bg-white text-foreground hover:border-flux-red/40"}`}>
      {label} <span className={`rounded-full px-1.5 text-[10px] font-bold ${active ? "bg-white/20" : "bg-secondary"}`}>{count}</span>
    </button>
  );
}