BEGIN;

DO $$
DECLARE
    store_a_id uuid;
    order_a_id uuid;
    order_item_a_id uuid;

    store_b_id uuid := gen_random_uuid();
    category_b_id uuid := gen_random_uuid();
    customer_b_id uuid := gen_random_uuid();
    product_b_id uuid := gen_random_uuid();

    test_failed boolean;
BEGIN
    -- Buscar los datos reales de Mercado Demo
    SELECT id
    INTO store_a_id
    FROM public.stores
    WHERE slug = 'mercado-demo'
    LIMIT 1;

    SELECT id
    INTO order_a_id
    FROM public.orders
    WHERE store_id = store_a_id
    LIMIT 1;

    SELECT id
    INTO order_item_a_id
    FROM public.order_items
    WHERE order_id = order_a_id
    LIMIT 1;

    -- Verificar que los datos necesarios existen
    IF store_a_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró Mercado Demo';
    END IF;

    IF order_a_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el pedido de prueba';
    END IF;

    IF order_item_a_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el producto dentro del pedido';
    END IF;

    -- Crear una segunda tienda TEMPORAL
    INSERT INTO public.stores (
        id,
        name,
        slug,
        phone,
        primary_color,
        active
    )
    VALUES (
        store_b_id,
        'Tienda Prueba B',
        'tienda-prueba-b',
        '3009990000',
        '#111827',
        true
    );

    INSERT INTO public.categories (
        id,
        store_id,
        name,
        slug,
        active
    )
    VALUES (
        category_b_id,
        store_b_id,
        'Bebidas B',
        'bebidas',
        true
    );

    INSERT INTO public.customers (
        id,
        store_id,
        name,
        phone,
        active
    )
    VALUES (
        customer_b_id,
        store_b_id,
        'Cliente B',
        '3009999999',
        true
    );

    INSERT INTO public.products (
        id,
        store_id,
        category_id,
        name,
        price,
        available,
        active
    )
    VALUES (
        product_b_id,
        store_b_id,
        category_b_id,
        'Producto B',
        5000,
        true,
        true
    );

    -- PRUEBA 1:
    -- Producto de Mercado Demo + categoría de Tienda B
    test_failed := false;

    BEGIN
        INSERT INTO public.products (
            store_id,
            category_id,
            name,
            price,
            available,
            active
        )
        VALUES (
            store_a_id,
            category_b_id,
            'Producto inválido',
            1000,
            true,
            true
        );

        test_failed := true;

    EXCEPTION
        WHEN foreign_key_violation THEN
            NULL;
    END;

    IF test_failed THEN
        RAISE EXCEPTION
        'PRUEBA 1 FALLÓ: producto y categoría de tiendas distintas fueron aceptados';
    END IF;

    -- PRUEBA 2:
    -- Pedido de Mercado Demo + cliente de Tienda B
    test_failed := false;

    BEGIN
        UPDATE public.orders
        SET customer_id = customer_b_id
        WHERE id = order_a_id;

        test_failed := true;

    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    IF test_failed THEN
        RAISE EXCEPTION
        'PRUEBA 2 FALLÓ: cliente de otra tienda fue aceptado';
    END IF;

    -- PRUEBA 3:
    -- Pedido de Mercado Demo + producto de Tienda B
    test_failed := false;

    BEGIN
        UPDATE public.order_items
        SET product_id = product_b_id
        WHERE id = order_item_a_id;

        test_failed := true;

    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    IF test_failed THEN
        RAISE EXCEPTION
        'PRUEBA 3 FALLÓ: producto de otra tienda fue aceptado';
    END IF;

END;
$$;

ROLLBACK;