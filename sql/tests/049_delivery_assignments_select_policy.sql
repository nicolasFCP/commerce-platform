-- =====================================================
-- LECTURA SEGURA DE ASIGNACIONES DE DOMICILIOS
-- =====================================================

DROP POLICY IF EXISTS
    "delivery_assignments_select_admin_or_driver"
ON public.delivery_assignments;


CREATE POLICY
    "delivery_assignments_select_admin_or_driver"

ON public.delivery_assignments

FOR SELECT

TO authenticated

USING (

    -- -------------------------------------------------
    -- EL DOMICILIARIO PUEDE VER SUS PROPIAS ASIGNACIONES
    -- -------------------------------------------------

    EXISTS (

        SELECT 1

        FROM public.delivery_drivers dd

        WHERE dd.id =
            delivery_assignments.driver_id

          AND dd.user_id =
            auth.uid()

    )

    OR

    -- -------------------------------------------------
    -- EL ADMINISTRADOR PUEDE VER LAS ASIGNACIONES
    -- DE PEDIDOS PERTENECIENTES A SUS COMERCIOS
    -- -------------------------------------------------

    EXISTS (

        SELECT 1

        FROM public.orders o

        WHERE o.id =
            delivery_assignments.order_id

          AND o.store_id IN (
              SELECT private.user_store_ids()
          )

    )
);


GRANT SELECT
ON public.delivery_assignments
TO authenticated;