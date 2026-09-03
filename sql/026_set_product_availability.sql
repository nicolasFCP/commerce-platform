create or replace function public.set_product_availability(
    p_product_id uuid,
    p_available boolean
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    v_store_id uuid;
begin

    select store_id
    into v_store_id
    from public.products
    where id = p_product_id;


    if v_store_id is null then
        raise exception 'Producto no encontrado';
    end if;


    if not exists (

        select 1
        from public.store_members

        where store_id = v_store_id
        and user_id = auth.uid()
        and active = true

    ) then

        raise exception 'No autorizado';

    end if;


    update public.products

    set available = p_available

    where id = p_product_id;

end;
$$;


revoke all
on function public.set_product_availability(uuid, boolean)
from public;


grant execute
on function public.set_product_availability(uuid, boolean)
to authenticated;