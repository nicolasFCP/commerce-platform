-- =====================================================
-- RLS: ORDER_ITEMS
-- =====================================================

ALTER TABLE public.order_items
ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS order_items_select_member
ON public.order_items;

CREATE POLICY order_items_select_member
ON public.order_items
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.orders o
        WHERE o.id = order_items.order_id
          AND o.store_id IN (
              SELECT private.user_store_ids()
          )
    )
);

GRANT SELECT
ON TABLE public.order_items
TO authenticated;


-- =====================================================
-- RLS: ORDER_EVENTS
-- =====================================================

ALTER TABLE public.order_events
ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS order_events_select_member
ON public.order_events;

CREATE POLICY order_events_select_member
ON public.order_events
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.orders o
        WHERE o.id = order_events.order_id
          AND o.store_id IN (
              SELECT private.user_store_ids()
          )
    )
);

GRANT SELECT
ON TABLE public.order_events
TO authenticated;