-- =====================================================
-- GUARDAR CONFIGURACIÓN DE TRANSFERENCIAS
-- =====================================================

CREATE OR REPLACE FUNCTION public.save_store_payment_settings(
    p_transfer_enabled boolean,
    p_bank_name text,
    p_account_type text,
    p_account_number text,
    p_account_holder text,
    p_transfer_instructions text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_store_id uuid;
BEGIN

    -- -------------------------------------------------
    -- OBTENER EL COMERCIO DEL USUARIO AUTENTICADO
    -- -------------------------------------------------

    SELECT sm.store_id
    INTO v_store_id

    FROM public.store_members sm

    WHERE sm.user_id = auth.uid()
      AND sm.active = true

    LIMIT 1;


    IF v_store_id IS NULL THEN

        RAISE EXCEPTION
            'USER_HAS_NO_ACTIVE_STORE';

    END IF;


    -- -------------------------------------------------
    -- GUARDAR O ACTUALIZAR CONFIGURACIÓN
    -- -------------------------------------------------

    INSERT INTO public.store_payment_settings (
        store_id,
        transfer_enabled,
        bank_name,
        account_type,
        account_number,
        account_holder,
        transfer_instructions
    )
    VALUES (
        v_store_id,
        COALESCE(
            p_transfer_enabled,
            false
        ),
        NULLIF(
            btrim(
                COALESCE(
                    p_bank_name,
                    ''
                )
            ),
            ''
        ),
        NULLIF(
            btrim(
                COALESCE(
                    p_account_type,
                    ''
                )
            ),
            ''
        ),
        NULLIF(
            btrim(
                COALESCE(
                    p_account_number,
                    ''
                )
            ),
            ''
        ),
        NULLIF(
            btrim(
                COALESCE(
                    p_account_holder,
                    ''
                )
            ),
            ''
        ),
        NULLIF(
            btrim(
                COALESCE(
                    p_transfer_instructions,
                    ''
                )
            ),
            ''
        )
    )

    ON CONFLICT (store_id)

    DO UPDATE SET
        transfer_enabled =
            EXCLUDED.transfer_enabled,

        bank_name =
            EXCLUDED.bank_name,

        account_type =
            EXCLUDED.account_type,

        account_number =
            EXCLUDED.account_number,

        account_holder =
            EXCLUDED.account_holder,

        transfer_instructions =
            EXCLUDED.transfer_instructions,

        updated_at =
            now();

END;
$$;


-- =====================================================
-- PERMISOS
-- =====================================================

REVOKE ALL
ON FUNCTION public.save_store_payment_settings(
    boolean,
    text,
    text,
    text,
    text,
    text
)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION public.save_store_payment_settings(
    boolean,
    text,
    text,
    text,
    text,
    text
)
TO authenticated;