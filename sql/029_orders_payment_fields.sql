alter table public.orders

add column if not exists payment_method text,

add column if not exists payment_status text
not null
default 'pending',

add column if not exists payment_proof_url text,

add column if not exists paid_at timestamptz,

add column if not exists payment_verified_by uuid
references auth.users(id)
on delete set null;


do $$
begin

    if not exists (

        select 1
        from pg_constraint
        where conname =
            'orders_payment_method_check'
        and conrelid =
            'public.orders'::regclass

    ) then

        alter table public.orders

        add constraint
            orders_payment_method_check

        check (
            payment_method is null
            or payment_method in (
                'transfer',
                'cash_on_delivery'
            )
        );

    end if;


    if not exists (

        select 1
        from pg_constraint
        where conname =
            'orders_payment_status_check'
        and conrelid =
            'public.orders'::regclass

    ) then

        alter table public.orders

        add constraint
            orders_payment_status_check

        check (
            payment_status in (
                'pending',
                'proof_received',
                'paid',
                'rejected'
            )
        );

    end if;

end;
$$;