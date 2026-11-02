/**
 * Shared color helpers for inventory surfaces (supplier page and the owner's
 * supplier-stock view). Category colors are design tokens in src/styles.css
 * (--cat-*), each with dark badge text so solid chips stay readable.
 */

export const CATEGORIES = [
  "Dairy",
  "Bakery",
  "Beverages",
  "Snacks",
  "Staples",
  "Personal Care",
  "Household",
  "Other",
] as const;

/** Solid color fill per category, with the shared dark badge text token. */
export const CATEGORY_STYLE: Record<string, string> = {
  Dairy: "bg-cat-dairy text-badge-foreground",
  Bakery: "bg-cat-bakery text-badge-foreground",
  Beverages: "bg-cat-beverages text-badge-foreground",
  Snacks: "bg-cat-snacks text-badge-foreground",
  Staples: "bg-cat-staples text-badge-foreground",
  "Personal Care": "bg-cat-personal text-badge-foreground",
  Household: "bg-cat-household text-badge-foreground",
  Other: "bg-cat-other text-badge-foreground",
};

export function categoryStyle(category: string | null | undefined) {
  return CATEGORY_STYLE[category ?? ""] ?? CATEGORY_STYLE["Other"];
}

/** Stock state as a solid colored badge: red out, amber low, green in stock. */
export function stockBadge(stock: number) {
  if (!Number.isFinite(stock) || stock <= 0) {
    return { label: "Out of stock", className: "bg-destructive text-destructive-foreground" };
  }
  if (stock <= 5) {
    return { label: `Low stock · ${stock}`, className: "bg-warning text-warning-foreground" };
  }
  return { label: `In stock · ${stock}`, className: "bg-success text-success-foreground" };
}
