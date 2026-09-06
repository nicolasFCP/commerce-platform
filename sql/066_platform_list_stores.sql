-- =====================================================
-- LISTAR COMERCIOS PARA PLATFORM ADMIN
-- =====================================================

create or replace function public.platform_list_stores()
returns table (
    store_id uuid,
    store_name text,
    store_slug text,
    store_phone text,
    store_active boolean,
    store_created_at timestamptz,
    owner_email text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin

    -- =================================================
    -- VALIDAR PLATFORM ADMIN
    -- =================================================

    if not exists (
        select 1
        from public.platform_admins pa
        where pa.user_id = auth.uid()
          and pa.active = true
    ) then

        raise exception
            'No autorizado para consultar comercios';

    end if;


    -- =================================================
    -- DEVOLVER COMERCIOS
    -- =================================================

    return query

    select
        s.id,
        s.name,
        s.slug,
        s.phone,
        s.active,
        s.created_at,

        (
            select u.email
            from public.store_members sm
            join auth.users u
                on u.id = sm.user_id
            where sm.store_id = s.id
              and sm.role = 'owner'
              and sm.active = true
            order by sm.created_at
            limit 1
        )::text as owner_email

    from public.stores s

    order by
        s.created_at desc;

end;
$$;


-- =====================================================
-- PERMISOS
-- =====================================================

revoke all
on function public.platform_list_stores()
from public;


grant execute
on function public.platform_list_stores()
to authenticated;