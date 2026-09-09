-- =====================================================
-- REALTIME PARA OPERACIÓN PRINCIPAL DE COMMERCE PLATFORM
-- =====================================================

alter publication supabase_realtime
add table public.orders;

alter publication supabase_realtime
add table public.order_items;

alter publication supabase_realtime
add table public.delivery_assignments;

alter publication supabase_realtime
add table public.delivery_drivers;

alter publication supabase_realtime
add table public.products;

alter publication supabase_realtime
add table public.categories;

alter publication supabase_realtime
add table public.store_payment_settings;