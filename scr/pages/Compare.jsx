import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { GitCompare, FileText, Plus, X, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ScoreRing from "@/components/flux/ScoreRing";
import { getTier, formatGrowth, VELOCITY_STYLES } from "@/lib/fluxUtils";

export default function Compare() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [signals, setSignals] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Signal.list("-score", 50).then((s) => {
      setSignals(s);
      const ids = (params.get("ids") || "").split(",").filter(Boolean);
      if (ids.length) setSelected(ids);
      else setSelected(s.slice(0, 3).map((x) => x.id));
      setLoading(false);
    });
  }, []);

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 5 ? [...prev, id] : prev));
  };

  const chosen = signals.filter((s) => selected.includes(s.id));
  const best = chosen.length ? chosen.reduce((a, b) => (a.score > b.score ? a : b)) : null;

  if (loading) return <div className="h-64 animate-pulse rounded-lg bg-white/60" />;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-flux-red"><GitCompare className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-widest">Trend Comparison</span></div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-flux-navy">Compare trends side-by-side</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Select up to 5 signals. FLUX ranks them and tells you which to prioritize.</p>
      </div>

      {/* Picker */}
      <div className="mb-6 rounded-lg border border-border bg-white p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select signals to compare ({selected.length}/5)</div>
        <div className="flex flex-wrap gap-2">
          {signals.map((s) => {
            const active = selected.includes(s.id);
            const disabled = !active && selected.length >= 5;
            return (
              <button key={s.id} onClick={() => toggle(s.id)} disabled={disabled} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${active ? "border-flux-red bg-flux-red text-white" : "border-border bg-white text-foreground hover:border-flux-red/40 disabled:opacity-40"}`}>
                {active ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}{s.topic}
              </button>
            );
          })}
        </div>
      </div>

      {chosen.length < 2 ? (
        <div className="rounded-lg border border-dashed border-border bg-white py-16 text-center text-sm text-muted-foreground">Select at least 2 signals to compare.</div>
      ) : (
        <>
          {/* FLUX verdict */}
          {best && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-flux-red/30 bg-flux-red/5 p-4">
              <ArrowRight className="h-5 w-5 shrink-0 text-flux-red" />
              <p className="text-sm text-foreground"><span className="font-bold text-flux-red">FLUX says:</span> Prioritize <span className="font-semibold">{best.topic}</span> — highest Signal Quality Score ({best.score}/100). {best.recommendation}</p>
            </div>
          )}

          {/* Comparison table */}
          <div className="overflow-x-auto rounded-lg border border-border bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-[#F8FAFC]">
                  <th className="w-44 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Metric</th>
                  {chosen.map((s) => {
                    const tier = getTier(s.score);
                    return (
                      <th key={s.id} className="px-4 py-3 text-left align-top" style={{ borderLeft: `3px solid ${tier.color}` }}>
                        <div className="text-sm font-bold text-flux-navy">{s.topic}</div>
                        <div className="text-[11px] font-medium text-muted-foreground">{s.category}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                <Row label="Signal Score" chosen={chosen} render={(s) => <div className="flex items-center gap-2"><ScoreRing score={s.score} size={40} stroke={4} /><span className="font-num font-bold" style={{ color: getTier(s.score).color }}>{s.score}</span></div>} />
                <Row label="Mention Growth" chosen={chosen} render={(s) => <span className="font-num font-semibold">{formatGrowth(s.mention_growth)}</span>} />
                <Row label="Sentiment" chosen={chosen} render={(s) => <span className="font-num font-semibold">{s.sentiment_positive}% pos</span>} />
                <Row label="Velocity" chosen={chosen} render={(s) => <span className="font-num font-semibold">{s.velocity}x · {s.velocity_label}</span>} />
                <Row label="Competitors" chosen={chosen} render={(s) => <span className="font-num font-semibold">{s.competitor_count}</span>} />
                <Row label="Competition" chosen={chosen} render={(s) => <span className="font-semibold">{s.competition_level}</span>} />
                <Row label="Lifecycle" chosen={chosen} render={(s) => <span className="font-semibold">{s.lifecycle}</span>} />
                <Row label="Urgency" chosen={chosen} render={(s) => <span className="font-semibold">{s.urgency}</span>} />
                <Row label="Recommendation" chosen={chosen} render={(s) => <span className="text-xs text-muted-foreground">{s.recommendation}</span>} last />
                <tr className="bg-[#F8FAFC]">
                  <td className="px-4 py-3"></td>
                  {chosen.map((s) => (
                    <td key={s.id} className="px-4 py-3">
                      <button onClick={() => navigate(`/signals/${s.id}/brief`)} className="flex items-center gap-1.5 rounded-md bg-flux-red px-3 py-1.5 text-xs font-semibold text-white hover:bg-flux-red-dark"><FileText className="h-3 w-3" /> Brief</button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, chosen, render, last }) {
  return (
    <tr className={last ? "" : ""}>
      <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</td>
      {chosen.map((s) => <td key={s.id} className="px-4 py-3 text-foreground">{render(s)}</td>)}
    </tr>
  );
}