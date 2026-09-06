create or replace function public.resolve_whatsapp_handoff(
    p_conversation_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_updated_count integer;
begin

    update public.whatsapp_conversations
    set
        human_handoff_requested = false,
        human_handoff_resolved_at = now(),
        updated_at = now()
    where id = p_conversation_id
      and store_id in (
          select private.user_store_ids()
      );


    get diagnostics
        v_updated_count = row_count;


    if v_updated_count = 0 then

        raise exception
            'WHATSAPP_CONVERSATION_NOT_FOUND_OR_UNAUTHORIZED';

    end if;


    return true;

end;
$$;


revoke all
on function public.resolve_whatsapp_handoff(uuid)
from public;


grant execute
on function public.resolve_whatsapp_handoff(uuid)
to authenticated;