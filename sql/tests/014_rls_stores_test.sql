BEGIN;

-- Simula la sesión del owner de Mercado Demo.
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

-- A partir de aquí actuamos como usuario autenticado.
SET LOCAL ROLE authenticated;

-- 1. Ver qué usuario está simulando Supabase.
SELECT auth.uid() AS usuario_autenticado;

-- 2. Ver qué comercio reconoce la función de membresía.
SELECT private.user_store_ids() AS tienda_permitida;

-- 3. Intentar consultar stores pasando por RLS.
SELECT
    id,
    name,
    slug
FROM public.stores
ORDER BY name;

ROLLBACK;