-- =====================================================
-- CONFIGURAR WHATSAPP DE UN COMERCIO
-- SOLO PLATFORM ADMIN
-- =====================================================

create or replace function public.platform_save_whatsapp_settings(
    p_store_id uuid,
    p_phone_number_id text,
    p_whatsapp_business_account_id text default null,
    p_display_phone_number text default null,
    p_active boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare

    v_settings_id uuid;

begin

    -- =================================================
    -- VALIDAR USUARIO
    -- =================================================

    if auth.uid() is null then

        raise exception
            'Usuario no autenticado';

    end if;


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
            'No autorizado';

    end if;


    -- =================================================
    -- VALIDAR COMERCIO
    -- =================================================

    if not exists (

        select 1

        from public.stores s

        where s.id = p_store_id

    ) then

        raise exception
            'Comercio no encontrado';

    end if;


    -- =================================================
    -- VALIDAR PHONE NUMBER ID
    -- =================================================

    if p_phone_number_id is null
       or trim(p_phone_number_id) = '' then

        raise exception
            'Phone Number ID obligatorio';

    end if;


    -- =================================================
    -- EVITAR USAR EL MISMO NÚMERO EN DOS COMERCIOS
    -- =================================================

    if exists (

        select 1

        from public.store_whatsapp_settings sws

        where sws.phone_number_id =
            trim(p_phone_number_id)

          and sws.store_id <> p_store_id

    ) then

        raise exception
            'Ese Phone Number ID ya pertenece a otro comercio';

    end if;


    -- =================================================
    -- CREAR O ACTUALIZAR CONFIGURACIÓN
    -- =================================================

    insert into public.store_whatsapp_settings (
        store_id,
        phone_number_id,
        whatsapp_business_account_id,
        display_phone_number,
        active,
        updated_at
    )
    values (
        p_store_id,
        trim(p_phone_number_id),
        nullif(
            trim(p_whatsapp_business_account_id),
            ''
        ),
        nullif(
            trim(p_display_phone_number),
            ''
        ),
        p_active,
        now()
    )

    on conflict (store_id)

    do update set

        phone_number_id =
            excluded.phone_number_id,

        whatsapp_business_account_id =
            excluded.whatsapp_business_account_id,

        display_phone_number =
            excluded.display_phone_number,

        active =
            excluded.active,

        updated_at =
            now()

    returning id
    into v_settings_id;


    return v_settings_id;

end;
$$;


-- =====================================================
-- PERMISOS
-- =====================================================

revoke all
on function public.platform_save_whatsapp_settings(
    uuid,
    text,
    text,
    text,
    boolean
)
from public;


grant execute
on function public.platform_save_whatsapp_settings(
    uuid,
    text,
    text,
    text,
    boolean
)
to authenticated;