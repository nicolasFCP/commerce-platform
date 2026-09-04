-- =====================================================
-- CONFIRMAR PAGO DE UN PEDIDO
-- =====================================================

CREATE OR REPLACE FUNCTION public.confirm_order_payment(
    p_order_id uuid
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
    -- VALIDAR QUE EL USUARIO PERTENEZCA AL COMERCIO
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
    -- EVITAR CONFIRMAR DOS VECES
    -- -------------------------------------------------

    IF v_payment_status = 'paid' THEN

        RAISE EXCEPTION
            'PAYMENT_ALREADY_CONFIRMED';

    END IF;

-- -------------------------------------------------
-- EXIGIR COMPROBANTE ANTES DE CONFIRMAR
-- -------------------------------------------------

IF v_payment_status <> 'proof_received' THEN

    RAISE EXCEPTION
        'PAYMENT_PROOF_REQUIRED';

END IF;

    -- -------------------------------------------------
    -- EL PEDIDO DEBE HABER SIDO ACEPTADO
    -- -------------------------------------------------

    IF v_order_status <> 'accepted' THEN

        RAISE EXCEPTION
            'ORDER_MUST_BE_ACCEPTED_BEFORE_PAYMENT';

    END IF;


    -- -------------------------------------------------
    -- CONFIRMAR PAGO
    -- -------------------------------------------------

    UPDATE public.orders

    SET
        payment_status = 'paid',
        paid_at = now(),
        payment_verified_by = auth.uid()

    WHERE id = p_order_id;

END;
$$;


-- =====================================================
-- PERMISOS
-- =====================================================

REVOKE ALL
ON FUNCTION public.confirm_order_payment(
    uuid
)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION public.confirm_order_payment(
    uuid
)
TO authenticated;