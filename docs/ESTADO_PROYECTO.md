# COMMERCE PLATFORM

## Estado actual

Proyecto en desarrollo.

## Paso actual

PASO 2 — Base de datos con Supabase.

### Completado

- Proyecto Supabase creado.
- Base de datos PostgreSQL activa.
- Row Level Security (RLS) habilitado.
- Se creó la tabla `stores`.
- Se insertó correctamente el primer comercio de prueba: `Mercado Demo`.
- Se verificó la generación automática de UUID y `created_at`.

- Se creó la tabla `categories`.
- Se relacionó `categories.store_id` con `stores.id` mediante Foreign Key.
- Se configuró actualización y eliminación en cascada.
- Se creó la categoría de prueba `Bebidas` vinculada correctamente a `Mercado Demo`.

- Se creó la tabla `products`.
- Se relacionó `products.store_id` con `stores.id`.
- Se relacionó `products.category_id` con `categories.id`.
- Se creó el producto de prueba `Coca-Cola 1.5L`.
- Se verificó correctamente la relación comercio → categoría → producto.

- Se creó la tabla `customers`.
- Se relacionó `customers.store_id` con `stores.id`.
- Se creó el cliente de prueba `Cliente Demo`.
- Se verificó correctamente la relación comercio → cliente.
- Se creó la tabla `orders`.
- Se relacionó `orders.store_id` con `stores.id`.
- Se relacionó `orders.customer_id` con `customers.id`.
- Se configuró `Set NULL` al eliminar un cliente para conservar el historial de pedidos.
- Se creó correctamente el primer pedido de prueba.
- Se verificó el cálculo de subtotal, domicilio y total.

---

## Tabla `stores`

Guarda los comercios registrados en la plataforma.

### Columnas

- `id`: uuid, clave primaria, generado automáticamente.
- `created_at`: fecha de creación automática.
- `name`: nombre del comercio.
- `slug`: identificador único del comercio para URL.
- `phone`: teléfono del comercio.
- `logo_url`: dirección del logo, opcional.
- `primary_color`: color principal del comercio.
- `active`: indica si el comercio está activo.

### Ejemplo actual

- Comercio: `Mercado Demo`
- Slug: `mercado-demo`

---

## Tabla `categories`

Guarda las categorías de productos de cada comercio.

### Columnas

- `id`: uuid, clave primaria, generado automáticamente.
- `created_at`: fecha de creación automática.
- `store_id`: identifica a qué comercio pertenece la categoría.
- `name`: nombre de la categoría.
- `slug`: identificador de la categoría.
- `active`: indica si la categoría está activa.

### Relaciones

- `categories.store_id → stores.id`

### Ejemplo actual

- Comercio: `Mercado Demo`
- Categoría: `Bebidas`

---

## Tabla `products`

Guarda los productos de cada comercio.

### Columnas

- `id`: uuid, clave primaria, generado automáticamente.
- `created_at`: fecha de creación automática.
- `store_id`: identifica a qué comercio pertenece el producto.
- `category_id`: identifica a qué categoría pertenece.
- `name`: nombre del producto.
- `description`: descripción opcional.
- `price`: precio del producto.
- `image_url`: dirección opcional de la imagen.
- `available`: indica si el producto está disponible.
- `active`: indica si el producto está activo.

### Relaciones

- `products.store_id → stores.id`
- `products.category_id → categories.id`

### Ejemplo actual

- Comercio: `Mercado Demo`
- Categoría: `Bebidas`
- Producto: `Coca-Cola 1.5L`
- Precio: `$6.500`

---

## Tabla `customers`

Guarda los clientes que realizan pedidos en cada comercio.

### Columnas

- `id`: uuid, clave primaria, generado automáticamente.
- `created_at`: fecha de creación automática.
- `store_id`: identifica a qué comercio pertenece el cliente.
- `name`: nombre del cliente.
- `phone`: teléfono del cliente.
- `email`: correo electrónico opcional.
- `active`: indica si el cliente está activo.

### Relaciones

- `customers.store_id → stores.id`

### Ejemplo actual

- Comercio: `Mercado Demo`
- Cliente: `Cliente Demo`
- Teléfono: `3001234567`

-------
## Tabla `orders`

Guarda la información principal de cada pedido.

### Columnas

- `id`: uuid, clave primaria, generado automáticamente.
- `created_at`: fecha de creación automática.
- `store_id`: identifica el comercio que recibe el pedido.
- `customer_id`: referencia opcional al cliente registrado.
- `customer_name`: nombre del cliente en el momento de la compra.
- `customer_phone`: teléfono del cliente en el momento de la compra.
- `customer_email`: correo opcional del cliente.
- `fulfillment_type`: forma de entrega (`delivery` o `pickup`).
- `delivery_address`: dirección de entrega, opcional.
- `notes`: observaciones del pedido.
- `status`: estado actual del pedido.
- `subtotal`: valor de productos.
- `delivery_fee`: costo del domicilio.
- `total`: valor total del pedido.

### Relaciones

- `orders.store_id → stores.id`
- `orders.customer_id → customers.id`

### Ejemplo actual

- Comercio: `Mercado Demo`
- Cliente: `Cliente Demo`
- Tipo: `delivery`
- Estado: `pending`
- Subtotal: `$6.500`
- Domicilio: `$3.000`
- Total: `$9.500`
-------

## Estructura actual de datos

```text
Mercado Demo
│
└── Bebidas
    │
    └── Coca-Cola 1.5L
        └── $6.500


## Próximo objetivo

Crear la estructura de pedidos:

- `orders`
- `order_items`
- `order_events`