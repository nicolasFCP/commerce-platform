ALTER TABLE public.orders
ADD CONSTRAINT orders_subtotal_non_negative
CHECK (subtotal >= 0);

ALTER TABLE public.orders
ADD CONSTRAINT orders_delivery_fee_non_negative
CHECK (delivery_fee >= 0);

ALTER TABLE public.orders
ADD CONSTRAINT orders_total_non_negative
CHECK (total >= 0);