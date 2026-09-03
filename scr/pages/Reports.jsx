import React, { useState } from "react";
import { Mail, RefreshCw, Send, Calendar, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const FREQUENCIES = [
  { key: "daily", label: "Daily Digest", hint: "What moved and what to do today" },
  { key: "weekly", label: "Weekly Review", hint: "Strategic themes and next week's priorities" },
];

export default function Reports() {
  const { toast } = useToast();
  const [frequency, setFrequency] = useState("daily");
  const [report, setReport] = useState(null);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [recipient, setRecipient] = useState("");

  const buildPrompt = (signals, alerts) => {
    const frame =
      frequency === "daily"
        ? "a daily executive digest: what changed in the last 24 hours, which signals moved, and what the team should do today"
        : "a weekly strategic review: week-over-week themes, a portfolio-level view of all tracked signals, and next week's priorities";
    const dataBlock = signals
      .map(
        (s) =>
          `- ${s.topic} (${s.category}): quality score ${Math.round(s.score)}/100, urgency ${s.urgency}, mention growth ${Math.round(
            s.mention_growth
          )}%, sentiment ${Math.round(s.sentiment_positive)}% positive, velocity ${s.velocity_label}, lifecycle ${
            s.lifecycle
          }, competition ${s.competition_level}. Summary: ${s.summary || "n/a"}`
      )
      .join("\n");
    const alertBlock =
      alerts.map((a) => `- [${a.severity}] ${a.title}: ${a.message}`).join("\n") || "- None";
    return `You are FLUX, an AI marketing intelligence analyst for a Travel & Hospitality marketing team. Write ${frame} in markdown.

Rules:
- Be concrete and reference the actual signals by name and number.
- Short punchy sentences, professional banking-grade tone.
- Sections: ## Executive Summary (max 3 bullets), ## Signals to Act On (top 3 with a why-now rationale), ## Watch List, ## Competitive Movement, ## Recommended Actions (numbered, max 5).
- No tables. Keep it under 500 words.

DATA — Tracked signals (score = Signal Quality Score 0-100):
${dataBlock}

UNREAD ALERTS:
${alertBlock}`;
  };

  const generate = async () => {
    setLoading(true);
    setReport(null);
    try {
      const signals = await base44.entities.Signal.list("-score", 50);
      const alerts = await base44.entities.Alert.filter({ read: false }, "-created_date", 50);
      const res = await base44.integrations.Core.InvokeLLM({ prompt: buildPrompt(signals, alerts) });
      setReport(typeof res === "string" ? res : res.message || "");
      setGeneratedAt(new Date());
    } finally {
      setLoading(false);
    }
  };

  const emailReport = async () => {
    setEmailing(true);
    try {
      let to = recipient.trim();
      if (!to) {
        try {
          to = (await base44.auth.me()).email;
        } catch (e) {
          to = "";
        }
      }
      if (!to) {
        toast({
          title: "Add a recipient email first",
          description: "Enter the address you want the report sent to",
          variant: "destructive",
        });
        return;
      }
      const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      await base44.integrations.Core.SendEmail({
        to,
        from_name: "FLUX Intelligence",
        subject: `FLUX ${frequency === "daily" ? "Daily" : "Weekly"} Marketing Intelligence — ${dateStr}`,
        body: report,
      });
      toast({ title: "Report sent", description: `Delivered to ${to}` });
    } catch (e) {
      toast({
        title: "Couldn't send the report",
        description: "Email delivery to this address may be restricted on your current plan.",
        variant: "destructive",
      });
    } finally {
      setEmailing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-extrabold text-flux-navy">Summary Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-compiled digest of your tracked signals and alerts — preview it, then send it to your inbox.
        </p>
      </div>

      {/* Frequency + generate */}
      <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f.key}
                onClick={() => setFrequency(f.key)}
                className={`rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${
                  frequency === f.key
                    ? "border-flux-navy bg-flux-navy text-white"
                    : "border-border bg-white text-flux-navy hover:border-flux-navy/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button onClick={generate} disabled={loading} className="bg-flux-red text-white hover:bg-flux-red-dark">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {loading ? "Compiling…" : report ? "Regenerate" : "Generate Report"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {FREQUENCIES.find((f) => f.key === frequency).hint}
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mt-6 flex flex-col items-center rounded-lg border border-border bg-white py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-flux-red" />
          <p className="mt-3 text-sm font-medium text-flux-navy">FLUX is compiling your {frequency} report…</p>
          <p className="text-xs text-muted-foreground">Scoring signals, alerts and competitive movement</p>
        </div>
      )}

      {/* Report preview */}
      {report && !loading && (
        <div className="mt-6 rounded-lg border border-border bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Generated {generatedAt?.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                type="email"
                placeholder="Recipient email (optional)"
                className="h-8 w-52 text-xs"
              />
              <Button variant="outline" size="sm" onClick={generate} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" /> Regenerate
              </Button>
              <Button
                size="sm"
                onClick={emailReport}
                disabled={emailing}
                className="gap-1.5 bg-flux-red text-white hover:bg-flux-red-dark"
              >
                {emailing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Email to me
              </Button>
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="flux-md max-w-none">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!report && !loading && (
        <div className="mt-6 flex flex-col items-center rounded-lg border border-dashed border-border bg-white py-16 text-center shadow-sm">
          <Mail className="h-8 w-8 text-flux-slate" />
          <p className="mt-3 text-sm font-medium text-flux-navy">No report yet</p>
          <p className="text-xs text-muted-foreground">Pick a cadence above and generate your first digest</p>
        </div>
      )}
    </div>
  );
}
