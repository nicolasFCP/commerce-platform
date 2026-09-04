CREATE OR REPLACE FUNCTION public.change_order_status(
    p_order_id uuid,
    p_new_status text,
    p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_store_id uuid;

    v_current_status text;

    v_payment_method text;

    v_payment_status text;

    v_review_status text;
BEGIN

    -- -------------------------------------------------
    -- OBTENER INFORMACIÓN DEL PEDIDO
    -- -------------------------------------------------

    SELECT
        store_id,
        status,
        payment_method,
        payment_status,
        review_status
    INTO
        v_store_id,
        v_current_status,
        v_payment_method,
        v_payment_status,
        v_review_status
    FROM public.orders
    WHERE id = p_order_id;


    IF v_store_id IS NULL THEN

        RAISE EXCEPTION
            'Pedido no encontrado';

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
            'No autorizado para administrar este pedido';

    END IF;


    -- -------------------------------------------------
    -- EVITAR REPETIR EL MISMO ESTADO
    -- -------------------------------------------------

    IF v_current_status = p_new_status THEN

        RAISE EXCEPTION
            'El pedido ya tiene ese estado';

    END IF;


    -- -------------------------------------------------
    -- SI EL PEDIDO FUE MODIFICADO,
    -- EL CLIENTE DEBE APROBAR LOS CAMBIOS
    -- ANTES DE ACEPTARLO
    -- -------------------------------------------------

    IF
        v_current_status = 'pending'

        AND p_new_status = 'accepted'

        AND v_review_status =
            'changes_pending_customer'
    THEN

        RAISE EXCEPTION
            'CUSTOMER_APPROVAL_REQUIRED';

    END IF;


    -- -------------------------------------------------
    -- PROTEGER PEDIDOS PAGADOS POR TRANSFERENCIA
    -- -------------------------------------------------

    IF
        v_current_status = 'accepted'

        AND p_new_status = 'preparing'

        AND v_payment_method = 'transfer'

        AND v_payment_status IS DISTINCT FROM 'paid'
    THEN

        RAISE EXCEPTION
            'PAYMENT_REQUIRED_BEFORE_PREPARING';

    END IF;

-- -------------------------------------------------
-- PROTEGER EFECTIVO CONTRAENTREGA
-- ANTES DE COMPLETAR EL PEDIDO
-- -------------------------------------------------

IF
    p_new_status = 'completed'

    AND v_payment_method = 'cash_on_delivery'

    AND v_payment_status IS DISTINCT FROM 'paid'
THEN

    RAISE EXCEPTION
        'CASH_PAYMENT_REQUIRED_BEFORE_COMPLETING';

END IF;

    -- -------------------------------------------------
    -- TRANSICIONES PERMITIDAS
    -- -------------------------------------------------

    IF NOT (

        (
            v_current_status = 'pending'

            AND p_new_status IN (
                'accepted',
                'rejected',
                'cancelled'
            )
        )

        OR

        (
            v_current_status = 'accepted'

            AND p_new_status IN (
                'preparing',
                'cancelled'
            )
        )

        OR

        (
            v_current_status = 'preparing'

            AND p_new_status IN (
                'ready',
                'cancelled'
            )
        )

        OR

        (
            v_current_status = 'ready'

            AND p_new_status IN (
                'out_for_delivery',
                'completed'
            )
        )

        OR

        (
            v_current_status = 'out_for_delivery'

            AND p_new_status = 'completed'
        )

    ) THEN

        RAISE EXCEPTION
            'Cambio de estado no permitido: % → %',
            v_current_status,
            p_new_status;

    END IF;


    -- -------------------------------------------------
    -- ACTUALIZAR PEDIDO
    -- -------------------------------------------------

    UPDATE public.orders

    SET
        status = p_new_status,

        review_status =
            CASE

                WHEN
                    v_current_status = 'pending'
                    AND p_new_status = 'accepted'
                    AND v_review_status = 'pending_review'

                THEN 'confirmed'

                ELSE review_status

            END

    WHERE id = p_order_id;


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
        v_current_status,
        p_new_status,
        'store_user',
        auth.uid(),
        p_reason

    );

END;
$$;


REVOKE ALL
ON FUNCTION public.change_order_status(
    uuid,
    text,
    text
)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION public.change_order_status(
    uuid,
    text,
    text
)
TO authenticated;