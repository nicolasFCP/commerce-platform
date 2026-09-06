create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.platform_admins
        where user_id = auth.uid()
          and active = true
    );
$$;


revoke all
on function public.is_platform_admin()
from public;


grant execute
on function public.is_platform_admin()
to authenticated;