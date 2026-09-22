ALTER TABLE public.demand_requests
  ADD COLUMN customer_phone TEXT,
  ADD COLUMN notified_at TIMESTAMP WITH TIME ZONE;