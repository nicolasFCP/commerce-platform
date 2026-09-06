-- =====================================================
-- PERMISOS BACKEND PARA ALTA DE COMERCIOS
-- =====================================================

grant select, insert, delete
on public.stores
to service_role;


grant insert
on public.store_members
to service_role;