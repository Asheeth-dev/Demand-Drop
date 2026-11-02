import { useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  LogOut,
  Loader2,
  Package,
  Pencil,
  Plus,
  Trash2,
  Warehouse,
  X,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteInventoryItem,
  listMyInventory,
  saveInventoryItem,
} from "@/lib/inventory.functions";
import { suggestCatalogProducts } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/supplier")({
  head: () => ({
    meta: [
      { title: "Supplier inventory — DemandDrop" },
      {
        name: "description",
        content: "Manage your products, prices and stock; customers see your items instantly.",
      },
      { property: "og:title", content: "Supplier inventory — DemandDrop" },
      {
        property: "og:description",
        content: "Manage your products, prices and stock; customers see your items instantly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SupplierPage,
});

const CATEGORIES = [
  "Dairy",
  "Bakery",
  "Beverages",
  "Snacks",
  "Staples",
  "Personal Care",
  "Household",
  "Other",
] as const;

type InventoryRow = {
  id: string;
  product_name: string;
  brand: string | null;
  category: string;
  price: number | null;
  stock: number;
};

function SupplierPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const listFn = useServerFn(listMyInventory);
  const saveFn = useServerFn(saveInventoryItem);
  const removeFn = useServerFn(deleteInventoryItem);

  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setEmail(user?.email ?? null));
  }, []);

  const inventoryQuery = useQuery<InventoryRow[]>({
    queryKey: ["my-inventory"],
    queryFn: () => listFn(),
  });

  // Add / update form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<string>("Other");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: {
        id?: string;
        productName: string;
        brand?: string;
        category: string;
        price: number | null;
        stock: number;
      } = {
        productName: productName.trim(),
        category,
        price: price.trim() === "" ? null : Number(price),
        stock: Number(stock || 0),
      };
      if (brand.trim()) payload.brand = brand.trim();
      if (editingId) payload.id = editingId;
      return saveFn({ data: payload });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-inventory"] });
      resetForm();
    },
    onError: (e: Error) => setFormError(e.message),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => removeFn({ data: { id } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["my-inventory"] }),
  });

  function resetForm() {
    setEditingId(null);
    setProductName("");
    setBrand("");
    setCategory("Other");
    setPrice("");
    setStock("");
    setFormError(null);
  }

  function startEdit(item: InventoryRow) {
    setEditingId(item.id);
    setProductName(item.product_name);
    setBrand(item.brand ?? "");
    setCategory(item.category);
    setPrice(item.price != null ? String(item.price) : "");
    setStock(String(item.stock));
    setFormError(null);
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  // Name suggestions from the built-in catalog while typing a product name.
  const nameSuggestions =
    !editingId && productName.trim().length > 1 ? suggestCatalogProducts(productName, 4) : [];
  const exactNameInList = inventoryQuery.data?.some(
    (i) => i.product_name.toLowerCase() === productName.trim().toLowerCase(),
  );

  const items = inventoryQuery.data ?? [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 pb-16 text-foreground">
      <header className="flex items-center justify-between border-b border-border py-4">
        <div>
          <p className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <Warehouse className="size-5" />
            Supplier inventory
          </p>
          <p className="text-xs text-muted-foreground">{email ?? "Signed in"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="rounded-md px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Demand list
          </Link>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </header>

      {/* Add / edit form */}
      <section className="mt-6 rounded-xl border border-border bg-card p-4">
        <p className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
          <Plus className="size-3.5" />
          {editingId ? "Update product" : "Add a product"}
        </p>
        <form
          className="mt-3 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!productName.trim() || saveMutation.isPending) return;
            saveMutation.mutate();
          }}
        >
          <div className="relative">
            <Input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Product name, e.g. Amul Butter"
              className="h-11"
              aria-label="Product name"
            />
            {nameSuggestions.length > 0 && (
              <ul className="absolute inset-x-0 top-full z-10 mt-1 max-h-48 space-y-1 overflow-auto rounded-lg border border-border bg-card p-1 shadow-lg">
                {nameSuggestions.map((s) => (
                  <li key={s.name}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setProductName(s.name);
                        setCategory(s.category);
                      }}
                      className="flex w-full items-baseline justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-secondary/60"
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                        {s.category}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Brand (optional)"
              className="h-11"
              aria-label="Brand"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Category"
              className="h-11 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price ₹ (optional)"
              inputMode="decimal"
              className="h-11"
              aria-label="Price in rupees"
            />
            <Input
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Stock quantity"
              inputMode="numeric"
              className="h-11"
              aria-label="Stock quantity"
            />
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={saveMutation.isPending || !productName.trim()} className="h-11 flex-1">
              {saveMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : editingId ? (
                <Check />
              ) : (
                <Plus />
              )}
              {editingId ? "Save changes" : "Add to inventory"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm} className="h-11">
                <X />
                Cancel
              </Button>
            )}
          </div>
          {exactNameInList && !editingId && (
            <p className="text-xs text-muted-foreground">
              You already stock this name — use its row's edit button to update it.
            </p>
          )}
        </form>
      </section>

      {/* Inventory list */}
      <section className="mt-6">
        <p className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
          <Package className="size-3.5" />
          Your products {items.length > 0 && <span>· {items.length}</span>}
        </p>
        {inventoryQuery.isLoading ? (
          <div className="mt-3 flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="mt-3 rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Nothing stocked yet — add your first product above and it shows up for customers instantly.
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {items.map((item) => (
              <li key={item.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.brand ? `${item.brand} · ` : ""}
                      {item.category}
                      {item.price != null ? ` · ₹${item.price}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(item)}
                      aria-label={`Edit ${item.product_name}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      disabled={removeMutation.isPending}
                      onClick={() => removeMutation.mutate(item.id)}
                      aria-label={`Remove ${item.product_name}`}
                    >
                      {removeMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="mt-1 text-xs font-medium">
                  {item.stock > 0 ? (
                    <span className="text-success">{item.stock} in stock</span>
                  ) : (
                    <span className="text-destructive">Out of stock</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
