-- =====================================================
-- SEÑAL REALTIME SEGURA PARA EL CATÁLOGO PÚBLICO
-- =====================================================

create table if not exists public.catalog_realtime (
    store_id uuid primary key
        references public.stores(id)
        on delete cascade,

    version bigint not null default 0,

    updated_at timestamptz
        not null
        default now()
);


-- =====================================================
-- RLS
-- =====================================================

alter table public.catalog_realtime
enable row level security;


drop policy if exists
    catalog_realtime_public_select
on public.catalog_realtime;


create policy
    catalog_realtime_public_select
on public.catalog_realtime
for select
to anon
using (true);


revoke all
on public.catalog_realtime
from anon,
     authenticated;


grant select
on public.catalog_realtime
to anon;


-- =====================================================
-- CREAR SEÑAL INICIAL PARA LOS COMERCIOS EXISTENTES
-- =====================================================

insert into public.catalog_realtime (
    store_id
)
select
    id
from public.stores
on conflict (store_id)
do nothing;


-- =====================================================
-- FUNCIÓN INTERNA PARA AVISAR CAMBIOS
-- =====================================================

create or replace function
private.bump_catalog_realtime()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$

declare

    v_store_id uuid;

begin

    if TG_OP = 'DELETE' then

        v_store_id :=
            OLD.store_id;

    else

        v_store_id :=
            NEW.store_id;

    end if;


    insert into public.catalog_realtime as cr (
        store_id,
        version,
        updated_at
    )
    values (
        v_store_id,
        1,
        now()
    )

    on conflict (store_id)

    do update set

        version =
            cr.version + 1,

        updated_at =
            now();


    if TG_OP = 'DELETE' then

        return OLD;

    end if;


    return NEW;

end;

$$;


-- =====================================================
-- PRODUCTOS
-- =====================================================

drop trigger if exists
    products_catalog_realtime
on public.products;


create trigger
    products_catalog_realtime

after insert or update or delete
on public.products

for each row

execute function
    private.bump_catalog_realtime();


-- =====================================================
-- CATEGORÍAS
-- =====================================================

drop trigger if exists
    categories_catalog_realtime
on public.categories;


create trigger
    categories_catalog_realtime

after insert or update or delete
on public.categories

for each row

execute function
    private.bump_catalog_realtime();


-- =====================================================
-- MÉTODOS DE PAGO
-- =====================================================

drop trigger if exists
    payment_settings_catalog_realtime
on public.store_payment_settings;


create trigger
    payment_settings_catalog_realtime

after insert or update or delete
on public.store_payment_settings

for each row

execute function
    private.bump_catalog_realtime();


-- =====================================================
-- HABILITAR REALTIME
-- =====================================================

alter publication supabase_realtime
add table public.catalog_realtime;