<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Architecture rules

- Supplier sign-in uses Google via the Lovable managed OAuth broker (`lovable.auth.signInWithOAuth`) — never raw `supabase.auth.signInWithOAuth`. Protected pages live under `src/routes/_authenticated/` (client-only gate at `_authenticated/route.tsx`, redirect to `/auth`); the sign-in page is the public `src/routes/auth.tsx`.
- Supplier inventory lives in `public.inventory_items`: publicly readable (anon SELECT policy so the customer page can suggest stock), but every write policy is scoped to `auth.uid() = user_id` and every inventory server function uses `requireSupabaseAuth`. Server-only helpers for inventory reads belong in `src/lib/inventory.server.ts` (blocked from the client bundle); never import them statically from a `*.functions.ts` module — dynamic-import inside handlers.
- Demand requests stay service-role-only; the demand fast path checks the static catalog first, then the supplier's live inventory (exact match), and only then calls the LLM.
