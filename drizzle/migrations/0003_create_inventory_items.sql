CREATE TABLE public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_name text not null,
  brand text,
  category text not null default 'Other',
  price numeric(10,2),
  stock integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE UNIQUE INDEX inventory_items_user_product_idx ON public.inventory_items (user_id, product_name);

GRANT SELECT ON public.inventory_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_items TO authenticated;
GRANT ALL ON public.inventory_items TO service_role;

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view inventory"
  ON public.inventory_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users insert own inventory"
  ON public.inventory_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own inventory"
  ON public.inventory_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own inventory"
  ON public.inventory_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);