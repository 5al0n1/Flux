import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Radar, Search, GitCompare, FileText, Bell, LayoutDashboard, Menu, X, Activity, HeartPulse, ClipboardList } from "lucide-react";
import { base44 } from "@/api/base44Client";

const NAV = [
  { to: "/", label: "Signal Radar", icon: Radar },
  { to: "/validate", label: "Trend Validation", icon: Search },
  { to: "/compare", label: "Compare Trends", icon: GitCompare },
  { to: "/templates", label: "Content Templates", icon: FileText },
  { to: "/health", label: "Health Monitor", icon: HeartPulse },
  { to: "/reports", label: "Reports", icon: ClipboardList },
  { to: "/alerts", label: "Alerts", icon: Bell },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    base44.entities.Alert.filter({ read: false }, "-created_date", 50)
      .then((res) => setUnread(res.length))
      .catch(() => {});
  }, [location.pathname]);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#F4F6F9]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-flux-navy text-white transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-flux-red">
            <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-lg font-extrabold tracking-tight leading-none">FLUX</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-white/50">Marketing Intelligence</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {NAV.map((item) => {
            const active = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-flux-red text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {item.label}
                {item.to === "/alerts" && unread > 0 && (
                  <span className="ml-auto rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">{unread}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-md bg-white/5 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Workspace</div>
            <div className="mt-1 text-sm font-medium">Travel &amp; Hospitality</div>
          </div>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-white/90 px-4 backdrop-blur lg:px-8">
          <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="hidden flex-1 md:block">
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
          </div>
          <Link
            to="/validate"
            className="flex flex-1 items-center gap-2 rounded-md border border-border bg-[#F4F6F9] px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-flux-red/40 md:flex-none md:w-80"
          >
            <Search className="h-4 w-4" />
            <span className="truncate">Is this trend good? Search any topic…</span>
          </Link>
          <Link to="/alerts" className="relative rounded-md p-2 text-muted-foreground hover:bg-secondary">
            <Bell className="h-5 w-5" />
            {unread > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-flux-red" />}
          </Link>
          <div className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-flux-navy text-[11px] font-bold text-white">CM</div>
            <div className="hidden text-left sm:block">
              <div className="text-xs font-semibold leading-tight">Campaign Mgr</div>
              <div className="text-[10px] text-muted-foreground">Enterprise</div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}