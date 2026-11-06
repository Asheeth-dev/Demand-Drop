import { LayoutDashboard, Mic, Warehouse } from "lucide-react";

/** Owner-side navigation shown in the app shell sidebar. */
export const NAV_SECTIONS = [
  {
    label: "General",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/counter", label: "Counter screen", icon: Mic },
    ],
  },
  {
    label: "Tools",
    items: [{ to: "/suppliers", label: "Supplier stock", icon: Warehouse, dot: true }],
  },
];
