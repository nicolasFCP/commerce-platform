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
    'Tienda RLS B',
    'tienda-rls-b',
    '3007770000',
    '#111827',
    true
);

INSERT INTO public.categories (
    store_id,
    name,
    slug,
    active
)
SELECT
    id,
    'Categoria Privada B',
    'categoria-privada-b',
    true
FROM public.stores
WHERE slug = 'tienda-rls-b';

INSERT INTO public.products (
    store_id,
    category_id,
    name,
    price,
    available,
    active
)
SELECT
    s.id,
    c.id,
    'Producto Privado B',
    9999,
    true,
    true
FROM public.stores s
JOIN public.categories c
    ON c.store_id = s.id
WHERE s.slug = 'tienda-rls-b'
  AND c.slug = 'categoria-privada-b';


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
-- VER QUÉ CATÁLOGO PUEDE LEER
-- =====================================================

SELECT
    'categoria' AS tipo,
    name,
    store_id
FROM public.categories

UNION ALL

SELECT
    'producto' AS tipo,
    name,
    store_id
FROM public.products

ORDER BY tipo, name;


ROLLBACK;