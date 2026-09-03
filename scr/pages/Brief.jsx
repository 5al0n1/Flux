import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, FileText, Download, Copy, RefreshCw, Mail, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getTier } from "@/lib/fluxUtils";

export default function Brief() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [signal, setSignal] = useState(null);
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    base44.entities.Signal.get(id).then((s) => {
      setSignal(s);
      setLoading(false);
      generate(s);
    });
  }, [id]);

  const generate = async (sig = signal) => {
    if (!sig) return;
    setGenerating(true);
    setBrief(null);
    const prompt = `You are FLUX, a marketing intelligence agent. Generate a complete, ready-to-execute campaign brief for the following market signal. Be specific, actionable, and concise. Use realistic numbers.

SIGNAL:
- Topic: ${sig.topic}
- Category: ${sig.category}
- Signal Quality Score: ${sig.score}/100
- Urgency: ${sig.urgency}
- Mention growth: ${sig.mention_growth}% over 30 days
- Sentiment: ${sig.sentiment_positive}% positive
- Velocity: ${sig.velocity}x (${sig.velocity_label})
- Competitors active: ${sig.competitor_count} (${(sig.competitors || []).join(", ")})
- Lifecycle: ${sig.lifecycle}
- FLUX recommendation: ${sig.recommendation}

Return ONLY a JSON object with this exact schema:
{
  "campaign_name": string,
  "signal_overview": [string],
  "target_audience": {"demographics": string, "psychographics": string, "pain_points": string, "media_consumption": string},
  "recommended_action": {"action": string, "channels": string, "timing": string, "budget": string},
  "creative_direction": {"concept": string, "theme": string, "visual_direction": string, "messaging": string, "content_formats": string},
  "content_templates": [string],
  "success_metrics": {"primary_kpi": string, "secondary_kpis": string, "projected_roi": string},
  "risk_assessment": {"risks": string, "mitigations": string}
}`;
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            campaign_name: { type: "string" },
            signal_overview: { type: "array", items: { type: "string" } },
            target_audience: { type: "object", properties: { demographics: { type: "string" }, psychographics: { type: "string" }, pain_points: { type: "string" }, media_consumption: { type: "string" } } },
            recommended_action: { type: "object", properties: { action: { type: "string" }, channels: { type: "string" }, timing: { type: "string" }, budget: { type: "string" } } },
            creative_direction: { type: "object", properties: { concept: { type: "string" }, theme: { type: "string" }, visual_direction: { type: "string" }, messaging: { type: "string" }, content_formats: { type: "string" } } },
            content_templates: { type: "array", items: { type: "string" } },
            success_metrics: { type: "object", properties: { primary_kpi: { type: "string" }, secondary_kpis: { type: "string" }, projected_roi: { type: "string" } } },
            risk_assessment: { type: "object", properties: { risks: { type: "string" }, mitigations: { type: "string" } } },
          },
        },
      });
      setBrief(res);
    } finally {
      setGenerating(false);
    }
  };

  const copyBrief = () => {
    if (!brief) return;
    navigator.clipboard.writeText(JSON.stringify(brief, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="mx-auto max-w-4xl animate-pulse space-y-4 py-20"><div className="h-10 w-1/2 rounded bg-white/60" /></div>;
  if (!signal) return <div className="py-20 text-center text-muted-foreground">Signal not found.</div>;

  const tier = getTier(signal.score);

  return (
    <div className="mx-auto max-w-4xl">
      <button onClick={() => navigate(-1)} className="mb-5 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-flux-red">
        <ArrowLeft className="h-4 w-4" /> Back to signal
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-flux-red"><FileText className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-widest">Campaign Brief</span></div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-flux-navy">{brief?.campaign_name || "Generating brief…"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signal: {signal.topic} · Score {signal.score}/100 · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => generate()} disabled={generating} className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-xs font-semibold text-flux-navy hover:border-flux-red/40 disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${generating ? "animate-spin" : ""}`} /> Regenerate
          </button>
          <button onClick={copyBrief} disabled={!brief} className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-xs font-semibold text-flux-navy hover:border-flux-red/40 disabled:opacity-50">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />} Copy
          </button>
        </div>
      </div>

      {generating && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-white py-24">
          <Loader2 className="h-8 w-8 animate-spin text-flux-red" />
          <p className="mt-4 text-sm font-medium text-flux-navy">FLUX is composing your campaign brief…</p>
          <p className="mt-1 text-xs text-muted-foreground">Analyzing signal evidence, audience, and competitive gaps</p>
        </div>
      )}

      {brief && !generating && (
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <div className="border-b-2 border-flux-red bg-flux-navy px-6 py-4 text-white">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">Campaign Brief</div>
            <div className="text-lg font-bold">{brief.campaign_name}</div>
          </div>

          <div className="divide-y divide-border">
            <Section icon="📍" title="Signal Overview">
              <ul className="space-y-1.5 text-sm text-foreground">
                {(brief.signal_overview || []).map((line, i) => <li key={i} className="flex gap-2"><span className="text-flux-red">•</span>{line}</li>)}
              </ul>
            </Section>

            <Section icon="🎯" title="Target Audience">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Demographics" value={brief.target_audience?.demographics} />
                <Field label="Psychographics" value={brief.target_audience?.psychographics} />
                <Field label="Pain Points" value={brief.target_audience?.pain_points} />
                <Field label="Media Consumption" value={brief.target_audience?.media_consumption} />
              </div>
            </Section>

            <Section icon="⚡" title="Recommended Action">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Action" value={brief.recommended_action?.action} />
                <Field label="Channels" value={brief.recommended_action?.channels} />
                <Field label="Timing" value={brief.recommended_action?.timing} />
                <Field label="Budget" value={brief.recommended_action?.budget} />
              </div>
            </Section>

            <Section icon="🎨" title="Creative Direction">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Concept" value={brief.creative_direction?.concept} />
                <Field label="Theme" value={brief.creative_direction?.theme} />
                <Field label="Visual Direction" value={brief.creative_direction?.visual_direction} />
                <Field label="Messaging" value={brief.creative_direction?.messaging} />
                <Field label="Content Formats" value={brief.creative_direction?.content_formats} full />
              </div>
            </Section>

            <Section icon="📤" title="Ready-to-Use Templates">
              <div className="flex flex-wrap gap-2">
                {(brief.content_templates || []).map((t, i) => (
                  <span key={i} className="flex items-center gap-1.5 rounded-md border border-border bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-foreground"><Mail className="h-3 w-3 text-flux-red" />{t}</span>
                ))}
              </div>
            </Section>

            <Section icon="📈" title="Success Metrics">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Primary KPI" value={brief.success_metrics?.primary_kpi} />
                <Field label="Secondary KPIs" value={brief.success_metrics?.secondary_kpis} />
                <Field label="Projected ROI" value={brief.success_metrics?.projected_roi} />
              </div>
            </Section>

            <Section icon="⚠️" title="Risk Assessment">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Risks" value={brief.risk_assessment?.risks} />
                <Field label="Mitigations" value={brief.risk_assessment?.mitigations} />
              </div>
            </Section>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-border bg-[#F8FAFC] px-6 py-4">
            <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-md bg-flux-red px-4 py-2 text-xs font-semibold text-white hover:bg-flux-red-dark"><Download className="h-3.5 w-3.5" /> Export PDF</button>
            <button className="flex items-center gap-1.5 rounded-md border border-border bg-white px-4 py-2 text-xs font-semibold text-flux-navy hover:border-flux-red/40"><Mail className="h-3.5 w-3.5" /> Send to Team</button>
            <Link to={`/templates?signal=${signal.id}`} className="flex items-center gap-1.5 rounded-md border border-border bg-white px-4 py-2 text-xs font-semibold text-flux-navy hover:border-flux-red/40"><FileText className="h-3.5 w-3.5" /> Generate Content</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="px-6 py-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-flux-navy"><span>{icon}</span>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm text-foreground">{value || "—"}</div>
    </div>
  );
}