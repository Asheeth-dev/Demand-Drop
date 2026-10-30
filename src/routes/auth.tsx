import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Supplier sign in — DemandDrop" },
      { name: "description", content: "Sign in to manage your shop's inventory on DemandDrop." },
      { property: "og:title", content: "Supplier sign in — DemandDrop" },
      { property: "og:description", content: "Sign in to manage your shop's inventory on DemandDrop." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.2h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.02.15 3.5 2.7.24.02c2.2-2.1 3.5-5.1 3.5-8.7z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.14.01-3.6 2.8-.05.13C3.4 21.3 7.4 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.01-.16-3.7-2.8-.12.06C.5 8.2 0 10 0 12s.5 3.8 1.4 5.3l3.8-2.9z"
      />
      <path
        fill="#EB4335"
        d="M12 4.7c2.2 0 3.7.9 4.6 1.8l3.3-3.2C17.9 1.4 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.7l3.8 2.9c1-2.9 3.7-4.9 6.8-4.9z"
      />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already signed in? Go straight to the supplier dashboard.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) void navigate({ to: "/supplier", replace: true });
    });
  }, [navigate]);

  async function signInGoogle() {
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in didn't go through. Please try again.");
      setBusy(false);
      return;
    }
    if (result.redirected) return; // full-page flow: the browser is navigating
    // Tokens received and the session is already set.
    void navigate({ to: "/supplier", replace: true });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center shadow-lg">
        <h1 className="text-2xl font-extrabold tracking-tight">Supplier sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your products, prices and stock. Customers see your items the moment you add them.
        </p>
        <button
          type="button"
          onClick={signInGoogle}
          disabled={busy}
          className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-md border border-input bg-background text-sm font-semibold transition-colors hover:bg-accent disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <GoogleIcon />}
          Continue with Google
        </button>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        <p className="mt-6 text-xs text-muted-foreground">
          Just looking for the shop's demand list?{" "}
          <a href="/dashboard" className="underline underline-offset-2">
            Owner dashboard
          </a>
        </p>
      </div>
    </main>
  );
}
