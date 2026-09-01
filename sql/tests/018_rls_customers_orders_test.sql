BEGIN;

-- =====================================================
-- CREAR SEGUNDA TIENDA TEMPORAL
-- =====================================================

INSERT INTO public.stores (
    name,
    slug,
    phone,
    primary_color,
    active
)
VALUES (
    'Tienda RLS Clientes B',
    'tienda-rls-clientes-b',
    '3008880000',
    '#111827',
    true
);


-- =====================================================
-- CREAR CLIENTE TEMPORAL DE ESA TIENDA
-- =====================================================

INSERT INTO public.customers (
    store_id,
    name,
    phone,
    active
)
SELECT
    id,
    'Cliente Privado B',
    '3008881111',
    true
FROM public.stores
WHERE slug = 'tienda-rls-clientes-b';


-- =====================================================
-- CREAR PEDIDO TEMPORAL DE ESA TIENDA
-- =====================================================

INSERT INTO public.orders (
    store_id,
    customer_id,
    customer_name,
    customer_phone,
    fulfillment_type,
    delivery_address,
    status,
    subtotal,
    delivery_fee,
    total
)
SELECT
    s.id,
    c.id,
    c.name,
    c.phone,
    'delivery',
    'Dirección privada B',
    'pending',
    10000,
    2000,
    12000
FROM public.stores s
JOIN public.customers c
    ON c.store_id = s.id
WHERE s.slug = 'tienda-rls-clientes-b'
  AND c.phone = '3008881111';


-- =====================================================
-- SIMULAR OWNER DE MERCADO DEMO
-- =====================================================

SELECT set_config(
    'request.jwt.claim.sub',
    (
        SELECT id::text
        FROM auth.users
        WHERE email = 'owner.mercadodemo@example.com'
        LIMIT 1
    ),
    true
);

SET LOCAL ROLE authenticated;


-- =====================================================
-- VER QUÉ CLIENTES Y PEDIDOS PUEDE LEER
-- =====================================================

SELECT
    'cliente' AS tipo,
    name AS nombre,
    phone AS detalle
FROM public.customers

UNION ALL

SELECT
    'pedido' AS tipo,
    customer_name AS nombre,
    status AS detalle
FROM public.orders

ORDER BY tipo, nombre;


ROLLBACK;