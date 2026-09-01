BEGIN;

-- Simular visitante sin iniciar sesión
SET LOCAL ROLE anon;

-- Comercios visibles
SELECT
    'comercio' AS tipo,
    name,
    slug
FROM public.stores

UNION ALL

-- Categorías visibles
SELECT
    'categoria' AS tipo,
    name,
    slug
FROM public.categories

UNION ALL

-- Productos visibles
SELECT
    'producto' AS tipo,
    name,
    price::text AS slug
FROM public.products

ORDER BY tipo, name;

ROLLBACK;