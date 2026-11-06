import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, PackageSearch, RefreshCw, Warehouse } from "lucide-react";

import { listSupplierInventory } from "@/lib/inventory.functions";
import { AppShell } from "@/components/app-shell";
import { NAV_SECTIONS } from "@/components/owner-nav";

export const Route = createFileRoute("/suppliers")({
  head: () => ({
    meta: [
      { title: "Supplier Stock — Owner View — DemandDrop" },
      {
        name: "description",
        content:
          "See what every supplier has in stock — products, brands, prices and quantities — so you know what you can source before you order.",
      },
      { property: "og:title", content: "Supplier Stock — Owner View — DemandDrop" },
      {
        property: "og:description",
        content: "Every supplier's inventory in one place for the store owner.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SupplierStockView,
});

type SupplierItem = {
  product_name: string;
  brand: string | null;
  category: string;
  price: number | null;
  stock: number;
};

type SupplierGroup = {
  userId: string;
  storeName: string;
  itemCount: number;
  items: SupplierItem[];
};

function SupplierStockView() {
  const fetchSuppliers = useServerFn(listSupplierInventory);
  const { data: suppliers = [], isLoading, error } = useQuery({
    queryKey: ["supplier-inventory"],
    queryFn: () => fetchSuppliers() as Promise<SupplierGroup[]>,
    refetchInterval: 15_000,
  });

  return (
    <AppShell
      sections={NAV_SECTIONS}
      activeTo="/suppliers"
      topRight={
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-[11px] font-bold uppercase text-muted-foreground">
          <RefreshCw className="size-3" />
          Refreshes every 15s
        </span>
      }
      footer={
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Warehouse className="size-3.5" />
          Powered by DemandDrop
        </p>
      }
    >
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">What your suppliers have.</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every supplier's live inventory — products, brands, prices and stock — so you know what you
          can source before you order.
        </p>
      </div>

      {isLoading ? (
        <div className="mt-8 flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="surface mt-8 p-10 text-center text-sm text-destructive">
          Couldn't load supplier stock. Refresh the page to try again.
        </div>
      ) : suppliers.length === 0 ? (
        <div className="surface mt-8 p-12 text-center">
          <PackageSearch className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No supplier stock yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            When your suppliers sign in and list their products, their inventory shows up here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {suppliers.map((supplier) => (
            <section key={supplier.userId} className="surface overflow-hidden rounded-2xl transition-colors hover:border-primary/40">
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{supplier.storeName}</p>
                  <p className="text-xs text-muted-foreground">
                    {supplier.itemCount === 1 ? "1 product" : `${supplier.itemCount} products`}
                  </p>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/40 text-primary">
                  <Warehouse className="size-4.5" />
                </span>
              </div>
              <ul className="divide-y divide-border">
                {supplier.items.map((item) => {
                  const stock = stockBadge(item.stock);
                  return (
                    <li key={item.product_name} className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-secondary/40">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.product_name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {item.brand && (
                            <span className="text-xs text-muted-foreground">{item.brand}</span>
                          )}
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${categoryStyle(item.category)}`}
                          >
                            {item.category}
                          </span>
                          {item.price != null && (
                            <span className="font-mono text-xs font-semibold text-primary">
                              ₹{item.price}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${stock.className}`}>
                        {stock.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
}

import { categoryStyle, stockBadge } from "@/lib/inventory-ui";
