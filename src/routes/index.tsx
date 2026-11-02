import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mic,
  LayoutDashboard,
  Warehouse,
  MessageCircle,
  Store,
  ArrowRight,
  TabletSmartphone,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DemandDrop — Voice demand tracking for kirana stores" },
      {
        name: "description",
        content:
          "Customers say what they couldn't find at the counter, the owner sees real demand ranked, and waiting customers get a WhatsApp alert when it's stocked. Counter screen, owner dashboard and supplier portal.",
      },
      { property: "og:title", content: "DemandDrop — Never lose a sale to an empty shelf" },
      {
        property: "og:description",
        content: "Voice-powered demand tracking for India's neighbourhood shops.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const STEPS = [
  {
    icon: Mic,
    title: "Customers ask at the counter",
    body: "They tap and speak — or type — the missing product. AI turns their words into a clean stock request, with their WhatsApp number if they leave one.",
  },
  {
    icon: TrendingUp,
    title: "You act on real demand",
    body: "The dashboard ranks what customers actually asked for. Mark each product Ordering now, Just stocked, or Ignored — and remove what you don't want.",
  },
  {
    icon: MessageCircle,
    title: "Customers hear it first",
    body: "The moment you mark something Just stocked, everyone still waiting for it gets a WhatsApp alert — automatically or with one tap.",
  },
];

const SCREENS = [
  {
    icon: TabletSmartphone,
    to: "/counter",
    label: "Counter screen",
    who: "Store owner only",
    body: "Keep this open on the shop tablet at the billing counter. Customers use it to ask for what's missing.",
  },
  {
    icon: LayoutDashboard,
    to: "/dashboard",
    label: "Owner dashboard",
    who: "Store owner",
    body: "Live demand ranked, status controls, WhatsApp alerts and the supplier stock view.",
  },
  {
    icon: Warehouse,
    to: "/supplier",
    label: "Supplier portal",
    who: "Suppliers",
    body: "Sign in with Google, list products, prices and stock — your items show up in customer suggestions instantly.",
  },
];

function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6 sm:px-8 sm:py-8">
      <header className="flex items-center justify-between border-b border-border pb-5">
        <p className="font-display flex items-center gap-2 text-lg font-bold">
          <Store className="size-5 text-primary" />
          DemandDrop
        </p>
        <nav className="flex items-center gap-2">
          <Link
            to="/supplier"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Warehouse className="size-3.5" />
            Supplier
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <LayoutDashboard className="size-3.5" />
            Owner
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto mt-12 max-w-2xl text-center sm:mt-16">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary uppercase">
          <span className="size-2 rounded-full bg-live animate-pulse" />
          Built for India's neighbourhood shops
        </div>
        <h1 className="text-3xl leading-tight font-bold sm:text-5xl">
          Never lose a sale to an empty shelf.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          A customer asks for something you don't have. DemandDrop remembers it, ranks what your shop
          really needs, and WhatsApps the customer the day you restock.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-14 w-full sm:w-auto">
            <Link to="/counter">
              <Mic />
              Open the counter screen
              <ArrowRight />
            </Link>
          </Button>
          <div className="flex gap-3">
            <Button asChild variant="secondary" size="lg" className="h-14">
              <Link to="/dashboard">
                <LayoutDashboard />
                Owner dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14">
              <Link to="/supplier">
                <Warehouse />
                Supplier portal
              </Link>
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          The counter screen is for the store owner — keep it open on the shop tablet.
        </p>
      </section>

      {/* How it works */}
      <section className="mt-16">
        <h2 className="font-display text-center text-xl font-bold sm:text-2xl">How it works</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="surface rounded-xl p-5">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <step.icon className="size-4.5" />
                </span>
                <span className="font-mono text-xs font-bold text-muted-foreground">0{i + 1}</span>
              </div>
              <p className="mt-3 font-semibold">{step.title}</p>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Screens */}
      <section className="mt-12">
        <h2 className="font-display text-center text-xl font-bold sm:text-2xl">Three screens, three jobs</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {SCREENS.map((screen) => (
            <Link
              key={screen.to}
              to={screen.to}
              className="surface group rounded-xl p-5 transition-colors hover:border-primary/50"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
                  <screen.icon className="size-4.5" />
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase">
                  {screen.who}
                </span>
              </div>
              <p className="mt-3 font-semibold">{screen.label}</p>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{screen.body}</p>
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                Open
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </p>
            </Link>
          ))}
        </div>
      </section>

      <p className="mt-auto pt-12 text-center text-[11px] text-muted-foreground">
        DemandDrop · Voice demand + WhatsApp restock alerts
      </p>
    </main>
  );
}
