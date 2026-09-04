-- =====================================================
-- FUNCIÓN INTERNA V2
-- AGREGA MÉTODO DE PAGO SIN MODIFICAR EL FLUJO ACTUAL
-- =====================================================

CREATE OR REPLACE FUNCTION private.create_public_order_v2(
    p_store_id uuid,
    p_customer_name text,
    p_customer_phone text,
    p_items jsonb,
    p_customer_email text DEFAULT NULL,
    p_fulfillment_type text DEFAULT 'delivery',
    p_delivery_address text DEFAULT NULL,
    p_notes text DEFAULT NULL,
    p_payment_method text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_order_id uuid;
BEGIN

    -- -------------------------------------------------
    -- VALIDAR MÉTODO DE PAGO
    -- -------------------------------------------------

    IF p_payment_method NOT IN (
        'transfer',
        'cash_on_delivery'
    ) THEN

        RAISE EXCEPTION
            'INVALID_PAYMENT_METHOD';

    END IF;


    -- -------------------------------------------------
    -- UTILIZAR LA FUNCIÓN DE PEDIDOS YA PROBADA
    -- -------------------------------------------------

    v_order_id :=
        private.create_public_order(
            p_store_id,
            p_customer_name,
            p_customer_phone,
            p_items,
            p_customer_email,
            p_fulfillment_type,
            p_delivery_address,
            p_notes
        );


    -- -------------------------------------------------
    -- AGREGAR INFORMACIÓN DE PAGO
    -- -------------------------------------------------

    UPDATE public.orders

    SET
        payment_method = p_payment_method,
        payment_status = 'pending'

    WHERE id = v_order_id;


    RETURN v_order_id;

END;
$$;


-- =====================================================
-- FUNCIÓN PÚBLICA V2 PARA EL FRONTEND
-- =====================================================

CREATE OR REPLACE FUNCTION public.place_order_v2(
    p_store_id uuid,
    p_customer_name text,
    p_customer_phone text,
    p_items jsonb,
    p_customer_email text DEFAULT NULL,
    p_fulfillment_type text DEFAULT 'delivery',
    p_delivery_address text DEFAULT NULL,
    p_notes text DEFAULT NULL,
    p_payment_method text DEFAULT NULL
)
RETURNS uuid
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$

    SELECT private.create_public_order_v2(
        p_store_id,
        p_customer_name,
        p_customer_phone,
        p_items,
        p_customer_email,
        p_fulfillment_type,
        p_delivery_address,
        p_notes,
        p_payment_method
    );

$$;


-- =====================================================
-- PERMISOS
-- =====================================================

REVOKE ALL
ON FUNCTION private.create_public_order_v2(
    uuid,
    text,
    text,
    jsonb,
    text,
    text,
    text,
    text,
    text
)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION private.create_public_order_v2(
    uuid,
    text,
    text,
    jsonb,
    text,
    text,
    text,
    text,
    text
)
TO anon, authenticated;


REVOKE ALL
ON FUNCTION public.place_order_v2(
    uuid,
    text,
    text,
    jsonb,
    text,
    text,
    text,
    text,
    text
)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION public.place_order_v2(
    uuid,
    text,
    text,
    jsonb,
    text,
    text,
    text,
    text,
    text
)
TO anon, authenticated;