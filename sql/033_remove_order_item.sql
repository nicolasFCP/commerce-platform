-- =====================================================
-- QUITAR PRODUCTO DE UN PEDIDO DURANTE LA REVISIÓN
-- SIN BORRAR SU HISTORIAL
-- =====================================================

CREATE OR REPLACE FUNCTION public.remove_order_item(
    p_order_item_id uuid,
    p_reason text DEFAULT 'Producto no disponible'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_order_id uuid;
    v_store_id uuid;

    v_order_status text;
    v_review_status text;

    v_item_status text;

    v_delivery_fee numeric;

    v_new_subtotal numeric;

    v_active_items integer;
BEGIN

    -- -------------------------------------------------
    -- OBTENER PRODUCTO Y PEDIDO
    -- -------------------------------------------------

    SELECT
        oi.order_id,
        o.store_id,
        o.status,
        o.review_status,
        oi.item_status,
        o.delivery_fee
    INTO
        v_order_id,
        v_store_id,
        v_order_status,
        v_review_status,
        v_item_status,
        v_delivery_fee
    FROM public.order_items oi

    JOIN public.orders o
        ON o.id = oi.order_id

    WHERE oi.id = p_order_item_id;


    IF v_order_id IS NULL THEN

        RAISE EXCEPTION
            'ORDER_ITEM_NOT_FOUND';

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
    -- SOLO SE PUEDEN AJUSTAR PEDIDOS
    -- ANTES DE EMPEZAR LA PREPARACIÓN
    -- -------------------------------------------------

    IF v_order_status NOT IN (
        'pending',
        'accepted'
    ) THEN

        RAISE EXCEPTION
            'ORDER_CAN_NO_LONGER_BE_EDITED';

    END IF;


    -- -------------------------------------------------
    -- VALIDAR ETAPA DE REVISIÓN
    -- -------------------------------------------------

    IF v_review_status NOT IN (
        'pending_review',
        'changes_pending_customer'
    ) THEN

        RAISE EXCEPTION
            'ORDER_REVIEW_ALREADY_FINISHED';

    END IF;


    -- -------------------------------------------------
    -- SOLO QUITAR ITEMS ACTIVOS
    -- -------------------------------------------------

    IF v_item_status <> 'active' THEN

        RAISE EXCEPTION
            'ORDER_ITEM_IS_NOT_ACTIVE';

    END IF;


    -- -------------------------------------------------
    -- EVITAR QUITAR EL ÚLTIMO PRODUCTO ACTIVO
    -- -------------------------------------------------

    SELECT COUNT(*)

    INTO v_active_items

    FROM public.order_items

    WHERE order_id = v_order_id
      AND item_status = 'active';


    IF v_active_items <= 1 THEN

        RAISE EXCEPTION
            'CANNOT_REMOVE_LAST_ACTIVE_ITEM';

    END IF;


    -- -------------------------------------------------
    -- MARCAR PRODUCTO COMO QUITADO
    -- -------------------------------------------------

    UPDATE public.order_items

    SET
        item_status = 'removed',
        changed_at = now(),
        changed_by = auth.uid(),
        change_reason =
            COALESCE(
                NULLIF(
                    btrim(p_reason),
                    ''
                ),
                'Producto no disponible'
            )

    WHERE id = p_order_item_id;


    -- -------------------------------------------------
    -- RECALCULAR SUBTOTAL
    -- SOLO CON PRODUCTOS ACTIVOS
    -- -------------------------------------------------

    SELECT
        COALESCE(
            SUM(line_total),
            0
        )

    INTO v_new_subtotal

    FROM public.order_items

    WHERE order_id = v_order_id
      AND item_status = 'active';


    -- -------------------------------------------------
    -- ACTUALIZAR TOTAL DEL PEDIDO
    -- -------------------------------------------------

    UPDATE public.orders

    SET
        subtotal = v_new_subtotal,

        total =
            v_new_subtotal
            +
            COALESCE(
                v_delivery_fee,
                0
            ),

        review_status =
            'changes_pending_customer'

    WHERE id = v_order_id;

END;
$$;


-- =====================================================
-- PERMISOS
-- =====================================================

REVOKE ALL
ON FUNCTION public.remove_order_item(
    uuid,
    text
)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION public.remove_order_item(
    uuid,
    text
)
TO authenticated;