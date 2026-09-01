ALTER TABLE public.store_members
ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS store_members_select_own
ON public.store_members;

CREATE POLICY store_members_select_own
ON public.store_members
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
    AND active = true
);