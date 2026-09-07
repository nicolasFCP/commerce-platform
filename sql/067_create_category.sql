-- =====================================================
-- CREAR CATEGORÍA DESDE EL PANEL DEL COMERCIO
-- =====================================================

create or replace function public.create_category(
    p_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare

    v_store_id uuid;

    v_category_id uuid;

    v_slug text;

begin

    -- =================================================
    -- VALIDAR USUARIO
    -- =================================================

    if auth.uid() is null then

        raise exception
            'Usuario no autenticado';

    end if;


    -- =================================================
    -- VALIDAR NOMBRE
    -- =================================================

    if p_name is null
       or trim(p_name) = '' then

        raise exception
            'El nombre de la categoría es obligatorio';

    end if;


    -- =================================================
    -- IDENTIFICAR COMERCIO DEL USUARIO
    -- =================================================

    select
        sm.store_id

    into
        v_store_id

    from public.store_members sm

    where sm.user_id = auth.uid()
      and sm.active = true

    order by
        sm.created_at asc

    limit 1;


    if v_store_id is null then

        raise exception
            'No autorizado';

    end if;


    -- =================================================
    -- GENERAR SLUG
    -- Ej: "Lácteos y Huevos" -> "lacteos-y-huevos"
    -- =================================================

    v_slug =
        translate(
            lower(
                trim(p_name)
            ),
            'áéíóúüñ',
            'aeiouun'
        );


    v_slug =
        regexp_replace(
            v_slug,
            '[^a-z0-9]+',
            '-',
            'g'
        );


    v_slug =
        trim(
            both '-'
            from v_slug
        );


    if v_slug = '' then

        raise exception
            'No se pudo generar un slug válido';

    end if;


    -- =================================================
    -- EVITAR CATEGORÍA REPETIDA EN LA MISMA TIENDA
    -- =================================================

    if exists (

        select 1

        from public.categories c

        where c.store_id = v_store_id
          and c.slug = v_slug

    ) then

        raise exception
            'Ya existe una categoría con ese nombre';

    end if;


    -- =================================================
    -- CREAR CATEGORÍA
    -- =================================================

    insert into public.categories (
        store_id,
        name,
        slug,
        active
    )
    values (
        v_store_id,
        trim(p_name),
        v_slug,
        true
    )
    returning id
    into v_category_id;


    return v_category_id;

end;
$$;


-- =====================================================
-- PERMISOS
-- =====================================================

revoke all
on function public.create_category(text)
from public;


grant execute
on function public.create_category(text)
to authenticated;