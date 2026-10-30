import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Integration-managed auth gate for the whole _authenticated subtree.
 * The session lives in localStorage, which the server cannot read, so the
 * route is client-only (ssr: false) and the check runs in beforeLoad.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
