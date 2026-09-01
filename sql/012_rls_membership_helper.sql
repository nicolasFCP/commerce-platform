CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.user_store_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT sm.store_id
    FROM public.store_members sm
    WHERE sm.user_id = (SELECT auth.uid())
      AND sm.active = true;
$$;

REVOKE EXECUTE
ON FUNCTION private.user_store_ids()
FROM PUBLIC;

GRANT USAGE
ON SCHEMA private
TO authenticated;

GRANT EXECUTE
ON FUNCTION private.user_store_ids()
TO authenticated;