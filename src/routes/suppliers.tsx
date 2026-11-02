import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LayoutDashboard, Loader2, PackageSearch, Warehouse } from "lucide-react";

import { listSupplierInventory } from "@/lib/inventory.functions";
import { categoryStyle, stockBadge } from "@/lib/inventory-ui";

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
    <main className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
        <div>
          <p className="font-display flex items-center gap-2 text-lg font-bold">
            <Warehouse className="size-5 text-primary" />
            DemandDrop
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Supplier stock · Owner view</p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <LayoutDashboard className="size-3.5" />
          Demand list
        </Link>
      </header>

      <div className="mt-8">
        <h1 className="text-3xl font-bold sm:text-4xl">What your suppliers have.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
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
            <section key={supplier.userId} className="surface overflow-hidden rounded-xl">
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{supplier.storeName}</p>
                  <p className="text-xs text-muted-foreground">
                    {supplier.itemCount === 1 ? "1 product" : `${supplier.itemCount} products`}
                  </p>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Warehouse className="size-4.5" />
                </span>
              </div>
              <ul className="divide-y divide-border">
                {supplier.items.map((item) => {
                  const stock = stockBadge(item.stock);
                  return (
                    <li key={item.product_name} className="flex items-center justify-between gap-3 px-5 py-3">
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
    </main>
  );
}
