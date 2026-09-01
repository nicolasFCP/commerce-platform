ALTER TABLE public.orders
ADD CONSTRAINT orders_fulfillment_type_check
CHECK (
    fulfillment_type IN (
        'delivery',
        'pickup'
    )
);