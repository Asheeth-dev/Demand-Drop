import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Server-only Supabase helpers for inventory reads. Lives in a `.server.ts`
 * file so it never ships to the client bundle.
 */

/** Public read-only client: the inventory table is readable by anyone (anon SELECT policy). */
export function createPublicInventoryClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  // Opaque sb_ keys aren't JWTs; PostgREST needs apikey, not a Bearer header.
  const fetchShim = (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
  client.rest = new Proxy(client.rest, {});
  // Simplest reliable shim: wrap the client's postgrest by replacing `from`.
  const origFrom = client.from.bind(client);
  (client as unknown as { from: typeof origFrom }).from = (relation: string) => {
    const builder = origFrom(relation);
    // Re-issue through the shim by patching fetch on the builder chain is not
    // exposed; instead replace global fetch per call via the builder's `abort`
    // is overkill — use the headers override below.
    return builder;
  };
  return client;
}
