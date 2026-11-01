import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Mic,
  Square,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Keyboard,
  LayoutDashboard,
  Warehouse,
  ArrowRight,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";

import { submitDemand, saveNotifyNumber } from "@/lib/demand.functions";
import { suggestCatalogProducts } from "@/lib/catalog";
import { listPublicInventory } from "@/lib/inventory.functions";
import { blobToBase64, useRecorder } from "@/lib/useRecorder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DemandDrop — Tell the shop what you couldn't find" },
      {
        name: "description",
        content:
          "Tap and speak — or type — the product you couldn't find, leave your WhatsApp number, and DemandDrop turns it into a stock request for the shop owner instantly.",
      },
      { property: "og:title", content: "DemandDrop — Speak what's missing" },
      {
        property: "og:description",
        content: "Voice-powered demand tracking for India's small merchants.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CustomerScreen,
});

type Result =
  | {
      kind: "success";
      product: string;
      category: string | null;
      transcript: string;
      requestId: string;
      phoneSaved: boolean;
    }
  | { kind: "unclear"; transcript: string }
  | { kind: "error"; message: string };

function CustomerScreen() {
  const { recording, level, start, stop } = useRecorder();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [text, setText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneState, setPhoneState] = useState<"idle" | "saving" | "saved" | "invalid">("idle");
  const send = useServerFn(submitDemand);
  const saveNumber = useServerFn(saveNotifyNumber);
  const fetchInventory = useServerFn(listPublicInventory);

  // The supplier's live inventory feeds the customer suggestions.
  const { data: inventory } = useQuery({
    queryKey: ["public-inventory"],
    queryFn: () => fetchInventory(),
    staleTime: 30_000,
  });

  const q = text.trim().toLowerCase();
  const inventorySuggestions = q
    ? (inventory ?? [])
        .filter((i) => `${i.product_name} ${i.brand ?? ""}`.toLowerCase().includes(q))
        .slice(0, 4)
        .map((i) => ({
          name: i.product_name,
          category: i.category,
          inv: { price: i.price as number | null, stock: i.stock as number },
        }))
    : [];
  const seenNames = new Set(inventorySuggestions.map((s) => s.name.toLowerCase()));
  type Suggestion = { name: string; category: string; inv?: { price: number | null; stock: number } };
  const suggestions: Suggestion[] = [
    ...inventorySuggestions,
    ...suggestCatalogProducts(text)
      .filter((s) => !seenNames.has(s.name.toLowerCase()))
      .map((s) => ({ name: s.name, category: s.category })),
  ].slice(0, 6);

  async function handleSavePhone(requestId: string) {
    if (!phone.trim() || phoneState === "saving") return;
    setPhoneState("saving");
    try {
      await saveNumber({ data: { requestId, phone: phone.trim() } });
      setPhoneState("saved");
    } catch {
      setPhoneState("invalid");
    }
  }

  async function process(payload: { audioBase64?: string; mimeType?: string; text?: string; phone?: string }) {
    setBusy(true);
    setResult(null);
    try {
      const res = await send({ data: payload });
      if (res.ok) {
        setResult({
          kind: "success",
          product: res.request?.product_name ?? "",
          category: res.request?.category ?? null,
          transcript: res.transcript,
          requestId: res.request?.id ?? "",
          phoneSaved: Boolean(payload.phone),
        });
        if (payload.phone) setPhone("");
        setPhoneState("idle");
      } else {
        setResult({ kind: "unclear", transcript: res.transcript });
      }
    } catch (err) {
      setResult({
        kind: "error",
        message: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleMic() {
    if (busy) return;
    if (!recording) {
      setResult(null);
      try {
        await start();
      } catch {
        setResult({
          kind: "error",
          message: "Microphone access is needed. Allow it, or type the item instead.",
        });
      }
      return;
    }
    const blob = await stop();
    if (!blob) {
      setResult({ kind: "error", message: "That recording was empty — please hold and speak again." });
      return;
    }
    await process({ audioBase64: await blobToBase64(blob), mimeType: "audio/wav" });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-6 sm:px-8 sm:py-8">
      <header className="flex items-center justify-between border-b border-border pb-5">
        <div>
          <p className="font-display text-lg font-bold">DemandDrop</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Sharma General Store · Customer counter</p>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </header>

      <div className="mx-auto mt-10 max-w-xl text-center sm:mt-14">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary uppercase">
          <span className="size-2 rounded-full bg-live animate-pulse" />
          Voice request ready
        </div>
        <h1 className="text-3xl leading-tight font-bold sm:text-5xl">Tell the shop what’s missing.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          Say the product you couldn’t find. AI turns your words into a clear stock request for the owner.
        </p>
      </div>

      <div className="mt-9 flex flex-col items-center sm:mt-12">
        <Button
          type="button"
          onClick={handleMic}
          disabled={busy}
          aria-label={recording ? "Stop recording" : "Start recording"}
          style={recording ? { transform: `scale(${1 + Math.min(level, 0.5) * 0.4})` } : undefined}
          className={`size-40 rounded-full border-8 border-card p-0 text-primary-foreground shadow-2xl transition-all duration-150 focus-visible:outline-none sm:size-48 [&_svg]:size-auto ${
            recording ? "mic-live bg-destructive" : "bg-primary hover:scale-[1.03] active:scale-95"
          }`}
        >
          {busy ? (
            <Loader2 className="size-12 animate-spin" />
          ) : recording ? (
            <Square className="size-11 fill-current" />
          ) : (
            <Mic className="size-14" />
          )}
        </Button>
        <p className="mt-5 min-h-6 text-sm font-semibold text-foreground">
          {busy
            ? "Understanding what you said…"
            : recording
              ? "Listening… tap again when done"
              : "Tap to speak"}
        </p>
      </div>

      <div aria-live="polite" className="mx-auto mt-8 w-full max-w-lg">
        {result?.kind === "success" && (
          <div className="rise-in surface overflow-hidden rounded-xl">
            <div className="flex items-center gap-3 border-b border-border bg-success/10 px-5 py-4 text-left">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
                <CheckCircle2 className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-success">Request sent</p>
                <p className="text-xs text-muted-foreground">The owner can see it on the live demand list.</p>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-primary uppercase">
                <Sparkles className="size-3.5" />
                AI identified
              </div>
              <p className="font-display mt-2 text-center text-2xl font-bold">{result.product}</p>
              {result.category && (
                <p className="mt-1 text-center text-xs font-semibold text-muted-foreground">{result.category}</p>
              )}
              <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-border pt-4 text-left">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">You said</p>
                  <p className="mt-1 truncate text-sm">“{result.transcript}”</p>
                </div>
                <ArrowRight className="size-4 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Stock request</p>
                  <p className="mt-1 truncate text-sm font-semibold">{result.product}</p>
                </div>
              </div>
              {result.requestId &&
                (result.phoneSaved ? (
                  <p className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-sm font-semibold text-success">
                    <CheckCircle2 className="size-4" />
                    We'll WhatsApp you when {result.product} is stocked.
                  </p>
                ) : (
                  <div className="mt-5 rounded-lg border border-border bg-secondary/40 p-4 text-left">
                    {phoneState === "saved" ? (
                      <p className="flex items-center gap-2 text-sm font-semibold text-success">
                        <CheckCircle2 className="size-4" />
                        Done — we'll WhatsApp you when {result.product} is stocked.
                      </p>
                    ) : (
                      <>
                        <p className="text-xs font-semibold">
                          Want a WhatsApp message when it's back in stock?
                        </p>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            void handleSavePhone(result.requestId);
                          }}
                          className="mt-2 flex gap-2"
                        >
                          <Input
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (phoneState === "invalid") setPhoneState("idle");
                            }}
                            placeholder="WhatsApp number, e.g. 98765 43210"
                            inputMode="tel"
                            className="h-10"
                          />
                          <Button
                            type="submit"
                            disabled={phoneState === "saving" || !phone.trim()}
                            className="h-10 shrink-0"
                          >
                            {phoneState === "saving" ? <Loader2 className="size-4 animate-spin" /> : "Notify me"}
                          </Button>
                        </form>
                        {phoneState === "invalid" && (
                          <p className="mt-1.5 text-xs text-destructive">
                            That number doesn't look right — check it and try again.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button type="button" variant="secondary" onClick={() => setResult(null)}>
                  <RotateCcw />
                  Ask for another
                </Button>
                <Button asChild>
                  <Link to="/dashboard">
                    View owner demand
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
        {result?.kind === "unclear" && (
          <div className="rise-in surface rounded-xl p-5 text-center">
            <AlertCircle className="mx-auto size-8 text-accent" />
            <p className="mt-3 text-sm">
              We heard “{result.transcript}” but couldn't spot a product. Try saying just the item name.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button type="button" variant="secondary" onClick={() => setResult(null)}>
                <Mic />
                Try speaking again
              </Button>
            </div>
          </div>
        )}
        {result?.kind === "error" && (
          <div className="rise-in rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-center">
            <AlertCircle className="mx-auto size-8 text-destructive" />
            <p className="mt-3 font-semibold text-foreground">We couldn’t send that request.</p>
            <p className="mt-1 text-sm text-muted-foreground">{result.message}</p>
            <Button type="button" variant="outline" className="mt-4" onClick={() => setResult(null)}>
              <RotateCcw />
              Try again
            </Button>
          </div>
        )}
      </div>

      <div className="mx-auto mt-auto w-full max-w-lg pt-10">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
            <Keyboard className="size-3.5" />
            Or type it instead
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim() || busy) return;
              const phoneValue = phone.trim();
              void process(phoneValue ? { text: text.trim(), phone: phoneValue } : { text: text.trim() });
              setText("");
              setShowSuggestions(false);
            }}
            className="mt-3 space-y-2"
          >
            <div className="relative">
              <Input
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setShowSuggestions(false)}
                placeholder="Try: Maggi noodles, Amul butter, brown bread…"
                className="h-11"
                aria-label="Product you couldn't find"
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute inset-x-0 bottom-full z-10 mb-1 max-h-56 space-y-1 overflow-auto rounded-lg border border-border bg-card p-1 shadow-lg">
                  {suggestions.map((s) => (
                    <li key={s.name}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setText(s.name);
                          setShowSuggestions(false);
                        }}
                        className="flex w-full items-baseline justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-secondary/60"
                      >
                        <span className="font-medium">{s.name}</span>
                        <span className="shrink-0 text-[10px] font-semibold text-muted-foreground uppercase">
                          {s.inv
                            ? s.inv.price != null
                              ? `₹${s.inv.price} · ${s.inv.stock > 0 ? "In stock" : "Out of stock"}`
                              : s.inv.stock > 0
                                ? "In stock"
                                : "Out of stock"
                            : s.category}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your WhatsApp number (optional) — e.g. 98765 43210"
              inputMode="tel"
              className="h-11"
              aria-label="WhatsApp number"
            />
            <Button type="submit" disabled={busy || !text.trim()} className="h-11 w-full">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Send />}
              Send request
            </Button>
          </form>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Leave your number and the owner can WhatsApp you when it's stocked.
          </p>
        </div>
      </div>
    </main>
  );
}
