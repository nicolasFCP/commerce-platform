ALTER TABLE public.orders
ADD CONSTRAINT orders_status_check
CHECK (
    status IN (
        'pending',
        'accepted',
        'preparing',
        'ready',
        'out_for_delivery',
        'completed',
        'rejected',
        'cancelled'
    )
);