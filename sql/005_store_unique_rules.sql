ALTER TABLE public.categories
ADD CONSTRAINT categories_store_slug_unique
UNIQUE (store_id, slug);

ALTER TABLE public.customers
ADD CONSTRAINT customers_store_phone_unique
UNIQUE (store_id, phone);