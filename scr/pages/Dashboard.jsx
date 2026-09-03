import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Radar, ArrowRight, Sparkles, AlertTriangle, TrendingUp, Activity, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SignalCard from "@/components/flux/SignalCard";
import { getTier, URGENCY_STYLES } from "@/lib/fluxUtils";

export default function Dashboard() {
  const [signals, setSignals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      base44.entities.Signal.list("-score", 50),
      base44.entities.Alert.list("-created_date", 6),
    ])
      .then(([s, a]) => {
        setSignals(s);
        setAlerts(a);
      })
      .finally(() => setLoading(false));
  }, []);

  const actNow = signals.filter((s) => s.score >= 80);
  const watch = signals.filter((s) => s.score >= 60 && s.score < 80);
  const monitor = signals.filter((s) => s.score < 60);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/validate?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-flux-red">
          <Radar className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Signal Radar</span>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-flux-navy">Market signals, ranked by opportunity</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          FLUX continuously monitors search, social, news, and competitor activity — turning the noise into a single, scored action.
        </p>
      </div>

      {/* Validate search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-white p-2 shadow-sm focus-within:border-flux-red/50">
          <Search className="ml-2 h-5 w-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Is 'bleisure travel' a good trend to target? Search any topic…"
            className="flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" className="flex items-center gap-1.5 rounded-md bg-flux-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-flux-red-dark">
            <Sparkles className="h-4 w-4" /> Validate
          </button>
        </div>
      </form>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Zap} label="Act Now" value={actNow.length} tone="red" />
        <StatCard icon={Activity} label="Watch" value={watch.length} tone="amber" />
        <StatCard icon={Radar} label="Monitoring" value={monitor.length} tone="slate" />
        <StatCard icon={TrendingUp} label="Avg. Score" value={signals.length ? Math.round(signals.reduce((a, s) => a + s.score, 0) / signals.length) : 0} suffix="/100" tone="navy" />
      </div>

      {loading ? (
        <LoadingGrid />
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Section title="Act Now" subtitle="Clear opportunity with high potential" accent="#DB0011" count={actNow.length}>
              <div className="grid gap-4 sm:grid-cols-2">{actNow.map((s) => <SignalCard key={s.id} signal={s} />)}</div>
            </Section>
            <Section title="Watch" subtitle="Monitor velocity — opportunity may be emerging" accent="#D89B2A" count={watch.length}>
              <div className="grid gap-4 sm:grid-cols-2">{watch.map((s) => <SignalCard key={s.id} signal={s} />)}</div>
            </Section>
            {monitor.length > 0 && (
              <Section title="Monitor" subtitle="Low urgency — keep on radar" accent="#6B7A8F" count={monitor.length}>
                <div className="grid gap-4 sm:grid-cols-2">{monitor.map((s) => <SignalCard key={s.id} signal={s} />)}</div>
              </Section>
            )}
          </div>

          {/* Alerts feed */}
          <div>
            <div className="sticky top-24">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-flux-navy">
                  <AlertTriangle className="h-4 w-4 text-flux-red" /> Alert Feed
                </h2>
                <Link to="/alerts" className="text-xs font-medium text-flux-red hover:underline">View all</Link>
              </div>
              <div className="space-y-2.5">
                {alerts.length === 0 && <p className="rounded-lg border border-border bg-white p-4 text-sm text-muted-foreground">No alerts yet.</p>}
                {alerts.map((a) => <AlertItem key={a.id} alert={a} />)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix = "", tone }) {
  const tones = { red: "text-flux-red bg-flux-red/10", amber: "text-flux-amber bg-flux-amber/10", slate: "text-flux-slate bg-flux-slate/10", navy: "text-flux-navy bg-flux-navy/10" };
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-md ${tones[tone]}`}><Icon className="h-4 w-4" /></div>
      </div>
      <div className="mt-2 font-num text-2xl font-bold text-flux-navy">{value}<span className="text-sm font-medium text-muted-foreground">{suffix}</span></div>
    </div>
  );
}

function Section({ title, subtitle, accent, count, children }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
            <h2 className="text-lg font-bold text-flux-navy">{title}</h2>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">{count}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function AlertItem({ alert }) {
  const s = URGENCY_STYLES[alert.severity] || URGENCY_STYLES.MEDIUM;
  return (
    <Link to={alert.signal_id ? `/signals/${alert.signal_id}` : "/alerts"} className="block rounded-lg border border-border bg-white p-3 transition-colors hover:border-flux-red/40">
      <div className="flex items-start gap-2">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">{alert.title}</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{alert.message}</p>
        </div>
      </div>
    </Link>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-48 animate-pulse rounded-lg border border-border bg-white/50" />
      ))}
    </div>
  );
}
