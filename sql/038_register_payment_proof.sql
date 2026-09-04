-- =====================================================
-- REGISTRAR COMPROBANTE DE PAGO RECIBIDO
-- =====================================================

CREATE OR REPLACE FUNCTION public.register_payment_proof(
    p_order_id uuid,
    p_payment_proof_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_store_id uuid;
    v_order_status text;
    v_payment_method text;
    v_payment_status text;
BEGIN

    -- -------------------------------------------------
    -- OBTENER INFORMACIÓN DEL PEDIDO
    -- -------------------------------------------------

    SELECT
        store_id,
        status,
        payment_method,
        payment_status

    INTO
        v_store_id,
        v_order_status,
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
            'NOT_AUTHORIZED_FOR_ORDER';

    END IF;


    -- -------------------------------------------------
    -- SOLO APLICA A TRANSFERENCIA
    -- -------------------------------------------------

    IF v_payment_method <> 'transfer' THEN

        RAISE EXCEPTION
            'PAYMENT_METHOD_IS_NOT_TRANSFER';

    END IF;


    -- -------------------------------------------------
    -- EL PEDIDO DEBE ESTAR ACEPTADO
    -- -------------------------------------------------

    IF v_order_status <> 'accepted' THEN

        RAISE EXCEPTION
            'ORDER_MUST_BE_ACCEPTED_BEFORE_PAYMENT';

    END IF;


    -- -------------------------------------------------
    -- SOLO DESDE PAGO PENDIENTE
    -- -------------------------------------------------

    IF v_payment_status <> 'pending' THEN

        RAISE EXCEPTION
            'PAYMENT_STATUS_IS_NOT_PENDING';

    END IF;


    -- -------------------------------------------------
    -- REGISTRAR COMPROBANTE
    -- -------------------------------------------------

    UPDATE public.orders

    SET
        payment_status = 'proof_received',

        payment_proof_url =
            NULLIF(
                btrim(
                    COALESCE(
                        p_payment_proof_url,
                        ''
                    )
                ),
                ''
            )

    WHERE id = p_order_id;

END;
$$;


-- =====================================================
-- PERMISOS
-- =====================================================

REVOKE ALL
ON FUNCTION public.register_payment_proof(
    uuid,
    text
)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION public.register_payment_proof(
    uuid,
    text
)
TO authenticated;