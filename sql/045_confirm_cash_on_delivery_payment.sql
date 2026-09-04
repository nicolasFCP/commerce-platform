CREATE OR REPLACE FUNCTION public.confirm_cash_on_delivery_payment(
    p_order_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_store_id uuid;
    v_status text;
    v_payment_method text;
    v_payment_status text;
BEGIN

    -- -------------------------------------------------
    -- OBTENER PEDIDO
    -- -------------------------------------------------

    SELECT
        store_id,
        status,
        payment_method,
        payment_status
    INTO
        v_store_id,
        v_status,
        v_payment_method,
        v_payment_status
    FROM public.orders
    WHERE id = p_order_id;


    IF v_store_id IS NULL THEN

        RAISE EXCEPTION
            'ORDER_NOT_FOUND';

    END IF;


    -- -------------------------------------------------
    -- VALIDAR USUARIO DEL COMERCIO
    -- -------------------------------------------------

    IF NOT EXISTS (

        SELECT 1
        FROM public.store_members
        WHERE store_id = v_store_id
          AND user_id = auth.uid()
          AND active = true

    ) THEN

        RAISE EXCEPTION
            'NOT_AUTHORIZED';

    END IF;


    -- -------------------------------------------------
    -- SOLO EFECTIVO CONTRAENTREGA
    -- -------------------------------------------------

    IF v_payment_method <> 'cash_on_delivery' THEN

        RAISE EXCEPTION
            'ORDER_IS_NOT_CASH_ON_DELIVERY';

    END IF;


    -- -------------------------------------------------
    -- DEBE HABER SALIDO A DOMICILIO
    -- -------------------------------------------------

    IF v_status <> 'out_for_delivery' THEN

        RAISE EXCEPTION
            'ORDER_NOT_OUT_FOR_DELIVERY';

    END IF;


    -- -------------------------------------------------
    -- EVITAR COBRO DUPLICADO
    -- -------------------------------------------------

    IF v_payment_status = 'paid' THEN

        RAISE EXCEPTION
            'PAYMENT_ALREADY_CONFIRMED';

    END IF;


    -- -------------------------------------------------
    -- REGISTRAR EFECTIVO RECIBIDO
    -- -------------------------------------------------

    UPDATE public.orders

    SET
        payment_status = 'paid',
        paid_at = now(),
        payment_verified_by = auth.uid()

    WHERE id = p_order_id;


    -- -------------------------------------------------
    -- COMPLETAR PEDIDO
    -- REUTILIZANDO LAS REGLAS DE change_order_status()
    -- -------------------------------------------------

    PERFORM public.change_order_status(
        p_order_id,
        'completed',
        'Efectivo contraentrega recibido'
    );

END;
$$;


REVOKE ALL
ON FUNCTION public.confirm_cash_on_delivery_payment(uuid)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION public.confirm_cash_on_delivery_payment(uuid)
TO authenticated;