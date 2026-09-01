-- =====================================================
-- RLS: CUSTOMERS
-- =====================================================

ALTER TABLE public.customers
ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS customers_select_member
ON public.customers;

DROP POLICY IF EXISTS customers_insert_member
ON public.customers;

DROP POLICY IF EXISTS customers_update_member
ON public.customers;


CREATE POLICY customers_select_member
ON public.customers
FOR SELECT
TO authenticated
USING (
    store_id IN (
        SELECT private.user_store_ids()
    )
);


CREATE POLICY customers_insert_member
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (
    store_id IN (
        SELECT private.user_store_ids()
    )
);


CREATE POLICY customers_update_member
ON public.customers
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


GRANT SELECT, INSERT, UPDATE
ON TABLE public.customers
TO authenticated;


-- =====================================================
-- RLS: ORDERS
-- =====================================================

ALTER TABLE public.orders
ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS orders_select_member
ON public.orders;

DROP POLICY IF EXISTS orders_update_member
ON public.orders;


CREATE POLICY orders_select_member
ON public.orders
FOR SELECT
TO authenticated
USING (
    store_id IN (
        SELECT private.user_store_ids()
    )
);


CREATE POLICY orders_update_member
ON public.orders
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


GRANT SELECT, UPDATE
ON TABLE public.orders
TO authenticated;