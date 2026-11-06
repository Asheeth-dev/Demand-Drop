import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  Clock,
  Info,
  LayoutDashboard,
  Loader2,
  MessageCircle,
  Mic,
  PackageSearch,
  Search,
  Send,
  Store,
  Trash2,
  TrendingUp,
  Users,
  Warehouse,
} from "lucide-react";

import { deleteDemands, listDemands, notifyDemandCustomers, setDemandStatus } from "@/lib/demand.functions";
import { AppShell } from "@/components/app-shell";
import { NAV_SECTIONS } from "@/components/owner-nav";
import { categoryStyle } from "@/lib/inventory-ui";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Owner Dashboard — DemandDrop" },
      {
        name: "description",
        content:
          "See exactly which products your customers asked for and couldn't find, ranked by how many people wanted them.",
      },
      { property: "og:title", content: "Owner Dashboard — DemandDrop" },
      {
        property: "og:description",
        content: "Live demand from your counter, ranked by customer requests.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Row = {
  id: string;
  transcript: string;
  product_name: string;
  category: string | null;
  status: string;
  created_at: string;
  customer_phone: string | null;
  notified_at: string | null;
};

const STATUSES = ["new", "ordering", "stocked", "ignored"] as const;
const STATUS_LABEL: Record<string, string> = {
  new: "New",
  ordering: "Ordering now",
  stocked: "Just stocked",
  ignored: "Ignored",
};
// Selected status badge colors, exactly as the owner asked: solid fills,
// black text. Dropdown options stay plain.
const STATUS_STYLE: Record<string, string> = {
  new: "bg-white text-black",
  ordering: "bg-warning text-black",
  stocked: "bg-success text-black",
  ignored: "bg-destructive text-black",
};
const STATUS_CHART_COLOR: Record<string, string> = {
  new: "var(--color-chart-1)",
  ordering: "var(--color-chart-4)",
  stocked: "var(--color-chart-3)",
  ignored: "var(--color-chart-5)",
};

