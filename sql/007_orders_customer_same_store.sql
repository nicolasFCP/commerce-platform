CREATE OR REPLACE FUNCTION public.validate_order_customer_same_store()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.customer_id IS NOT NULL
       AND NOT EXISTS (
            SELECT 1
            FROM public.customers
            WHERE id = NEW.customer_id
              AND store_id = NEW.store_id
       )
    THEN
        RAISE EXCEPTION
        'El cliente no pertenece al mismo comercio que el pedido';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_customer_same_store_trigger
ON public.orders;

CREATE TRIGGER orders_customer_same_store_trigger
BEFORE INSERT OR UPDATE OF customer_id, store_id
ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_customer_same_store();