/**
 * Shared Proshopp-style app frame: navy panel, left sidebar with sectioned
 * navigation and a top bar for search/page actions. Used by the owner dashboard,
 * the supplier stock view and (with its own nav) the supplier portal.
 */
import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Store } from "lucide-react";

export type ShellNavItem = { to: string; label: string; icon: LucideIcon; dot?: boolean };
export type ShellSection = { label: string; items: ShellNavItem[] };

function NavItemLink({ item, active }: { item: ShellNavItem; active: boolean }) {
  return (
    <Link
      to={item.to}
      aria-current={active ? "page" : undefined}
      className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors lg:py-2.5 ${
        active
          ? "bg-primary text-primary-foreground shadow-[0_8px_20px_-8px_color-mix(in_oklab,var(--color-primary)_60%,transparent)]"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      <item.icon className="size-4 shrink-0" />
      <span className="whitespace-nowrap">{item.label}</span>
      {item.dot && (
        <span className={`ml-auto hidden size-1.5 rounded-full lg:block ${active ? "bg-primary-foreground/70" : "bg-live"}`} />
      )}
    </Link>
  );
}

export function AppShell({
  sections,
  activeTo,
  search,
  topRight,
  footer,
  children,
}: {
  sections: ShellSection[];
  activeTo: string;
  search?: ReactNode;
  topRight?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const allItems = sections.flatMap((s) => s.items);

  return (
    <div className="min-h-screen lg:p-6">
      <div className="mx-auto w-full max-w-[1400px] bg-card lg:rounded-3xl lg:border lg:border-border lg:shadow-[0_50px_140px_-50px_oklch(0.25_0.08_290/0.6)]">
        <div className="lg:grid lg:grid-cols-[16rem_1fr]">
          {/* Sidebar */}
          <aside className="border-b border-border bg-sidebar lg:sticky lg:top-6 lg:flex lg:h-[calc(100vh-3rem)] lg:flex-col lg:rounded-l-3xl lg:border-b-0 lg:border-r">
            <Link to="/" className="flex items-center gap-2.5 px-4 pt-4 lg:px-5 lg:pt-5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Store className="size-4.5" />
              </span>
              <span className="font-display text-lg font-extrabold tracking-tight">DemandDrop</span>
            </Link>

            {/* Mobile: single scrolling nav row */}
            <nav className="flex gap-1 overflow-x-auto px-2 py-3 lg:hidden">
              {allItems.map((item) => (
                <NavItemLink key={item.to} item={item} active={item.to === activeTo} />
              ))}
            </nav>

            {/* Desktop: sectioned nav */}
            <nav className="hidden flex-1 overflow-y-auto px-3 pb-4 lg:block">
              {sections.map((section) => (
                <div key={section.label}>
                  <p className="px-3 pb-2 pt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {section.label}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <NavItemLink key={item.to} item={item} active={item.to === activeTo} />
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {footer && <div className="hidden border-t border-border px-5 py-4 lg:block">{footer}</div>}
          </aside>

          {/* Main column */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
              {search}
              <div className="ml-auto flex flex-wrap items-center gap-2">{topRight}</div>
            </div>
            <div className="px-4 pb-12 pt-6 sm:px-6 lg:rounded-r-3xl">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
