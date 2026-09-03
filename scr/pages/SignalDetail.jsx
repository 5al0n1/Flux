import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, FileText, GitCompare, Mail, Swords, TrendingUp, TrendingDown, Minus, ExternalLink, Clock, Target } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ScoreRing from "@/components/flux/ScoreRing";
import UrgencyBadge from "@/components/flux/UrgencyBadge";
import TrendChart from "@/components/flux/TrendChart";
import SentimentBar from "@/components/flux/SentimentBar";
import { getTier, formatGrowth, VELOCITY_STYLES } from "@/lib/fluxUtils";

export default function SignalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [signal, setSignal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Signal.get(id)
      .then(setSignal)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="mx-auto max-w-7xl animate-pulse space-y-4"><div className="h-10 w-1/3 rounded bg-white/60" /><div className="h-64 rounded-lg bg-white/60" /></div>;
  if (!signal) return <div className="mx-auto max-w-3xl py-20 text-center text-muted-foreground">Signal not found. <Link to="/" className="text-flux-red">Back to radar</Link></div>;

  const tier = getTier(signal.score);
  const vStyle = VELOCITY_STYLES[signal.velocity_label] || VELOCITY_STYLES.Stable;
  const VelocityIcon = vStyle.icon;

  return (
    <div className="mx-auto max-w-7xl">
      <button onClick={() => navigate(-1)} className="mb-5 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-flux-red">
        <ArrowLeft className="h-4 w-4" /> Back to radar
      </button>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-white p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-5">
          <ScoreRing score={signal.score} size={72} stroke={7} showLabel />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{signal.category}</div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-flux-navy">{signal.topic}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <UrgencyBadge urgency={signal.urgency} />
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{signal.lifecycle}</span>
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{signal.competition_level} competition</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate(`/signals/${signal.id}/brief`)} className="flex items-center gap-2 rounded-md bg-flux-red px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-flux-red-dark">
            <FileText className="h-4 w-4" /> Generate Brief
          </button>
          <button onClick={() => navigate(`/compare?ids=${signal.id}`)} className="flex items-center gap-2 rounded-md border border-border bg-white px-4 py-2.5 text-sm font-semibold text-flux-navy transition-colors hover:border-flux-red/40">
            <GitCompare className="h-4 w-4" /> Compare
          </button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Mention Growth" value={formatGrowth(signal.mention_growth)} sub="30 days" icon={TrendingUp} tone={signal.mention_growth > 0 ? "up" : "down"} />
        <MetricCard label="Positive Sentiment" value={`${signal.sentiment_positive}%`} sub="of conversation" />
        <MetricCard label="Velocity" value={`${signal.velocity}x`} sub={signal.velocity_label} icon={VelocityIcon} tone={signal.velocity_label === "Accelerating" ? "up" : signal.velocity_label === "Declining" ? "down" : "neutral"} />
        <MetricCard label="Competitors Active" value={signal.competitor_count} sub="responding" icon={Swords} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trend monitor */}
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Trend Monitor" subtitle="Mention volume over 30 days">
            <TrendChart dates={signal.trend_dates || []} mentions={signal.trend_mentions || []} />
          </Panel>

          <Panel title="Competitor Tracker" subtitle="Who responded, when, and how">
            <div className="space-y-2.5">
              {(signal.competitors || []).length === 0 && <p className="text-sm text-muted-foreground">No competitor activity detected — white space opportunity.</p>}
              {(signal.competitors || []).map((c, i) => (
                <div key={i} className="flex items-center gap-3 rounded-md border border-border bg-[#F8FAFC] p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-flux-navy text-xs font-bold text-white">{c.slice(0, 2).toUpperCase()}</div>
                  <div className="flex-1 text-sm font-medium text-foreground">{c}</div>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">Responded</span>
                </div>
              ))}
              <div className="flex items-center gap-3 rounded-md border border-flux-red/30 bg-flux-red/5 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-flux-red text-white"><Target className="h-4 w-4" /></div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-flux-red">Your move — white space</div>
                  <div className="text-xs text-muted-foreground">{signal.white_space || "Position now before competitors saturate."}</div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="FLUX Recommendation" subtitle="What to do and why">
            <div className="flex gap-3 rounded-md bg-flux-navy p-4 text-white">
              <div className="text-2xl leading-none">→</div>
              <p className="text-sm leading-relaxed text-white/90">{signal.recommendation}</p>
            </div>
          </Panel>
        </div>

        {/* Evidence panel */}
        <div className="space-y-6">
          <Panel title="Sentiment Breakdown">
            <SentimentBar positive={signal.sentiment_positive} neutral={signal.sentiment_neutral} negative={signal.sentiment_negative} />
          </Panel>

          <Panel title="Signal Quality Score" subtitle="How FLUX scored this signal">
            <div className="space-y-3">
              <ScoreBar label="Velocity" weight="30%" value={Math.min(100, signal.velocity * 60)} />
              <ScoreBar label="Sentiment" weight="25%" value={signal.sentiment_positive} />
              <ScoreBar label="Relevance" weight="25%" value={Math.min(100, 100 - signal.competitor_count * 8)} />
              <ScoreBar label="Competitive Gap" weight="20%" value={Math.max(0, 100 - signal.competitor_count * 12)} />
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm font-semibold">Total</span>
                <span className="font-num text-xl font-bold" style={{ color: tier.color }}>{signal.score}/100</span>
              </div>
            </div>
          </Panel>

          <Panel title="Data Sources" subtitle="All sources cited for verification">
            <div className="space-y-2">
              {(signal.sources || []).map((src, i) => (
                <a key={i} href="#" className="flex items-center justify-between rounded-md border border-border p-2.5 text-sm transition-colors hover:border-flux-red/40">
                  <span className="flex items-center gap-2 text-foreground"><span className="h-1.5 w-1.5 rounded-full bg-flux-red" />{src}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-flux-navy">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function MetricCard({ label, value, sub, icon: Icon, tone }) {
  const toneClass = tone === "up" ? "text-emerald-600" : tone === "down" ? "text-flux-red" : "text-muted-foreground";
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        {Icon && <Icon className={`h-4 w-4 ${toneClass}`} />}
      </div>
      <div className="mt-2 font-num text-2xl font-bold text-flux-navy">{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function ScoreBar({ label, weight, value }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label} <span className="text-muted-foreground">· {weight}</span></span>
        <span className="font-num font-semibold text-foreground">{Math.round(value)}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-flux-red" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}
