CREATE OR REPLACE FUNCTION public.validate_order_item_product_same_store()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.product_id IS NOT NULL
       AND NOT EXISTS (
            SELECT 1
            FROM public.orders o
            JOIN public.products p
              ON p.id = NEW.product_id
            WHERE o.id = NEW.order_id
              AND o.store_id = p.store_id
       )
    THEN
        RAISE EXCEPTION
        'El producto no pertenece al mismo comercio que el pedido';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS order_items_product_same_store_trigger
ON public.order_items;

CREATE TRIGGER order_items_product_same_store_trigger
BEFORE INSERT OR UPDATE OF order_id, product_id
ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_item_product_same_store();