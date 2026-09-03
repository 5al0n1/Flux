import React, { useEffect, useState } from "react";
import { RefreshCw, AlertTriangle, Eye, TrendingUp, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import HealthSignalCard from "@/components/flux/HealthSignalCard";

const GROUPS = [
  {
    key: "Declining",
    title: "At Risk",
    subtitle: "Losing momentum — generate a revival play before reallocating budget",
    icon: AlertTriangle,
    accent: "bg-flux-red",
  },
  {
    key: "Stable",
    title: "Watch",
    subtitle: "Stable velocity — monitor for shifts in either direction",
    icon: Eye,
    accent: "bg-flux-amber",
  },
  {
    key: "Accelerating",
    title: "Healthy",
    subtitle: "Gaining momentum — double down while the window is open",
    icon: TrendingUp,
    accent: "bg-emerald-600",
  },
];

export default function HealthMonitor() {
  const { toast } = useToast();
  const [signals, setSignals] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    base44.entities.Signal
      .list("-score", 100)
      .then(setSignals)
      .catch(() => setSignals([]));
  }, []);

  const grouped = (key) => (signals || []).filter((s) => (s.velocity_label || "Stable") === key);

  const runScan = async () => {
    setScanning(true);
    try {
      const declining = grouped("Declining");
      const existing = await base44.entities.Alert.filter({ type: "decline" });
      const flagged = new Set(existing.map((a) => a.signal_id));
      const toFlag = declining.filter((s) => !flagged.has(s.id));
      if (toFlag.length > 0) {
        await base44.entities.Alert.bulkCreate(
          toFlag.map((s) => ({
            title: `Health scan: ${s.topic} is declining`,
            type: "decline",
            severity: s.score >= 60 ? "HIGH" : "MEDIUM",
            signal_id: s.id,
            signal_topic: s.topic,
            message: `${s.topic} velocity is Declining (quality score ${Math.round(
              s.score
            )}). Open the Health Monitor to generate a revival play before reallocating budget.`,
          }))
        );
      }
      toast({
        title: toFlag.length > 0 ? `${toFlag.length} decline alert${toFlag.length > 1 ? "s" : ""} created` : "All clear",
        description:
          toFlag.length > 0 ? "Find them in your Alerts feed" : "No new declining trends since the last scan",
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-flux-navy">Trend Health Monitor</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Portfolio health by velocity — flag declining trends to Alerts and generate AI revival plays.
          </p>
        </div>
        <Button onClick={runScan} disabled={scanning || !signals} className="gap-1.5 bg-flux-navy text-white hover:bg-flux-navy/90">
          {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {scanning ? "Scanning…" : "Run Health Scan"}
        </Button>
      </div>

      {/* Health stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {GROUPS.map((g) => (
          <div key={g.key} className="rounded-lg border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${g.accent}`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{g.title}</span>
            </div>
            <div className="font-num mt-1 text-2xl font-extrabold text-flux-navy">
              {signals === null ? "—" : grouped(g.key).length}
            </div>
          </div>
        ))}
      </div>

      {/* Group sections */}
      {signals === null ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-flux-red" />
        </div>
      ) : (
        <div className="space-y-8">
          {GROUPS.map((g) => {
            const items = grouped(g.key);
            if (items.length === 0) return null;
            const Icon = g.icon;
            return (
              <section key={g.key}>
                <div className="mb-3 flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${g.key === "Declining" ? "text-flux-red" : g.key === "Stable" ? "text-flux-amber" : "text-emerald-600"}`} />
                  <h2 className="font-heading text-base font-bold text-flux-navy">
                    {g.title} <span className="font-num text-flux-slate">({items.length})</span>
                  </h2>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">{g.subtitle}</p>
                <div className="space-y-3">
                  {items.map((s) => (
                    <HealthSignalCard key={s.id} signal={s} showRevival={g.key === "Declining"} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
