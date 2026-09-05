CREATE OR REPLACE FUNCTION public.assign_delivery_driver(
    p_order_id uuid,
    p_driver_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_store_id uuid;
    v_order_status text;
    v_fulfillment_type text;
BEGIN

    -- -------------------------------------------------
    -- OBTENER PEDIDO
    -- -------------------------------------------------

    SELECT
        store_id,
        status,
        fulfillment_type
    INTO
        v_store_id,
        v_order_status,
        v_fulfillment_type
    FROM public.orders
    WHERE id = p_order_id;


    IF v_store_id IS NULL THEN

        RAISE EXCEPTION
            'ORDER_NOT_FOUND';

    END IF;


    -- -------------------------------------------------
    -- SOLO PEDIDOS A DOMICILIO
    -- -------------------------------------------------

    IF v_fulfillment_type <> 'delivery' THEN

        RAISE EXCEPTION
            'ORDER_IS_NOT_DELIVERY';

    END IF;


    -- -------------------------------------------------
    -- EL PEDIDO DEBE ESTAR LISTO
    -- -------------------------------------------------

    IF v_order_status <> 'ready' THEN

        RAISE EXCEPTION
            'ORDER_NOT_READY_FOR_ASSIGNMENT';

    END IF;


    -- -------------------------------------------------
    -- VALIDAR ADMINISTRADOR DEL COMERCIO
    -- -------------------------------------------------

    IF NOT EXISTS (

        SELECT 1

        FROM public.store_members sm

        WHERE sm.store_id = v_store_id
          AND sm.user_id = auth.uid()
          AND sm.active = true

    ) THEN

        RAISE EXCEPTION
            'NOT_AUTHORIZED';

    END IF;


    -- -------------------------------------------------
    -- VALIDAR DOMICILIARIO
    -- -------------------------------------------------

    IF NOT EXISTS (

        SELECT 1

        FROM public.delivery_drivers dd

        WHERE dd.id = p_driver_id
          AND dd.store_id = v_store_id
          AND dd.active = true

    ) THEN

        RAISE EXCEPTION
            'INVALID_DELIVERY_DRIVER';

    END IF;


    -- -------------------------------------------------
    -- DESACTIVAR ASIGNACIÓN ANTERIOR
    -- -------------------------------------------------

    UPDATE public.delivery_assignments

    SET active = false

    WHERE order_id = p_order_id
      AND active = true;


    -- -------------------------------------------------
    -- CREAR NUEVA ASIGNACIÓN
    -- -------------------------------------------------

    INSERT INTO public.delivery_assignments (
        order_id,
        driver_id,
        assigned_by,
        active
    )
    VALUES (
        p_order_id,
        p_driver_id,
        auth.uid(),
        true
    );

END;
$$;


REVOKE ALL
ON FUNCTION public.assign_delivery_driver(
    uuid,
    uuid
)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION public.assign_delivery_driver(
    uuid,
    uuid
)
TO authenticated;