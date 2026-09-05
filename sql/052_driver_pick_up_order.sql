CREATE OR REPLACE FUNCTION public.driver_pick_up_order(
    p_order_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_current_status text;
    v_assignment_id uuid;
BEGIN

    -- -------------------------------------------------
    -- VALIDAR QUE EL PEDIDO ESTÉ ASIGNADO
    -- AL DOMICILIARIO AUTENTICADO
    -- -------------------------------------------------

    SELECT
        da.id,
        o.status
    INTO
        v_assignment_id,
        v_current_status

    FROM public.delivery_assignments da

    JOIN public.delivery_drivers dd
        ON dd.id = da.driver_id

    JOIN public.orders o
        ON o.id = da.order_id

    WHERE da.order_id = p_order_id
      AND da.active = true
      AND dd.user_id = auth.uid()
      AND dd.active = true;


    IF v_assignment_id IS NULL THEN

        RAISE EXCEPTION
            'ORDER_NOT_ASSIGNED_TO_DRIVER';

    END IF;


    -- -------------------------------------------------
    -- EL PEDIDO DEBE ESTAR LISTO
    -- -------------------------------------------------

    IF v_current_status <> 'ready' THEN

        RAISE EXCEPTION
            'ORDER_NOT_READY';

    END IF;


    -- -------------------------------------------------
    -- ACTUALIZAR PEDIDO
    -- -------------------------------------------------

    UPDATE public.orders

    SET status = 'out_for_delivery'

    WHERE id = p_order_id;


    -- -------------------------------------------------
    -- REGISTRAR RECOGIDA
    -- -------------------------------------------------

    UPDATE public.delivery_assignments

    SET picked_up_at = now()

    WHERE id = v_assignment_id;


    -- -------------------------------------------------
    -- GUARDAR HISTORIAL
    -- -------------------------------------------------

    INSERT INTO public.order_events (

        order_id,
        event_type,
        from_status,
        to_status,
        actor_type,
        actor_user_id,
        reason

    )
    VALUES (

        p_order_id,
        'status_changed',
        'ready',
        'out_for_delivery',
        'delivery_driver',
        auth.uid(),
        'Pedido recogido por domiciliario'

    );

END;
$$;


REVOKE ALL
ON FUNCTION public.driver_pick_up_order(uuid)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION public.driver_pick_up_order(uuid)
TO authenticated;