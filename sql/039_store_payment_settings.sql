-- =====================================================
-- CONFIGURACIÓN DE PAGOS POR COMERCIO
-- =====================================================

CREATE TABLE IF NOT EXISTS public.store_payment_settings (

    id uuid
        PRIMARY KEY
        DEFAULT gen_random_uuid(),

    created_at timestamptz
        NOT NULL
        DEFAULT now(),

    updated_at timestamptz
        NOT NULL
        DEFAULT now(),

    store_id uuid
        NOT NULL
        UNIQUE
        REFERENCES public.stores(id)
        ON DELETE CASCADE,

    transfer_enabled boolean
        NOT NULL
        DEFAULT false,

    bank_name text,

    account_type text,

    account_number text,

    account_holder text,

    transfer_instructions text
);


-- =====================================================
-- VALIDAR TIPO DE CUENTA
-- =====================================================

ALTER TABLE public.store_payment_settings
DROP CONSTRAINT IF EXISTS
    store_payment_settings_account_type_check;


ALTER TABLE public.store_payment_settings

ADD CONSTRAINT
    store_payment_settings_account_type_check

CHECK (
    account_type IS NULL
    OR account_type IN (
        'savings',
        'checking',
        'other'
    )
);


-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.store_payment_settings
ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- ADMINISTRADORES SOLO VEN SU COMERCIO
-- =====================================================

DROP POLICY IF EXISTS
    "store members can view payment settings"
ON public.store_payment_settings;


CREATE POLICY
    "store members can view payment settings"

ON public.store_payment_settings

FOR SELECT

TO authenticated

USING (
    store_id IN (
        SELECT private.user_store_ids()
    )
);


-- =====================================================
-- ADMINISTRADORES SOLO MODIFICAN SU COMERCIO
-- =====================================================

DROP POLICY IF EXISTS
    "store members can update payment settings"
ON public.store_payment_settings;


CREATE POLICY
    "store members can update payment settings"

ON public.store_payment_settings

FOR UPDATE

TO authenticated

USING (
    store_id IN (
        SELECT private.user_store_ids()
    )
)

WITH CHECK (
    store_id IN (
        SELECT private.user_store_ids()
    )
);


-- =====================================================
-- INSERTAR CONFIGURACIÓN SOLO PARA SU COMERCIO
-- =====================================================

DROP POLICY IF EXISTS
    "store members can insert payment settings"
ON public.store_payment_settings;


CREATE POLICY
    "store members can insert payment settings"

ON public.store_payment_settings

FOR INSERT

TO authenticated

WITH CHECK (
    store_id IN (
        SELECT private.user_store_ids()
    )
);


-- =====================================================
-- PERMISOS
-- =====================================================

GRANT SELECT, INSERT, UPDATE
ON public.store_payment_settings
TO authenticated;