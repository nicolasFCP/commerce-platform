ALTER TABLE public.store_payment_settings

ADD COLUMN IF NOT EXISTS
    cash_on_delivery_enabled boolean
    NOT NULL
    DEFAULT true;