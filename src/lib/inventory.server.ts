import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Server-only Supabase helpers for inventory reads. Lives in a `.server.ts`
 * file so it never ships to the client bundle.
 */

/** Public read-only client: the inventory table has a public anon SELECT policy. */
function createPublicInventoryClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      // Opaque sb_ keys aren't JWTs; PostgREST needs apikey, not a Bearer header.
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/**
 * Exact typed match against the supplier's live inventory, used by the demand
 * fast path so a typed product name that exists in stock can't be mangled by
 * the LLM. Escapes LIKE wildcards in the transcript first.
 */
export async function findInventoryExact(transcript: string) {
  const client = createPublicInventoryClient();
  const needle = transcript.trim().replace(/[%_\\]/g, "\\$&");
  if (!needle) return null;
  const { data, error } = await client
    .from("inventory_items")
    .select("product_name, category")
    .ilike("product_name", needle)
    .limit(1);
  if (error) return null;
  return data?.[0] ?? null;
}
