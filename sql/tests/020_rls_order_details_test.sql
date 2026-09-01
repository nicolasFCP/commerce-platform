BEGIN;

-- Simular al owner de Mercado Demo
SELECT set_config(
    'request.jwt.claim.sub',
    (
        SELECT id::text
        FROM auth.users
        WHERE email = 'owner.mercadodemo@example.com'
        LIMIT 1
    ),
    true
);

SET LOCAL ROLE authenticated;

-- Ver productos y eventos accesibles mediante RLS
SELECT
    'item' AS tipo,
    product_name AS detalle,
    quantity::text || ' x $' || unit_price::text AS informacion
FROM public.order_items

UNION ALL

SELECT
    'evento' AS tipo,
    event_type AS detalle,
    COALESCE(from_status, 'NULL')
        || ' -> '
        || COALESCE(to_status, 'NULL') AS informacion
FROM public.order_events

ORDER BY tipo, detalle;

ROLLBACK;