import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ChevronDown, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import ScoreRing from "@/components/flux/ScoreRing";
import UrgencyBadge from "@/components/flux/UrgencyBadge";
import { formatGrowth, VELOCITY_STYLES } from "@/lib/fluxUtils";

export default function HealthSignalCard({ signal, showRevival }) {
  const [play, setPlay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const vStyle = VELOCITY_STYLES[signal.velocity_label] || VELOCITY_STYLES.Stable;
  const VelocityIcon = vStyle.icon;

  const generatePlay = async () => {
    setLoading(true);
    try {
      const prompt = `You are FLUX, an AI marketing strategist. The trend "${signal.topic}" in the ${
        signal.category
      } category is DECLINING. Metrics: Signal Quality Score ${Math.round(signal.score)}/100, mention growth ${Math.round(
        signal.mention_growth
      )}%, sentiment ${Math.round(signal.sentiment_positive)}% positive, velocity ${
        signal.velocity_label
      }, lifecycle ${signal.lifecycle}, competition ${signal.competition_level}. Competitor activity: ${
        (signal.competitors || []).join("; ") || "none recorded"
      }.

Write a concise revival play in markdown with these sections:
## Diagnosis — why it is likely declining
## Revival Plays — 3 concrete campaign angles
## 7-Day Quick Wins — immediate low-cost actions
## Metrics to Watch — what confirms recovery
## Verdict — REVIVE or RETIRE with a one-line rationale

Professional tone, under 350 words.`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      const text = typeof res === "string" ? res : res.message || "";
      setPlay(text);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <ScoreRing score={Math.round(signal.score)} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/signals/${signal.id}`}
              className="truncate font-heading text-base font-bold text-flux-navy hover:underline"
            >
              {signal.topic}
            </Link>
            <UrgencyBadge urgency={signal.urgency} />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{signal.category}</div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className={`inline-flex items-center gap-1 font-semibold ${vStyle.color}`}>
              <VelocityIcon className="h-3.5 w-3.5" /> {signal.velocity_label}
            </span>
            <span className="font-num font-semibold text-flux-navy">{formatGrowth(Math.round(signal.mention_growth))} mentions</span>
            <span className="text-flux-slate">Sentiment {Math.round(signal.sentiment_positive)}% positive</span>
            <span className="text-flux-slate">{signal.competitor_count} competitors active</span>
          </div>
        </div>
      </div>

      {showRevival && (
        <div className="mt-4 border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              variant="outline"
              onClick={generatePlay}
              disabled={loading}
              className="gap-1.5 border-flux-navy/30 text-flux-navy hover:bg-flux-navy hover:text-white"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {loading ? "Analyzing…" : play ? "Regenerate Revival Play" : "Generate Revival Play"}
            </Button>
            {play && (
              <button
                onClick={() => setOpen(!open)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-flux-red"
              >
                {open ? "Hide" : "View"} play <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
          {loading && (
            <p className="mt-3 text-xs text-muted-foreground">FLUX is diagnosing the decline and drafting revival angles…</p>
          )}
          {play && open && (
            <div className="flux-md mt-4 max-h-96 overflow-y-auto rounded-md bg-[#F8F9FB] p-4">
              <ReactMarkdown>{play}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}