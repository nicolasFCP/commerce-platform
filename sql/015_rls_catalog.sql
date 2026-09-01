-- =====================================================
-- RLS: CATEGORIES
-- =====================================================

ALTER TABLE public.categories
ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS categories_select_member
ON public.categories;

DROP POLICY IF EXISTS categories_insert_member
ON public.categories;

DROP POLICY IF EXISTS categories_update_member
ON public.categories;

DROP POLICY IF EXISTS categories_delete_member
ON public.categories;


CREATE POLICY categories_select_member
ON public.categories
FOR SELECT
TO authenticated
USING (
    store_id IN (
        SELECT private.user_store_ids()
    )
);


CREATE POLICY categories_insert_member
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (
    store_id IN (
        SELECT private.user_store_ids()
    )
);


CREATE POLICY categories_update_member
ON public.categories
FOR UPDATE
TO authenticated
USING (
    store_id IN (
        SELECT private.user_store_ids()
    )
)
WITH CHECK (
    store_id IN (
        SELECT private.user_store_ids()
    )
);


CREATE POLICY categories_delete_member
ON public.categories
FOR DELETE
TO authenticated
USING (
    store_id IN (
        SELECT private.user_store_ids()
    )
);


GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.categories
TO authenticated;


-- =====================================================
-- RLS: PRODUCTS
-- =====================================================

ALTER TABLE public.products
ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS products_select_member
ON public.products;

DROP POLICY IF EXISTS products_insert_member
ON public.products;

DROP POLICY IF EXISTS products_update_member
ON public.products;

DROP POLICY IF EXISTS products_delete_member
ON public.products;


CREATE POLICY products_select_member
ON public.products
FOR SELECT
TO authenticated
USING (
    store_id IN (
        SELECT private.user_store_ids()
    )
);


CREATE POLICY products_insert_member
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
    store_id IN (
        SELECT private.user_store_ids()
    )
);


CREATE POLICY products_update_member
ON public.products
FOR UPDATE
TO authenticated
USING (
    store_id IN (
        SELECT private.user_store_ids()
    )
)
WITH CHECK (
    store_id IN (
        SELECT private.user_store_ids()
    )
);


CREATE POLICY products_delete_member
ON public.products
FOR DELETE
TO authenticated
USING (
    store_id IN (
        SELECT private.user_store_ids()
    )
);


GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.products
TO authenticated;