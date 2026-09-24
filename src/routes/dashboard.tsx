import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, MessageCircle, Mic, PackageSearch, Send, TrendingUp, Users } from "lucide-react";

import { listDemands, notifyDemandCustomers, setDemandStatus } from "@/lib/demand.functions";
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
const STATUS_STYLE: Record<string, string> = {
  new: "bg-accent/25 text-accent-foreground",
  ordering: "bg-primary/15 text-primary",
  stocked: "bg-success/15 text-success",
  ignored: "bg-destructive/15 text-destructive",
};

const STATUS_SELECT_STYLE: Record<string, string> = {
  stocked: "border-success/40 bg-success/10 text-success",
  ignored: "border-destructive/40 bg-destructive/10 text-destructive",
};

function Dashboard() {
  const qc = useQueryClient();
  const fetchRequests = useServerFn(listDemands);
  const updateStatus = useServerFn(setDemandStatus);
  const sendAlerts = useServerFn(notifyDemandCustomers);

  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ["demand_requests"],
    queryFn: async () => (await fetchRequests()) as Row[],
    // The table is server-only now, so we poll instead of a browser realtime
    // subscription. Two seconds still feels instant at the counter.
    refetchInterval: 2000,
  });

  // Group requests by product so the owner sees demand, not raw events.
  const grouped = Object.values(
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
  ).sort((a, b) => b.count - a.count || +new Date(b.latest) - +new Date(a.latest));

  const [notice, setNotice] = useState<string | null>(null);
  const [sendingProduct, setSendingProduct] = useState<string | null>(null);

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

  const todayCount = rows.filter(
    (r) => new Date(r.created_at).toDateString() === new Date().toDateString(),
  ).length;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
        <div>
          <p className="font-display text-lg font-bold">DemandDrop</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Sharma General Store · Owner view</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Mic className="size-3.5" />
          Counter screen
        </Link>
      </header>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Demand you can act on.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ranked customer requests, refreshed every two seconds.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary uppercase">
          <span className="size-2 rounded-full bg-live animate-pulse" />
          Live demand
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat icon={<Users className="size-4" />} label="Total requests" value={rows.length} />
        <Stat icon={<PackageSearch className="size-4" />} label="Unique products" value={grouped.length} />
        <Stat icon={<TrendingUp className="size-4" />} label="Today" value={todayCount} />
      </div>

      {notice && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
          <MessageCircle className="size-4 shrink-0" />
          {notice}
        </div>
      )}

      <div className="surface mt-6 overflow-hidden rounded-xl">
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
        ) : grouped.length === 0 ? (
          <div className="p-12 text-center">
            <PackageSearch className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No requests yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Open the counter screen and speak an item — it will appear here instantly.
            </p>
            <Button asChild className="mt-4">
              <Link to="/">Open counter screen</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {grouped.map((g) => (
              <li key={g.product} className="flex flex-wrap items-center gap-3 p-4 transition-colors hover:bg-secondary/40 sm:px-6">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary font-mono text-lg font-bold text-primary">
                  {g.count}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{g.product}</p>
                  <p className="text-xs text-muted-foreground">
                    {g.category ?? "Other"} · {g.count === 1 ? "1 person asked" : `${g.count} people asked`}
                  </p>
                  {g.waitingContacts.length > 0 && (
                    <div className="mt-1.5 space-y-1 text-xs text-primary">
                      <p className="inline-flex items-center gap-1 font-medium">
                        <MessageCircle className="size-3" />
                        {g.waitingContacts.length === 1 ? "1 customer" : `${g.waitingContacts.length} customers`} waiting for a WhatsApp alert
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
                        {g.waitingContacts.map((contact) => (
                          <span key={contact.id}>+{contact.phone}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[g.status] ?? ""}`}>
                  {STATUS_LABEL[g.status] ?? g.status}
                </span>
                <select
                  aria-label={`Set status for ${g.product}`}
                  value={g.status}
                  onChange={(e) => void setStatus(g.ids, e.target.value)}
                  className={`rounded-lg border bg-card px-2 py-1.5 text-xs font-semibold ${STATUS_SELECT_STYLE[g.status] ?? "border-border text-foreground"}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s} className={STATUS_SELECT_STYLE[s] ?? "text-foreground"}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
                {g.waitingContacts.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void notifyCustomers(g.product, g.waitingContacts.map((contact) => contact.id))}
                    disabled={sendingProduct !== null}
                    className="shrink-0"
                  >
                    {sendingProduct === g.product ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Send />
                    )}
                    Send WhatsApp
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="surface rounded-xl p-4">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 font-mono text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
