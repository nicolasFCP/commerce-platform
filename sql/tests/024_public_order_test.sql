BEGIN;

-- =====================================================
-- ACTUAR COMO VISITANTE ANÓNIMO
-- =====================================================

SET LOCAL ROLE anon;


-- =====================================================
-- CREAR PEDIDO PÚBLICO
-- 2 Coca-Cola 1.5L
-- =====================================================

SELECT public.place_order(
    (
        SELECT id
        FROM public.stores
        WHERE slug = 'mercado-demo'
        LIMIT 1
    ),

    'Cliente Web Prueba',

    '3009991111',

    jsonb_build_array(
        jsonb_build_object(
            'product_id',
            (
                SELECT p.id
                FROM public.products p
                JOIN public.stores s
                    ON s.id = p.store_id
                WHERE s.slug = 'mercado-demo'
                  AND p.name = 'Coca-Cola 1.5L'
                LIMIT 1
            ),
            'quantity',
            2
        )
    ),

    NULL,

    'delivery',

    'Calle 123 #45-67',

    'Pedido público de prueba'
) AS pedido_creado;


-- =====================================================
-- VOLVER A ADMIN PARA REVISAR EL RESULTADO
-- =====================================================

RESET ROLE;


-- =====================================================
-- REVISIÓN COMPLETA DEL PEDIDO
-- =====================================================

SELECT
    o.customer_name,
    o.customer_phone,
    o.status,

    o.subtotal,
    o.delivery_fee,
    o.total,

    oi.product_name,
    oi.quantity,
    oi.unit_price,
    oi.line_total,

    oe.event_type,
    oe.from_status,
    oe.to_status,
    oe.actor_type

FROM public.orders o

JOIN public.order_items oi
    ON oi.order_id = o.id

JOIN public.order_events oe
    ON oe.order_id = o.id

WHERE o.customer_phone = '3009991111';


-- No guardar datos de prueba
ROLLBACK;