-- =====================================================
-- REEMPLAZAR PRODUCTO DE UN PEDIDO
-- CONSERVANDO EL PRODUCTO ORIGINAL EN EL HISTORIAL
-- =====================================================

CREATE OR REPLACE FUNCTION public.replace_order_item(
    p_order_item_id uuid,
    p_replacement_product_id uuid,
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

    v_original_product_id uuid;
    v_original_quantity integer;
    v_item_status text;

    v_replacement_name text;
    v_replacement_price numeric;

    v_delivery_fee numeric;
    v_new_subtotal numeric;
BEGIN

    -- -------------------------------------------------
    -- OBTENER PRODUCTO ORIGINAL Y PEDIDO
    -- -------------------------------------------------

    SELECT
        oi.order_id,
        o.store_id,
        o.status,
        o.review_status,
        oi.product_id,
        oi.quantity,
        oi.item_status,
        o.delivery_fee
    INTO
        v_order_id,
        v_store_id,
        v_order_status,
        v_review_status,
        v_original_product_id,
        v_original_quantity,
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
    -- SOLO MODIFICAR ANTES DE PREPARACIÓN
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
    -- EL PRODUCTO ORIGINAL DEBE ESTAR ACTIVO
    -- -------------------------------------------------

    IF v_item_status <> 'active' THEN

        RAISE EXCEPTION
            'ORDER_ITEM_IS_NOT_ACTIVE';

    END IF;


    -- -------------------------------------------------
    -- NO REEMPLAZAR POR EL MISMO PRODUCTO
    -- -------------------------------------------------

    IF v_original_product_id =
        p_replacement_product_id
    THEN

        RAISE EXCEPTION
            'SAME_PRODUCT_REPLACEMENT';

    END IF;


    -- -------------------------------------------------
    -- VALIDAR PRODUCTO DE REEMPLAZO
    -- -------------------------------------------------

    SELECT
        p.name,
        p.price

    INTO
        v_replacement_name,
        v_replacement_price

    FROM public.products p

    WHERE p.id = p_replacement_product_id
      AND p.store_id = v_store_id
      AND p.active = true
      AND p.available = true;


    IF NOT FOUND THEN

        RAISE EXCEPTION
            'REPLACEMENT_PRODUCT_NOT_AVAILABLE';

    END IF;


    -- -------------------------------------------------
    -- MARCAR PRODUCTO ORIGINAL COMO REEMPLAZADO
    -- -------------------------------------------------

    UPDATE public.order_items

    SET
        item_status = 'replaced',
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
    -- CREAR NUEVO ITEM DE REEMPLAZO
    -- CONSERVANDO LA MISMA CANTIDAD
    -- -------------------------------------------------

    INSERT INTO public.order_items (
        order_id,
        product_id,
        product_name,
        quantity,
        unit_price,
        line_total,
        item_status,
        replacement_for_item_id
    )
    VALUES (
        v_order_id,
        p_replacement_product_id,
        v_replacement_name,
        v_original_quantity,
        v_replacement_price,
        v_replacement_price * v_original_quantity,
        'active',
        p_order_item_id
    );


    -- -------------------------------------------------
    -- RECALCULAR SUBTOTAL
    -- SOLO CON ITEMS ACTIVOS
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
    -- ACTUALIZAR PEDIDO
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
ON FUNCTION public.replace_order_item(
    uuid,
    uuid,
    text
)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION public.replace_order_item(
    uuid,
    uuid,
    text
)
TO authenticated;