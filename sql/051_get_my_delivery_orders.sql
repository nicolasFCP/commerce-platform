CREATE OR REPLACE FUNCTION public.get_my_delivery_orders()
RETURNS TABLE (

    assignment_id uuid,
    order_id uuid,

    customer_name text,
    customer_phone text,
    delivery_address text,
    notes text,

    status text,

    total numeric,

    payment_method text,
    payment_status text,

    assigned_at timestamptz,
    picked_up_at timestamptz,
    completed_at timestamptz,

    items jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$

    SELECT

        da.id AS assignment_id,

        o.id AS order_id,

        o.customer_name,
        o.customer_phone,
        o.delivery_address,
        o.notes,

        o.status,

        o.total,

        o.payment_method,
        o.payment_status,

        da.created_at AS assigned_at,
        da.picked_up_at,
        da.completed_at,

        COALESCE(

            (
                SELECT jsonb_agg(

                    jsonb_build_object(
                        'id', oi.id,
                        'product_name', oi.product_name,
                        'quantity', oi.quantity,
                        'unit_price', oi.unit_price,
                        'line_total', oi.line_total
                    )

                    ORDER BY oi.product_name
                )

                FROM public.order_items oi

                WHERE oi.order_id = o.id
                  AND oi.item_status = 'active'
            ),

            '[]'::jsonb

        ) AS items

    FROM public.delivery_assignments da

    JOIN public.delivery_drivers dd
        ON dd.id = da.driver_id

    JOIN public.orders o
        ON o.id = da.order_id

    WHERE dd.user_id = auth.uid()
      AND dd.active = true
      AND da.active = true

    ORDER BY da.created_at DESC;

$$;


REVOKE ALL
ON FUNCTION public.get_my_delivery_orders()
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION public.get_my_delivery_orders()
TO authenticated;