-- =====================================================
-- CONVERSACIONES DE WHATSAPP
-- =====================================================

create table if not exists public.whatsapp_conversations (

    id uuid primary key
        default gen_random_uuid(),

    created_at timestamptz not null
        default now(),

    updated_at timestamptz not null
        default now(),

    store_id uuid not null
        references public.stores(id)
        on delete cascade,

    customer_phone text not null,

    customer_name text,

    last_message_at timestamptz,

    active boolean not null
        default true,

    constraint whatsapp_conversations_store_customer_key
        unique (
            store_id,
            customer_phone
        )
);


-- =====================================================
-- MENSAJES DE WHATSAPP
-- =====================================================

create table if not exists public.whatsapp_messages (

    id uuid primary key
        default gen_random_uuid(),

    created_at timestamptz not null
        default now(),

    store_id uuid not null
        references public.stores(id)
        on delete cascade,

    conversation_id uuid not null
        references public.whatsapp_conversations(id)
        on delete cascade,

    order_id uuid
        references public.orders(id)
        on delete set null,

    whatsapp_message_id text not null,

    direction text not null,

    message_type text not null,

    message_text text,

    sender_phone text,

    recipient_phone text,

    message_status text,

    raw_payload jsonb,

    constraint whatsapp_messages_message_id_key
        unique (whatsapp_message_id),

    constraint whatsapp_messages_direction_check
        check (
            direction in (
                'incoming',
                'outgoing'
            )
        )
);


-- =====================================================
-- RLS
-- =====================================================

alter table public.whatsapp_conversations
enable row level security;


alter table public.whatsapp_messages
enable row level security;


-- =====================================================
-- LECTURA PARA MIEMBROS DEL COMERCIO
-- =====================================================

create policy
"store members can read whatsapp conversations"
on public.whatsapp_conversations
for select
to authenticated
using (
    store_id in (
        select private.user_store_ids()
    )
);


create policy
"store members can read whatsapp messages"
on public.whatsapp_messages
for select
to authenticated
using (
    store_id in (
        select private.user_store_ids()
    )
);


-- =====================================================
-- PERMISOS PARA USUARIOS AUTENTICADOS
-- =====================================================

grant select
on public.whatsapp_conversations
to authenticated;


grant select
on public.whatsapp_messages
to authenticated;


-- =====================================================
-- PERMISOS PARA EL BACKEND SEGURO
-- =====================================================

grant select, insert, update
on public.whatsapp_conversations
to service_role;


grant select, insert, update
on public.whatsapp_messages
to service_role;