create or replace function public.create_product(
    p_category_id uuid,
    p_name text,
    p_price numeric,
    p_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    v_store_id uuid;
    v_product_id uuid;
begin

    -- Validar nombre
    if p_name is null
       or trim(p_name) = '' then

        raise exception
            'El nombre del producto es obligatorio';

    end if;


    -- Validar precio
    if p_price < 0 then

        raise exception
            'El precio no puede ser negativo';

    end if;


    -- Buscar a qué comercio pertenece la categoría
    select store_id
    into v_store_id
    from public.categories
    where id = p_category_id;


    -- Comprobar que la categoría exista
    if v_store_id is null then

        raise exception
            'Categoría no encontrada';

    end if;


    -- Comprobar que el usuario pertenece al comercio
    if not exists (

        select 1
        from public.store_members

        where store_id = v_store_id
        and user_id = auth.uid()
        and active = true

    ) then

        raise exception
            'No autorizado';

    end if;


    -- Crear producto
    insert into public.products (
        store_id,
        category_id,
        name,
        description,
        price,
        available,
        active
    )
    values (
        v_store_id,
        p_category_id,
        trim(p_name),
        nullif(trim(p_description), ''),
        p_price,
        true,
        true
    )
    returning id
    into v_product_id;


    return v_product_id;

end;
$$;


revoke all
on function public.create_product(
    uuid,
    text,
    numeric,
    text
)
from public;


grant execute
on function public.create_product(
    uuid,
    text,
    numeric,
    text
)
to authenticated;
