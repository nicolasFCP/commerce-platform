ALTER TABLE public.store_members
ADD CONSTRAINT store_members_role_check
CHECK (
    role IN (
        'owner',
        'staff'
    )
);

ALTER TABLE public.store_members
ADD CONSTRAINT store_members_store_user_unique
UNIQUE (store_id, user_id);