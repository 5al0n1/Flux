import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Loader2, Sparkles, TrendingUp, TrendingDown, Minus, Swords, Clock, ArrowRight, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ScoreRing from "@/components/flux/ScoreRing";
import { getTier, formatGrowth, VELOCITY_STYLES, buildTrendDates, genTrend } from "@/lib/fluxUtils";
import TrendChart from "@/components/flux/TrendChart";

export default function Validate() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FLUX, a marketing intelligence agent. A marketer asks: "Is '${q}' a good trend to target?"

Analyze this as a market signal and return a quality assessment. Use realistic, plausible metrics. Return ONLY JSON:
{
  "topic": string,
  "score": number (0-100),
  "urgency": "HIGH"|"MEDIUM"|"LOW",
  "mention_growth": number (percent over 90 days),
  "sentiment_positive": number (percent),
  "sentiment_neutral": number,
  "sentiment_negative": number,
  "velocity": number (multiplier e.g. 1.4),
  "velocity_label": "Accelerating"|"Stable"|"Declining",
  "competitor_count": number,
  "competition_level": "High"|"Medium"|"Low",
  "lifecycle": "Emerging"|"Peaking"|"Mature"|"Declining",
  "recommendation": string (specific actionable advice with differentiation angle),
  "evidence": [string] (3-5 bullet points with data),
  "audience": string (target audience summary),
  "white_space": string (differentiation opportunity)
}`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            topic: { type: "string" },
            score: { type: "number" },
            urgency: { type: "string" },
            mention_growth: { type: "number" },
            sentiment_positive: { type: "number" },
            sentiment_neutral: { type: "number" },
            sentiment_negative: { type: "number" },
            velocity: { type: "number" },
            velocity_label: { type: "string" },
            competitor_count: { type: "number" },
            competition_level: { type: "string" },
            lifecycle: { type: "string" },
            recommendation: { type: "string" },
            evidence: { type: "array", items: { type: "string" } },
            audience: { type: "string" },
            white_space: { type: "string" },
          },
        },
      });
      // attach a synthetic trend curve for the chart
      const dates = buildTrendDates(30);
      const end = Math.max(120, 120 + res.mention_growth * 4);
      res.trend_dates = dates;
      res.trend_mentions = genTrend(100, end, 30);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = params.get("q");
    if (q) { setQuery(q); run(q); }
  }, []);

  const submit = (e) => { e.preventDefault(); setParams({ q: query }); run(query); };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-flux-red"><Search className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-widest">Trend Validation</span></div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-flux-navy">Is this trend good?</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Enter any topic or keyword. FLUX returns an instant Signal Quality Score with evidence and a recommendation.</p>
      </div>

      <form onSubmit={submit} className="mb-8">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-white p-2 shadow-sm focus-within:border-flux-red/50">
          <Search className="ml-2 h-5 w-5 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. bleisure travel, eco-lodges Costa Rica, solo travel Japan…" className="flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground" />
          <button type="submit" disabled={loading} className="flex items-center gap-1.5 rounded-md bg-flux-red px-4 py-2 text-sm font-semibold text-white hover:bg-flux-red-dark disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Validate
          </button>
        </div>
      </form>

      {loading && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-white py-24">
          <Loader2 className="h-8 w-8 animate-spin text-flux-red" />
          <p className="mt-4 text-sm font-medium text-flux-navy">FLUX is analyzing the market…</p>
          <p className="mt-1 text-xs text-muted-foreground">Searching live signals, sentiment, and competitor activity</p>
        </div>
      )}

      {result && !loading && <Result result={result} />}
    </div>
  );
}

function Result({ result }) {
  const tier = getTier(result.score);
  const vStyle = VELOCITY_STYLES[result.velocity_label] || VELOCITY_STYLES.Stable;
  const VelocityIcon = vStyle.icon;
  return (
    <div className="space-y-6">
      {/* Verdict */}
      <div className="flex flex-col gap-6 rounded-lg border border-border bg-white p-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-5">
          <ScoreRing score={result.score} size={88} stroke={8} showLabel />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verdict</div>
            <div className="text-2xl font-bold text-flux-navy">{tier.label === "ACT NOW" ? "Yes — act now" : tier.label === "WATCH" ? "Worth watching" : "Likely noise"}</div>
            <div className="mt-1 text-sm text-muted-foreground">{result.topic}</div>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3 lg:grid-cols-4">
          <Mini label="Growth" value={formatGrowth(result.mention_growth)} icon={TrendingUp} tone={result.mention_growth > 0 ? "up" : "down"} />
          <Mini label="Sentiment" value={`${result.sentiment_positive}%`} />
          <Mini label="Velocity" value={`${result.velocity}x`} icon={VelocityIcon} tone={result.velocity_label === "Accelerating" ? "up" : result.velocity_label === "Declining" ? "down" : "neutral"} />
          <Mini label="Competitors" value={result.competitor_count} icon={Swords} />
        </div>
      </div>

      {/* Trend chart */}
      <div className="rounded-lg border border-border bg-white p-5">
        <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-flux-navy">Mention Volume (30 days)</h3>
        <TrendChart dates={result.trend_dates} mentions={result.trend_mentions} color={tier.color} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Evidence Summary">
            <ul className="space-y-2 text-sm">
              {(result.evidence || []).map((e, i) => <li key={i} className="flex gap-2 text-foreground"><span className="text-flux-red">•</span>{e}</li>)}
            </ul>
          </Panel>
          <Panel title="FLUX Recommendation">
            <div className="flex gap-3 rounded-md bg-flux-navy p-4 text-white">
              <ArrowRight className="h-5 w-5 shrink-0 text-flux-red" />
              <p className="text-sm leading-relaxed text-white/90">{result.recommendation}</p>
            </div>
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Lifecycle Stage">
            <div className="flex items-center gap-2 text-sm font-semibold text-flux-navy"><Clock className="h-4 w-4 text-flux-red" />{result.lifecycle}</div>
            <p className="mt-2 text-xs text-muted-foreground">Competition level: <span className="font-semibold text-foreground">{result.competition_level}</span></p>
          </Panel>
          <Panel title="Target Audience">
            <p className="text-sm text-foreground">{result.audience}</p>
          </Panel>
          <Panel title="White Space">
            <p className="text-sm text-foreground">{result.white_space}</p>
          </Panel>
        </div>
      </div>

      <div className="flex justify-center">
        <button className="flex items-center gap-2 rounded-md bg-flux-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-flux-red-dark"><FileText className="h-4 w-4" /> Generate Full Campaign Brief</button>
      </div>
    </div>
  );
}

function Mini({ label, value, icon: Icon, tone }) {
  const toneClass = tone === "up" ? "text-emerald-600" : tone === "down" ? "text-flux-red" : "text-muted-foreground";
  return (
    <div className="rounded-md border border-border bg-[#F8FAFC] p-3">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center gap-1 font-num text-lg font-bold text-flux-navy">{Icon && <Icon className={`h-3.5 w-3.5 ${toneClass}`} />}{value}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-flux-navy">{title}</h3>
      {children}
    </div>
  );
}
