import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CATEGORIES = new Set([
  "Dairy",
  "Bakery",
  "Beverages",
  "Snacks",
  "Staples",
  "Personal Care",
  "Household",
  "Other",
]);

/**
 * Inventory rows are the supplier's own products. Writes are scoped to the
 * signed-in user by RLS (auth.uid() = user_id); the whole table is publicly
 * readable so the customer page can suggest it.
 */

export const listMyInventory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("inventory_items")
      .select("id, product_name, brand, category, price, stock, created_at, updated_at")
      .order("product_name", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveInventoryItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id?: string;
      productName: string;
      brand?: string;
      category: string;
      price?: number | null;
      stock: number;
    }) => {
      const productName = String(input.productName ?? "").trim().slice(0, 80);
      if (!productName) throw new Error("Product name is required.");
      const brand = typeof input.brand === "string" ? input.brand.trim().slice(0, 60) || undefined : undefined;
      const category = CATEGORIES.has(input.category) ? input.category : "Other";
      let price: number | null = null;
      if (input.price != null && Number.isFinite(Number(input.price))) {
        price = Math.min(Math.max(Number(input.price), 0), 999_999);
      }
      const stock = Math.min(Math.max(Math.trunc(Number(input.stock) || 0), 0), 100_000);
      const id = input.id && UUID_RE.test(input.id) ? input.id : undefined;
      return { id, productName, brand, category, price, stock };
    },
  )
  .handler(async ({ data, context }) => {
    const values = {
      user_id: context.userId,
      product_name: data.productName,
      brand: data.brand ?? null,
      category: data.category,
      price: data.price,
      stock: data.stock,
      updated_at: new Date().toISOString(),
    };
    if (data.id) {
      const { error } = await context.supabase
        .from("inventory_items")
        .update(values)
        .eq("id", data.id)
        .eq("user_id", context.userId);
      if (error) throw new Error(error.message);
      return { ok: true as const, id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("inventory_items")
      .insert(values)
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("You already have a product with that name.");
      throw new Error(error.message);
    }
    return { ok: true as const, id: row.id };
  });

export const deleteInventoryItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!UUID_RE.test(String(input.id ?? ""))) throw new Error("Invalid item.");
    return { id: input.id };
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("inventory_items")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Public read for the customer page: every inventory item, prices and stock included. */
export const listPublicInventory = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabasePublic = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      // Opaque sb_ keys aren't JWTs; send apikey, not a Bearer header.
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
  const { data, error } = await supabasePublic
    .from("inventory_items")
    .select("id, product_name, brand, category, price, stock")
    .order("product_name", { ascending: true })
    .limit(300);
  if (error) throw new Error(error.message);
  return data ?? [];
});
