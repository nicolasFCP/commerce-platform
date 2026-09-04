CREATE OR REPLACE FUNCTION public.get_public_payment_methods(
    p_store_id uuid
)
RETURNS TABLE (
    transfer_enabled boolean,
    cash_on_delivery_enabled boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT
        COALESCE(
            settings.transfer_enabled,
            false
        ) AS transfer_enabled,

        COALESCE(
            settings.cash_on_delivery_enabled,
            false
        ) AS cash_on_delivery_enabled

    FROM public.stores store

    LEFT JOIN public.store_payment_settings settings
        ON settings.store_id = store.id

    WHERE store.id = p_store_id
      AND store.active = true;
$$;


REVOKE ALL
ON FUNCTION public.get_public_payment_methods(uuid)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION public.get_public_payment_methods(uuid)
TO anon, authenticated;