function Dashboard() {
  const qc = useQueryClient();
  const fetchRequests = useServerFn(listDemands);
  const updateStatus = useServerFn(setDemandStatus);
  const sendAlerts = useServerFn(notifyDemandCustomers);
  const removeDemands = useServerFn(deleteDemands);

  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [sendingProduct, setSendingProduct] = useState<string | null>(null);
  const [removingProduct, setRemovingProduct] = useState<string | null>(null);

  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ["demand_requests"],
    queryFn: async () => (await fetchRequests()) as Row[],
    // The table is server-only now, so we poll instead of a browser realtime
    // subscription. Two seconds still feels instant at the counter.
    refetchInterval: 2000,
  });

  // Group requests by product so the owner sees demand, not raw events.
  const grouped = useMemo(
    () =>
      Object.values(
        rows.reduce<Record<string, { product: string; category: string | null; count: number; status: string; latest: string; ids: string[]; waitingContacts: { id: string; phone: string }[] }>>(
          (acc, r) => {
            const key = r.product_name.toLowerCase();
            const existing = acc[key];
            if (existing) {
              existing.count += 1;
              existing.ids.push(r.id);
              if (r.status !== "new") existing.status = r.status;
              if (r.customer_phone && !r.notified_at) {
                existing.waitingContacts.push({ id: r.id, phone: r.customer_phone });
              }
            } else {
              acc[key] = {
                product: r.product_name,
                category: r.category,
                count: 1,
                status: r.status,
                latest: r.created_at,
                ids: [r.id],
                waitingContacts:
                  r.customer_phone && !r.notified_at ? [{ id: r.id, phone: r.customer_phone }] : [],
              };
            }
            return acc;
          },
          {},
        ),
      ).sort((a, b) => b.count - a.count || +new Date(b.latest) - +new Date(a.latest)),
    [rows],
  );

  const q = search.trim().toLowerCase();
  const visible = q ? grouped.filter((g) => g.product.toLowerCase().includes(q)) : grouped;

  const todayCount = rows.filter(
    (r) => new Date(r.created_at).toDateString() === new Date().toDateString(),
  ).length;
  const waitingTotal = grouped.reduce((sum, g) => sum + g.waitingContacts.length, 0);

  const hourly = useMemo(() => buildHourlyBuckets(rows), [rows]);
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { new: 0, ordering: 0, stocked: 0, ignored: 0 };
    for (const r of rows) if (r.status in counts) counts[r.status] = (counts[r.status] ?? 0) + 1;
    return counts;
  }, [rows]);
  const waitingGroups = grouped.filter((g) => g.waitingContacts.length > 0);

  async function setStatus(ids: string[], status: string) {
    try {
      const res = await updateStatus({ data: { ids, status } });
      if (status === "stocked") {
        setNotice(
          !res.whatsappConfigured
            ? "Marked as stocked. WhatsApp alerts aren't connected yet, so no messages were sent."
            : res.notified > 0
              ? `Marked as stocked — WhatsApp sent to ${res.notified === 1 ? "1 customer" : `${res.notified} customers`}.`
              : res.failed > 0
                ? "Marked as stocked, but WhatsApp couldn't send the alert. Please try the send button again."
                : "Marked as stocked. Nobody left a WhatsApp number for this one.",
        );
      }
      void qc.invalidateQueries({ queryKey: ["demand_requests"] });
    } catch {
      setNotice("The status couldn't be updated. Please try again.");
    }
  }

  async function notifyCustomers(product: string, ids: string[]) {
    if (sendingProduct) return;
    setSendingProduct(product);
    setNotice(null);
    try {
      const res = await sendAlerts({ data: { ids } });
      setNotice(
        !res.whatsappConfigured
          ? "WhatsApp alerts aren't connected yet, so no messages were sent."
          : res.notified > 0
            ? `WhatsApp sent to ${res.notified === 1 ? "1 customer" : `${res.notified} customers`} waiting for ${product}.`
            : res.failed > 0
              ? "WhatsApp couldn't send the alert. Please try again."
              : "There are no customers still waiting for this alert.",
      );
      void qc.invalidateQueries({ queryKey: ["demand_requests"] });
    } catch {
      setNotice("The WhatsApp message couldn't be sent. Please try again.");
    } finally {
      setSendingProduct(null);
    }
  }

  async function removeGroup(product: string, ids: string[]) {
    if (removingProduct) return;
    if (
      !window.confirm(
        `Remove ${ids.length === 1 ? "the request" : `all ${ids.length} requests`} for ${product} from the demand list? This can't be undone.`,
      )
    ) {
      return;
    }
    setRemovingProduct(product);
    setNotice(null);
    try {
      const res = await removeDemands({ data: { ids } });
      setNotice(`Removed ${product} — ${res.deleted} request${res.deleted === 1 ? "" : "s"} cleared.`);
      void qc.invalidateQueries({ queryKey: ["demand_requests"] });
    } catch {
      setNotice("The product couldn't be removed. Please try again.");
    } finally {
      setRemovingProduct(null);
    }
  }

  return (
    <AppShell
      sections={NAV_SECTIONS.map((s) => ({ ...s, items: [...s.items] }))}
      activeTo="/dashboard"
      search={
        <label className="relative flex w-full max-w-sm items-center">
          <Search className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a product…"
            aria-label="Search the demand list"
            className="h-10 w-full rounded-full border border-border bg-secondary pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </label>
      }
      topRight={
        <span className="inline-flex items-center gap-2 rounded-full border border-live/40 bg-live/10 px-3 py-1.5 text-[11px] font-bold uppercase text-live">
          <span className="size-2 rounded-full bg-live animate-pulse" />
          Live demand
        </span>
      }
      footer={
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Store className="size-3.5" />
          Powered by DemandDrop
        </p>
      }
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ranked customer requests, refreshed every two seconds.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat icon={<Users className="size-4" />} label="Total requests" value={rows.length} />
        <Stat icon={<PackageSearch className="size-4" />} label="Unique products" value={grouped.length} />
        <Stat icon={<Clock className="size-4" />} label="Today" value={todayCount} />
        <Stat icon={<BellRing className="size-4" />} label="Waiting for alert" value={waitingTotal} />
      </div>

      {/* Charts */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <section className="surface rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full border border-primary/40 text-primary">
              <TrendingUp className="size-4" />
            </span>
            <h2 className="text-sm font-bold">Requests by hour</h2>
            <span className="ml-auto text-[11px] text-muted-foreground">Last 12 hours</span>
          </div>
          <HourChart buckets={hourly} />
        </section>
        <section className="surface rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full border border-primary/40 text-primary">
              <Info className="size-4" />
            </span>
            <h2 className="text-sm font-bold">Request status</h2>
          </div>
          <StatusDonut counts={statusCounts} />
        </section>
      </div>

      {notice && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-live/40 bg-live/10 px-4 py-3 text-sm font-medium text-live">
          <MessageCircle className="size-4 shrink-0" />
          {notice}
        </div>
      )}

      {/* Demand table + waiting panel */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <section className="surface overflow-hidden rounded-2xl">
          <div className="flex items-center gap-2 px-5 pb-3 pt-4">
            <span className="flex size-8 items-center justify-center rounded-full border border-primary/40 text-primary">
              <PackageSearch className="size-4" />
            </span>
            <h2 className="text-sm font-bold">Demand list</h2>
            {q && <span className="text-[11px] text-muted-foreground">filtered</span>}
          </div>
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : error ? (
            <div className="p-10 text-center text-sm text-destructive">
              Couldn't load requests. Refresh the page to try again.
            </div>
          ) : visible.length === 0 ? (
            <div className="p-12 text-center">
              <PackageSearch className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 font-medium">{q ? "No product matches that search" : "No requests yet"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {q ? "Try another name — the charts above cover every request." : "Open the counter screen and speak or type an item — it will appear here instantly."}
              </p>
              {!q && (
                <Button asChild className="mt-4">
                  <Link to="/counter">Open counter screen</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="thead-mint text-left text-xs font-bold">
                    <th className="px-5 py-3">Product</th>
                    <th className="px-3 py-3">Asked</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((g) => (
                    <tr key={g.product} className="border-t border-border transition-colors hover:bg-secondary/40">
                      <td className="max-w-[230px] px-5 py-3">
                        <p className="truncate font-semibold">{g.product}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${categoryStyle(g.category)}`}>
                            {g.category ?? "Other"}
                          </span>
                          {g.waitingContacts.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-live">
                              <MessageCircle className="size-3" />
                              {g.waitingContacts.length} waiting
                            </span>
                          )}
                          <div className="flex flex-wrap gap-x-2 font-mono text-[11px] text-muted-foreground">
                            {g.waitingContacts.map((c) => (
                              <span key={c.id}>+{c.phone}</span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-mono text-base font-bold text-primary">{g.count}</span>
                        <span className="ml-1 text-[11px] text-muted-foreground">
                          {g.count === 1 ? "person" : "people"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[g.status] ?? ""}`}>
                          {STATUS_LABEL[g.status] ?? g.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            aria-label={`Set status for ${g.product}`}
                            value={g.status}
                            onChange={(e) => void setStatus(g.ids, e.target.value)}
                            className="w-[7.2rem] rounded-lg border border-border bg-card px-2 py-1.5 text-xs font-semibold text-foreground"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s} className="text-foreground">
                                {STATUS_LABEL[s]}
                              </option>
                            ))}
                          </select>
                          {g.waitingContacts.length > 0 && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => void notifyCustomers(g.product, g.waitingContacts.map((c) => c.id))}
                              disabled={sendingProduct !== null || removingProduct !== null}
                              className="shrink-0"
                              aria-label={`Send WhatsApp for ${g.product}`}
                            >
                              {sendingProduct === g.product ? <Loader2 className="animate-spin" /> : <Send />}
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => void removeGroup(g.product, g.ids)}
                            disabled={removingProduct !== null}
                            className="shrink-0 text-destructive"
                            aria-label={`Remove ${g.product} from the demand list`}
                          >
                            {removingProduct === g.product ? <Loader2 className="animate-spin" /> : <Trash2 />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="surface overflow-hidden rounded-2xl">
          <div className="flex items-center gap-2 px-5 pb-3 pt-4">
            <span className="flex size-8 items-center justify-center rounded-full border border-live/40 text-live">
              <BellRing className="size-4" />
            </span>
            <h2 className="text-sm font-bold">Waiting on WhatsApp</h2>
            {waitingTotal > 0 && (
              <span className="ml-auto rounded-full bg-live px-2 py-0.5 text-[11px] font-bold text-live-foreground">
                {waitingTotal}
              </span>
            )}
          </div>
          {waitingGroups.length === 0 ? (
            <div className="px-5 pb-8 pt-4 text-center">
              <MessageCircle className="mx-auto size-7 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Nobody is waiting right now. When customers leave their number, they appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {waitingGroups.map((g) => (
                <li key={g.product} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{g.product}</p>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[g.status] ?? ""}`}>
                      {STATUS_LABEL[g.status] ?? g.status}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 font-mono text-[11px] text-muted-foreground">
                    {g.waitingContacts.map((c) => (
                      <span key={c.id}>+{c.phone}</span>
                    ))}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="mt-2 w-full"
                    onClick={() => void notifyCustomers(g.product, g.waitingContacts.map((c) => c.id))}
                    disabled={sendingProduct !== null || removingProduct !== null}
                  >
                    {sendingProduct === g.product ? <Loader2 className="animate-spin" /> : <Send />}
                    Send WhatsApp
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="surface rounded-2xl p-4 transition-colors hover:border-primary/40">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full border border-primary/40 text-primary">
          {icon}
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
        <Info className="ml-auto size-3.5 text-muted-foreground/60" />
      </div>
      <p className="mt-2 font-mono text-2xl font-bold text-foreground">
        <AnimatedNumber value={value} />
      </p>
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = display;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 450);
      setDisplay(Math.round(from + (value - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{display}</>;
}

type HourBucket = { label: string; count: number };

function buildHourlyBuckets(rows: Row[]): HourBucket[] {
  const now = new Date();
  const buckets = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now);
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() - (11 - i));
    const h = d.getHours();
    return { label: `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "am" : "pm"}`, start: d.getTime(), count: 0 };
  });
  for (const r of rows) {
    const t = +new Date(r.created_at);
    for (let i = buckets.length - 1; i >= 0; i--) {
      const bucket = buckets[i];
      if (bucket && t >= bucket.start) {
        bucket.count += 1;
        break;
      }
    }
  }
  return buckets.map(({ label, count }) => ({ label, count }));
}

function HourChart({ buckets }: { buckets: HourBucket[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const W = 620;
  const H = 230;
  const top = 28;
  const bottom = 34;
  const colW = W / buckets.length;
  const barW = colW * 0.52;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label="Requests by hour chart">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      {buckets.map((b, i) => {
        const h = (b.count / max) * (H - top - bottom);
        const x = i * colW + (colW - barW) / 2;
        const y = H - bottom - h;
        const isHover = hover === i;
        return (
          <g key={b.label + i}>
            <text
              x={i * colW + colW / 2}
              y={y - 6}
              textAnchor="middle"
              className="fill-foreground font-mono"
              fontSize="10"
              opacity={hover === null || isHover ? 0.9 : 0.35}
            >
              {b.count}
            </text>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, b.count > 0 ? 4 : 0)}
              rx={5}
              fill="url(#barGrad)"
              opacity={hover === null || isHover ? 1 : 0.45}
              className="transition-opacity"
            />
            <text
              x={i * colW + colW / 2}
              y={H - 12}
              textAnchor="middle"
              fontSize="10"
              className={isHover ? "fill-foreground" : "fill-muted-foreground"}
            >
              {b.label}
            </text>
            {/* Full-column hover target */}
            <rect
              x={i * colW}
              y={0}
              width={colW}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          </g>
        );
      })}
    </svg>
  );
}

function StatusDonut({ counts }: { counts: Record<string, number> }) {
  const [hover, setHover] = useState<string | null>(null);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const segments = STATUSES.map((s) => ({
    key: s,
    label: STATUS_LABEL[s],
    color: STATUS_CHART_COLOR[s],
    value: counts[s] ?? 0,
  })).filter((s) => s.value > 0);

  const size = 190;
  const r = 72;
  const stroke = 26;
  const C = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-44 shrink-0 -rotate-90" role="img" aria-label="Request status chart">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-secondary)" strokeWidth={stroke} />
        {segments.length === 0 ? (
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-secondary)" strokeWidth={stroke} />
        ) : (
          segments.map((s) => {
            const frac = s.value / Math.max(1, total);
            const dash = Math.max(frac * C - 4, 2);
            const el = (
              <circle
                key={s.key}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={hover && hover !== s.key ? stroke - 6 : stroke}
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                opacity={hover && hover !== s.key ? 0.4 : 1}
                className="transition-all"
                onMouseEnter={() => setHover(s.key)}
                onMouseLeave={() => setHover(null)}
              />
            );
            offset += frac * C;
            return el;
          })
        )}
      </svg>
      <ul className="w-full space-y-1.5">
        {STATUSES.map((s) => {
          const value = counts[s] ?? 0;
          const pct = total > 0 ? Math.round((value / total) * 100) : 0;
          const dim = hover && hover !== s;
          return (
            <li
              key={s}
              onMouseEnter={() => value > 0 && setHover(s)}
              onMouseLeave={() => setHover(null)}
              className={`flex items-center gap-2.5 rounded-lg px-2 py-1 text-sm transition-opacity ${dim ? "opacity-50" : ""}`}
            >
              <span className="size-3 shrink-0 rounded-[4px]" style={{ background: STATUS_CHART_COLOR[s] }} />
              <span className="truncate font-medium">{STATUS_LABEL[s]}</span>
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                {value > 0 ? `${pct}%` : "—"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
