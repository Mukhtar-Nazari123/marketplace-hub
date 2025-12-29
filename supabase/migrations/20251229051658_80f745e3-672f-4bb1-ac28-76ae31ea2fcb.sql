-- Enable REPLICA IDENTITY FULL for orders table (for real-time updates)
ALTER TABLE public.orders REPLICA IDENTITY FULL;