import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FileText, Loader2, Copy, Check, Mail, Share2, PenLine, Newspaper, Megaphone, Video, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

const TEMPLATE_TYPES = [
  { id: "email", label: "Email Newsletter", icon: Mail, desc: "Subject lines, body copy, CTAs" },
  { id: "social", label: "Social Media Campaign", icon: Share2, desc: "7-14 days of posts with hashtags" },
  { id: "blog", label: "Blog Post", icon: PenLine, desc: "Outline + full draft with SEO" },
  { id: "press", label: "Press Release", icon: Newspaper, desc: "Quotes, data, distribution" },
  { id: "video", label: "Video Script", icon: Video, desc: "60-90s script with shot list" },
  { id: "ads", label: "Paid Ad Copy", icon: Megaphone, desc: "Google, Meta, LinkedIn ads" },
];

export default function Templates() {
  const [params] = useSearchParams();
  const [signals, setSignals] = useState([]);
  const [signalId, setSignalId] = useState(params.get("signal") || "");
  const [type, setType] = useState("email");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    base44.entities.Signal.list("-score", 50).then((s) => {
      setSignals(s);
      if (!signalId && s.length) setSignalId(s[0].id);
    });
  }, []);

  const signal = signals.find((s) => s.id === signalId);

  const generate = async () => {
    if (!signal) return;
    setLoading(true);
    setOutput(null);
    const tpl = TEMPLATE_TYPES.find((t) => t.id === type);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FLUX, a marketing content generator. Generate a complete, ready-to-use ${tpl.label} for this campaign signal. Be specific and production-ready.

SIGNAL:
- Topic: ${signal.topic}
- Category: ${signal.category}
- Score: ${signal.score}/100, Urgency: ${signal.urgency}
- Sentiment: ${signal.sentiment_positive}% positive
- Recommendation: ${signal.recommendation}

Generate a polished ${tpl.label}. Use markdown formatting with clear headers. Include realistic copy, not placeholders. For social, provide 7 days of posts. For ads, provide copy for Google, Meta, and LinkedIn.`,
      });
      setOutput(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (signalId && signal) generate();
  }, [signalId, type, signal]);

  const copy = () => { if (output) { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); } };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-flux-red"><FileText className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-widest">Content Templates</span></div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-flux-navy">Ready-to-go marketing assets</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">One-click generation of complete, ready-to-use content from any signal.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Controls */}
        <div className="space-y-5">
          <div className="rounded-lg border border-border bg-white p-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Signal</label>
            <select value={signalId} onChange={(e) => setSignalId(e.target.value)} className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-flux-red/50">
              {signals.map((s) => <option key={s.id} value={s.id}>{s.topic} ({s.score})</option>)}
            </select>
            {signal && <p className="mt-2 text-xs text-muted-foreground">{signal.recommendation}</p>}
          </div>

          <div className="rounded-lg border border-border bg-white p-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Template Type</label>
            <div className="space-y-1.5">
              {TEMPLATE_TYPES.map((t) => {
                const Icon = t.icon;
                const active = type === t.id;
                return (
                  <button key={t.id} onClick={() => setType(t.id)} className={`flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${active ? "border-flux-red bg-flux-red/5" : "border-border hover:border-flux-red/40"}`}>
                    <Icon className={`h-4 w-4 ${active ? "text-flux-red" : "text-muted-foreground"}`} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground">{t.label}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{t.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-border bg-[#F8FAFC] px-5 py-3">
            <div className="text-sm font-bold text-flux-navy">{TEMPLATE_TYPES.find((t) => t.id === type)?.label}</div>
            {output && (
              <div className="flex gap-2">
                <button onClick={generate} disabled={loading} className="flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-flux-navy hover:border-flux-red/40 disabled:opacity-50"><RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Regenerate</button>
                <button onClick={copy} className="flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-flux-navy hover:border-flux-red/40">{copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />} Copy</button>
              </div>
            )}
          </div>
          <div className="min-h-[400px] rounded-b-lg border border-border bg-white p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-flux-red" />
                <p className="mt-4 text-sm font-medium text-flux-navy">Generating {TEMPLATE_TYPES.find((t) => t.id === type)?.label}…</p>
              </div>
            ) : output ? (
              <div className="flux-md max-w-none">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
            ) : (
              <div className="py-24 text-center text-sm text-muted-foreground">Select a signal and template type to generate content.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
