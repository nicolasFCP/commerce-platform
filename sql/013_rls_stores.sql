ALTER TABLE public.stores
ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS stores_select_member
ON public.stores;

DROP POLICY IF EXISTS stores_update_member
ON public.stores;

CREATE POLICY stores_select_member
ON public.stores
FOR SELECT
TO authenticated
USING (
    id IN (
        SELECT private.user_store_ids()
    )
);

CREATE POLICY stores_update_member
ON public.stores
FOR UPDATE
TO authenticated
USING (
    id IN (
        SELECT private.user_store_ids()
    )
)
WITH CHECK (
    id IN (
        SELECT private.user_store_ids()
    )
);
GRANT SELECT, UPDATE
ON TABLE public.stores
TO authenticated;