CREATE TABLE IF NOT EXISTS public.delivery_assignments (

    id uuid
        PRIMARY KEY
        DEFAULT gen_random_uuid(),

    created_at timestamptz
        NOT NULL
        DEFAULT now(),

    order_id uuid
        NOT NULL
        REFERENCES public.orders(id)
        ON DELETE CASCADE,

    driver_id uuid
        NOT NULL
        REFERENCES public.delivery_drivers(id)
        ON DELETE RESTRICT,

    assigned_by uuid
        REFERENCES auth.users(id)
        ON DELETE SET NULL,

    active boolean
        NOT NULL
        DEFAULT true,

    picked_up_at timestamptz,

    completed_at timestamptz
);


CREATE UNIQUE INDEX IF NOT EXISTS
    delivery_assignments_one_active_per_order

ON public.delivery_assignments(order_id)

WHERE active = true;


ALTER TABLE public.delivery_assignments
ENABLE ROW LEVEL SECURITY;