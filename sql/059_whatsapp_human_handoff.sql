alter table public.whatsapp_conversations
add column if not exists human_handoff_requested boolean not null default false;

alter table public.whatsapp_conversations
add column if not exists human_handoff_requested_at timestamptz;

alter table public.whatsapp_conversations
add column if not exists human_handoff_resolved_at timestamptz;