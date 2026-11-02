create table public.supplier_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  store_name text not null default 'My store',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.supplier_profiles to authenticated;
grant all on public.supplier_profiles to service_role;
grant select on public.supplier_profiles to anon;

alter table public.supplier_profiles enable row level security;

create policy "Suppliers manage their own profile"
  on public.supplier_profiles
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Anyone can view supplier store names"
  on public.supplier_profiles
  for select
  to anon
  using (true);