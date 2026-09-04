-- =====================================================
-- ESTADO DE REVISIÓN DEL PEDIDO
-- =====================================================

ALTER TABLE public.orders

ADD COLUMN IF NOT EXISTS review_status text
NOT NULL
DEFAULT 'pending_review';


-- =====================================================
-- ESTADO INDIVIDUAL DE LOS PRODUCTOS DEL PEDIDO
-- =====================================================

ALTER TABLE public.order_items

ADD COLUMN IF NOT EXISTS item_status text
NOT NULL
DEFAULT 'active',

ADD COLUMN IF NOT EXISTS changed_at timestamptz,

ADD COLUMN IF NOT EXISTS changed_by uuid
REFERENCES auth.users(id)
ON DELETE SET NULL,

ADD COLUMN IF NOT EXISTS change_reason text,

ADD COLUMN IF NOT EXISTS replacement_for_item_id uuid
REFERENCES public.order_items(id)
ON DELETE SET NULL;


-- =====================================================
-- ESTADOS PERMITIDOS PARA REVISIÓN DEL PEDIDO
-- =====================================================

DO $$
BEGIN

    IF NOT EXISTS (

        SELECT 1
        FROM pg_constraint
        WHERE conname =
            'orders_review_status_check'
        AND conrelid =
            'public.orders'::regclass

    ) THEN

        ALTER TABLE public.orders

        ADD CONSTRAINT
            orders_review_status_check

        CHECK (
            review_status IN (
                'pending_review',
                'changes_pending_customer',
                'confirmed',
                'not_applicable'
            )
        );

    END IF;

END;
$$;


-- =====================================================
-- ESTADOS PERMITIDOS PARA PRODUCTOS DEL PEDIDO
-- =====================================================

DO $$
BEGIN

    IF NOT EXISTS (

        SELECT 1
        FROM pg_constraint
        WHERE conname =
            'order_items_item_status_check'
        AND conrelid =
            'public.order_items'::regclass

    ) THEN

        ALTER TABLE public.order_items

        ADD CONSTRAINT
            order_items_item_status_check

        CHECK (
            item_status IN (
                'active',
                'removed',
                'replaced'
            )
        );

    END IF;

END;
$$;


-- =====================================================
-- PEDIDOS TERMINADOS ANTERIORES
-- NO NECESITAN REVISIÓN
-- =====================================================

UPDATE public.orders

SET review_status = 'not_applicable'

WHERE status IN (
    'completed',
    'rejected',
    'cancelled'
);