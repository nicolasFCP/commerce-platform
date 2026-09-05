CREATE OR REPLACE FUNCTION public.driver_complete_cash_delivery(
    p_order_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_assignment_id uuid;
    v_current_status text;
    v_payment_method text;
    v_payment_status text;
BEGIN

    -- -------------------------------------------------
    -- VALIDAR PEDIDO ASIGNADO AL DOMICILIARIO
    -- -------------------------------------------------

    SELECT
        da.id,
        o.status,
        o.payment_method,
        o.payment_status
    INTO
        v_assignment_id,
        v_current_status,
        v_payment_method,
        v_payment_status

    FROM public.delivery_assignments da

    JOIN public.delivery_drivers dd
        ON dd.id = da.driver_id

    JOIN public.orders o
        ON o.id = da.order_id

    WHERE da.order_id = p_order_id
      AND da.active = true
      AND dd.user_id = auth.uid()
      AND dd.active = true
      AND dd.store_id = o.store_id

    FOR UPDATE OF o, da;


    IF v_assignment_id IS NULL THEN

        RAISE EXCEPTION
            'ORDER_NOT_ASSIGNED_TO_DRIVER';

    END IF;


    -- -------------------------------------------------
    -- DEBE ESTAR EN DOMICILIO
    -- -------------------------------------------------

    IF v_current_status <> 'out_for_delivery' THEN

        RAISE EXCEPTION
            'ORDER_NOT_OUT_FOR_DELIVERY';

    END IF;


    -- -------------------------------------------------
    -- SOLO EFECTIVO CONTRAENTREGA
    -- -------------------------------------------------

    IF v_payment_method <> 'cash_on_delivery' THEN

        RAISE EXCEPTION
            'ORDER_IS_NOT_CASH_ON_DELIVERY';

    END IF;


    -- -------------------------------------------------
    -- EVITAR CONFIRMACIÓN DUPLICADA
    -- -------------------------------------------------

    IF v_payment_status = 'paid' THEN

        RAISE EXCEPTION
            'PAYMENT_ALREADY_CONFIRMED';

    END IF;


    -- -------------------------------------------------
    -- REGISTRAR EFECTIVO Y COMPLETAR PEDIDO
    -- -------------------------------------------------

    UPDATE public.orders

    SET
        payment_status = 'paid',
        paid_at = now(),
        payment_verified_by = auth.uid(),
        status = 'completed'

    WHERE id = p_order_id;


    -- -------------------------------------------------
    -- CERRAR ASIGNACIÓN
    -- -------------------------------------------------

    UPDATE public.delivery_assignments

    SET
        completed_at = now(),
        active = false

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
        'out_for_delivery',
        'completed',
        'delivery_driver',
        auth.uid(),
        'Efectivo recibido y pedido entregado por domiciliario'

    );

END;
$$;


REVOKE ALL
ON FUNCTION public.driver_complete_cash_delivery(uuid)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION public.driver_complete_cash_delivery(uuid)
TO authenticated;