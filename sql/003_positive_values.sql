ALTER TABLE public.products
ADD CONSTRAINT products_price_non_negative
CHECK (price >= 0);

ALTER TABLE public.order_items
ADD CONSTRAINT order_items_quantity_positive
CHECK (quantity > 0);

ALTER TABLE public.order_items
ADD CONSTRAINT order_items_unit_price_non_negative
CHECK (unit_price >= 0);

ALTER TABLE public.order_items
ADD CONSTRAINT order_items_line_total_non_negative
CHECK (line_total >= 0);