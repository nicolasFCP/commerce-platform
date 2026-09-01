ALTER TABLE public.categories
ADD CONSTRAINT categories_id_store_unique
UNIQUE (id, store_id);

ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_category_id_fkey;

ALTER TABLE public.products
ADD CONSTRAINT products_category_same_store_fkey
FOREIGN KEY (category_id, store_id)
REFERENCES public.categories (id, store_id)
ON UPDATE CASCADE
ON DELETE CASCADE;