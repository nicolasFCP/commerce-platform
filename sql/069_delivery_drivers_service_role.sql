-- =====================================================
-- PERMISOS BACKEND PARA GESTIÓN DE DOMICILIARIOS
-- =====================================================

grant select, insert, update, delete
on public.delivery_drivers
to service_role;
