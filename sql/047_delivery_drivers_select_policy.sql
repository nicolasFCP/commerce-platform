-- =====================================================
-- LECTURA SEGURA DE DOMICILIARIOS
-- =====================================================

DROP POLICY IF EXISTS
    "delivery_drivers_select_admin_or_self"
ON public.delivery_drivers;


CREATE POLICY
    "delivery_drivers_select_admin_or_self"

ON public.delivery_drivers

FOR SELECT

TO authenticated

USING (

    -- El domiciliario puede verse a sí mismo
    user_id = auth.uid()

    OR

    -- El administrador puede ver domiciliarios
    -- pertenecientes a sus comercios
    store_id IN (
        SELECT private.user_store_ids()
    )
);


GRANT SELECT
ON public.delivery_drivers
TO authenticated;