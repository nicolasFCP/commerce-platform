-- =====================================================
-- REGISTRAR APROBACIÓN DEL CLIENTE
-- SOBRE LOS CAMBIOS DEL PEDIDO
-- =====================================================

CREATE OR REPLACE FUNCTION public.confirm_order_changes(
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
    v_review_status text;
BEGIN

    -- -------------------------------------------------
    -- OBTENER PEDIDO
    -- -------------------------------------------------

    SELECT
        store_id,
        status,
        review_status

    INTO
        v_store_id,
        v_order_status,
        v_review_status

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
    -- EL PEDIDO TODAVÍA DEBE ESTAR PENDIENTE
    -- -------------------------------------------------

    IF v_order_status <> 'pending' THEN

        RAISE EXCEPTION
            'ORDER_IS_NOT_PENDING';

    END IF;


    -- -------------------------------------------------
    -- DEBEN EXISTIR CAMBIOS ESPERANDO AL CLIENTE
    -- -------------------------------------------------

    IF v_review_status <>
        'changes_pending_customer'
    THEN

        RAISE EXCEPTION
            'NO_CUSTOMER_APPROVAL_PENDING';

    END IF;


    -- -------------------------------------------------
    -- CONFIRMAR REVISIÓN
    -- -------------------------------------------------

    UPDATE public.orders

    SET review_status = 'confirmed'

    WHERE id = p_order_id;

END;
$$;


-- =====================================================
-- PERMISOS
-- =====================================================

REVOKE ALL
ON FUNCTION public.confirm_order_changes(
    uuid
)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION public.confirm_order_changes(
    uuid
)
TO authenticated;