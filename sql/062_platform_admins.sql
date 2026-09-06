-- =====================================================
-- ADMINISTRADORES DE COMMERCE PLATFORM
-- =====================================================

create table if not exists public.platform_admins (

    user_id uuid primary key
        references auth.users(id)
        on delete cascade,

    created_at timestamptz
        not null
        default now(),

    active boolean
        not null
        default true
);


-- =====================================================
-- RLS
-- =====================================================

alter table public.platform_admins
enable row level security;


-- =====================================================
-- SOLO BACKEND PUEDE CONSULTAR ESTA TABLA
-- =====================================================

revoke all
on public.platform_admins
from anon;

revoke all
on public.platform_admins
from authenticated;


grant select
on public.platform_admins
to service_role;


-- =====================================================
-- MARCAR COMO ADMINISTRADOR AL OWNER DE MERCADO DEMO
-- =====================================================

insert into public.platform_admins (
    user_id,
    active
)
select
    id,
    true
from auth.users
where email = 'owner.mercadodemo@example.com'
on conflict (user_id)
do update
set active = true;