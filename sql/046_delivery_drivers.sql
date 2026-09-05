CREATE TABLE IF NOT EXISTS public.delivery_drivers (

    id uuid
        PRIMARY KEY
        DEFAULT gen_random_uuid(),

    created_at timestamptz
        NOT NULL
        DEFAULT now(),

    store_id uuid
        NOT NULL
        REFERENCES public.stores(id)
        ON DELETE CASCADE,

    user_id uuid
        NOT NULL
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    name text
        NOT NULL,

    phone text,

    active boolean
        NOT NULL
        DEFAULT true,

    CONSTRAINT delivery_drivers_store_user_unique
        UNIQUE (store_id, user_id)
);


ALTER TABLE public.delivery_drivers
ENABLE ROW LEVEL SECURITY;