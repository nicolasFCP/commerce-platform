create table if not exists public.store_whatsapp_settings (

    id uuid primary key
        default gen_random_uuid(),

    created_at timestamptz not null
        default now(),

    updated_at timestamptz not null
        default now(),

    store_id uuid not null
        references public.stores(id)
        on delete cascade,

    phone_number_id text not null,

    whatsapp_business_account_id text,

    display_phone_number text,

    active boolean not null
        default true,

    constraint store_whatsapp_settings_store_id_key
        unique (store_id),

    constraint store_whatsapp_settings_phone_number_id_key
        unique (phone_number_id)
);


alter table public.store_whatsapp_settings
enable row level security;


create policy
"store members can read whatsapp settings"
on public.store_whatsapp_settings
for select
to authenticated
using (
    store_id in (
        select private.user_store_ids()
    )
);


create policy
"store members can insert whatsapp settings"
on public.store_whatsapp_settings
for insert
to authenticated
with check (
    store_id in (
        select private.user_store_ids()
    )
);


create policy
"store members can update whatsapp settings"
on public.store_whatsapp_settings
for update
to authenticated
using (
    store_id in (
        select private.user_store_ids()
    )
)
with check (
    store_id in (
        select private.user_store_ids()
    )
);


grant select, insert, update
on public.store_whatsapp_settings
to authenticated;