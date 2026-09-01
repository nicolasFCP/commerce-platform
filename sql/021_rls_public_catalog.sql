-- =====================================================
-- CATÁLOGO PÚBLICO: STORES
-- =====================================================

DROP POLICY IF EXISTS stores_public_select
ON public.stores;

CREATE POLICY stores_public_select
ON public.stores
FOR SELECT
TO anon
USING (
    active = true
);

GRANT SELECT
ON TABLE public.stores
TO anon;


-- =====================================================
-- CATÁLOGO PÚBLICO: CATEGORIES
-- =====================================================

DROP POLICY IF EXISTS categories_public_select
ON public.categories;

CREATE POLICY categories_public_select
ON public.categories
FOR SELECT
TO anon
USING (
    active = true
    AND EXISTS (
        SELECT 1
        FROM public.stores s
        WHERE s.id = categories.store_id
          AND s.active = true
    )
);

GRANT SELECT
ON TABLE public.categories
TO anon;


-- =====================================================
-- CATÁLOGO PÚBLICO: PRODUCTS
-- =====================================================

DROP POLICY IF EXISTS products_public_select
ON public.products;

CREATE POLICY products_public_select
ON public.products
FOR SELECT
TO anon
USING (
    active = true
    AND available = true
    AND EXISTS (
        SELECT 1
        FROM public.stores s
        WHERE s.id = products.store_id
          AND s.active = true
    )
    AND EXISTS (
        SELECT 1
        FROM public.categories c
        WHERE c.id = products.category_id
          AND c.store_id = products.store_id
          AND c.active = true
    )
);

GRANT SELECT
ON TABLE public.products
TO anon;