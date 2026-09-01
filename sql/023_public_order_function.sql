-- =====================================================
-- FUNCIÓN INTERNA PARA CREAR PEDIDOS
-- =====================================================

CREATE OR REPLACE FUNCTION private.create_public_order(
    p_store_id uuid,
    p_customer_name text,
    p_customer_phone text,
    p_items jsonb,
    p_customer_email text DEFAULT NULL,
    p_fulfillment_type text DEFAULT 'delivery',
    p_delivery_address text DEFAULT NULL,
    p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_customer_id uuid;
    v_order_id uuid;

    v_item jsonb;
    v_product_id uuid;
    v_quantity integer;

    v_product_name text;
    v_product_price numeric;

    v_subtotal numeric := 0;
    v_delivery_fee numeric := 0;
BEGIN

    -- -------------------------------------------------
    -- VALIDAR COMERCIO
    -- -------------------------------------------------

    IF NOT EXISTS (
        SELECT 1
        FROM public.stores s
        WHERE s.id = p_store_id
          AND s.active = true
    ) THEN
        RAISE EXCEPTION 'STORE_NOT_AVAILABLE';
    END IF;


    -- -------------------------------------------------
    -- VALIDAR CLIENTE
    -- -------------------------------------------------

    IF btrim(COALESCE(p_customer_name, '')) = '' THEN
        RAISE EXCEPTION 'CUSTOMER_NAME_REQUIRED';
    END IF;

    IF btrim(COALESCE(p_customer_phone, '')) = '' THEN
        RAISE EXCEPTION 'CUSTOMER_PHONE_REQUIRED';
    END IF;


    -- -------------------------------------------------
    -- VALIDAR TIPO DE ENTREGA
    -- -------------------------------------------------

    IF p_fulfillment_type NOT IN ('delivery', 'pickup') THEN
        RAISE EXCEPTION 'INVALID_FULFILLMENT_TYPE';
    END IF;

    IF p_fulfillment_type = 'delivery'
       AND btrim(COALESCE(p_delivery_address, '')) = '' THEN
        RAISE EXCEPTION 'DELIVERY_ADDRESS_REQUIRED';
    END IF;


    -- -------------------------------------------------
    -- VALIDAR ITEMS
    -- -------------------------------------------------

    IF p_items IS NULL
       OR jsonb_typeof(p_items) <> 'array'
       OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'ORDER_ITEMS_REQUIRED';
    END IF;


    -- -------------------------------------------------
    -- CREAR O ACTUALIZAR CLIENTE
    -- -------------------------------------------------

    INSERT INTO public.customers AS c (
        store_id,
        name,
        phone,
        email,
        active
    )
    VALUES (
        p_store_id,
        btrim(p_customer_name),
        btrim(p_customer_phone),
        NULLIF(btrim(COALESCE(p_customer_email, '')), ''),
        true
    )

    ON CONFLICT (store_id, phone)
    DO UPDATE SET
        name = EXCLUDED.name,
        email = COALESCE(EXCLUDED.email, c.email)

    RETURNING id
    INTO v_customer_id;


    -- -------------------------------------------------
    -- CREAR PEDIDO INICIAL
    -- -------------------------------------------------

    INSERT INTO public.orders (
        store_id,
        customer_id,
        customer_name,
        customer_phone,
        customer_email,
        fulfillment_type,
        delivery_address,
        notes,
        status,
        subtotal,
        delivery_fee,
        total
    )
    VALUES (
        p_store_id,
        v_customer_id,
        btrim(p_customer_name),
        btrim(p_customer_phone),
        NULLIF(btrim(COALESCE(p_customer_email, '')), ''),
        p_fulfillment_type,
        NULLIF(btrim(COALESCE(p_delivery_address, '')), ''),
        NULLIF(btrim(COALESCE(p_notes, '')), ''),
        'pending',
        0,
        0,
        0
    )
    RETURNING id
    INTO v_order_id;


    -- -------------------------------------------------
    -- AGREGAR PRODUCTOS
    -- -------------------------------------------------

    FOR v_item IN
        SELECT value
        FROM jsonb_array_elements(p_items)
    LOOP

        BEGIN
            v_product_id :=
                (v_item ->> 'product_id')::uuid;

            v_quantity :=
                (v_item ->> 'quantity')::integer;

        EXCEPTION
            WHEN OTHERS THEN
                RAISE EXCEPTION 'INVALID_ORDER_ITEM';
        END;


        IF v_quantity < 1 OR v_quantity > 100 THEN
            RAISE EXCEPTION 'INVALID_QUANTITY';
        END IF;


        SELECT
            p.name,
            p.price
        INTO
            v_product_name,
            v_product_price
        FROM public.products p
        WHERE p.id = v_product_id
          AND p.store_id = p_store_id
          AND p.active = true
          AND p.available = true;


        IF NOT FOUND THEN
            RAISE EXCEPTION 'PRODUCT_NOT_AVAILABLE';
        END IF;


        INSERT INTO public.order_items (
            order_id,
            product_id,
            product_name,
            quantity,
            unit_price,
            line_total
        )
        VALUES (
            v_order_id,
            v_product_id,
            v_product_name,
            v_quantity,
            v_product_price,
            v_product_price * v_quantity
        );


        v_subtotal :=
            v_subtotal + (v_product_price * v_quantity);

    END LOOP;


    -- -------------------------------------------------
    -- ACTUALIZAR TOTALES
    -- -------------------------------------------------

    UPDATE public.orders
    SET
        subtotal = v_subtotal,
        delivery_fee = v_delivery_fee,
        total = v_subtotal + v_delivery_fee
    WHERE id = v_order_id;


    -- -------------------------------------------------
    -- CREAR EVENTO INICIAL
    -- -------------------------------------------------

    INSERT INTO public.order_events (
        order_id,
        event_type,
        from_status,
        to_status,
        actor_type
    )
    VALUES (
        v_order_id,
        'created',
        NULL,
        'pending',
        'system'
    );


    RETURN v_order_id;

END;
$$;


-- =====================================================
-- FUNCIÓN PÚBLICA QUE LLAMARÁ EL FRONTEND
-- =====================================================

CREATE OR REPLACE FUNCTION public.place_order(
    p_store_id uuid,
    p_customer_name text,
    p_customer_phone text,
    p_items jsonb,
    p_customer_email text DEFAULT NULL,
    p_fulfillment_type text DEFAULT 'delivery',
    p_delivery_address text DEFAULT NULL,
    p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
    SELECT private.create_public_order(
        p_store_id,
        p_customer_name,
        p_customer_phone,
        p_items,
        p_customer_email,
        p_fulfillment_type,
        p_delivery_address,
        p_notes
    );
$$;


-- =====================================================
-- PERMISOS
-- =====================================================

REVOKE ALL
ON FUNCTION private.create_public_order(
    uuid,
    text,
    text,
    jsonb,
    text,
    text,
    text,
    text
)
FROM PUBLIC;


GRANT USAGE
ON SCHEMA private
TO anon, authenticated;


GRANT EXECUTE
ON FUNCTION private.create_public_order(
    uuid,
    text,
    text,
    jsonb,
    text,
    text,
    text,
    text
)
TO anon, authenticated;


REVOKE ALL
ON FUNCTION public.place_order(
    uuid,
    text,
    text,
    jsonb,
    text,
    text,
    text,
    text
)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION public.place_order(
    uuid,
    text,
    text,
    jsonb,
    text,
    text,
    text,
    text
)
TO anon, authenticated;