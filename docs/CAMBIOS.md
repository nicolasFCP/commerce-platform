# HISTORIAL DE CAMBIOS

## Versión 0.0.1

Fecha: 31 de agosto de 2026

- Proyecto creado.
- Se definió estructura inicial.
- Se estableció arquitectura Mobile First.
- Se decidió utilizar HTML, CSS, JavaScript y Supabase.
- Se estableció que el código fuente seguirá siendo propiedad del desarrollador.
## Versión 0.0.2

Fecha: 31 de agosto de 2026

- Se creó el proyecto en Supabase.
- Se configuró PostgreSQL.
- Se habilitó Row Level Security.
- Se creó la tabla `stores`.
- Se creó el primer registro de prueba `Mercado Demo`.
- Se verificó la generación automática de UUID y created_at.

## Versión 0.0.3

Fecha: 31 de agosto de 2026

- Se creó la tabla `categories`.
- Se conectó `categories` con `stores` mediante Foreign Key.
- Se configuró Cascade para actualización y eliminación.
- Se creó la categoría de prueba `Bebidas` para `Mercado Demo`.
- Se verificó que la relación entre comercio y categoría funciona correctamente.

## Versión 0.0.4

Fecha: 31 de agosto de 2026

- Se creó la tabla `products`.
- Se conectó `products` con `stores`.
- Se conectó `products` con `categories`.
- Se configuró Cascade en las relaciones.
- Se creó `Coca-Cola 1.5L` por $6.500 como producto de prueba.
- Se verificó la estructura comercio → categoría → producto.

## Versión 0.0.5

Fecha: 31 de agosto de 2026

- Se creó la tabla `customers`.
- Se conectó `customers` con `stores`.
- Se creó `Cliente Demo` como cliente de prueba.
- Se verificó la relación comercio → cliente.

## Versión 0.0.6

Fecha: 31 de agosto de 2026

- Se creó la tabla `orders`.
- Se conectó `orders` con `stores`.
- Se conectó `orders` con `customers`.
- Se configuró conservación del historial si se elimina un cliente.
- Se creó el primer pedido de prueba.
- Se verificaron subtotal, domicilio y total.

## Versión 0.0.7

Fecha: 31 de agosto de 2026

- Se creó la tabla `order_items`.
- Se conectó `order_items` con `orders`.
- Se conectó `order_items` con `products`.
- Se configuró conservación del historial si se elimina un producto.
- Se vinculó `Coca-Cola 1.5L` al primer pedido.
- Se verificaron cantidad, precio unitario y total de línea.

## Versión 0.0.8

Fecha: 31 de agosto de 2026

- Se creó la tabla `order_events`.
- Se conectó `order_events` con `orders`.
- Se creó el primer evento del pedido de prueba.
- Se registró el evento `created → pending`.
- Se verificó el historial básico de pedidos.

## Versión 0.0.9

Fecha: 1 de septiembre de 2026

- Se agregaron restricciones de estados y tipos de entrega.
- Se bloquearon cantidades, precios y valores negativos.
- Se agregaron reglas de unicidad por comercio.
- Se blindaron las relaciones multi-comercio.
- Se agregaron triggers de validación para pedidos, clientes y productos.
- Se verificó el aislamiento multi-comercio mediante pruebas temporales con `ROLLBACK`.

## Versión 0.0.10

Fecha: 1 de septiembre de 2026

- Se creó la tabla `store_members`.
- Se conectó `store_members` con `stores` y `auth.users`.
- Se agregaron roles `owner` y `staff`.
- Se vinculó el primer usuario autenticado con `Mercado Demo`.
- Se creó la función privada `private.user_store_ids()`.
- Se implementó RLS para `stores`.
- Se implementó RLS para `categories` y `products`.
- Se implementó RLS para `customers` y `orders`.
- Se implementó RLS para `order_items` y `order_events`.
- Se verificó mediante pruebas con `ROLLBACK` que un comercio no puede acceder a información de otro comercio.
- Se verificó correctamente el acceso del owner de `Mercado Demo` a sus clientes, pedidos, productos e historial.

## Versión 0.0.11

Fecha: 1 de septiembre de 2026

- Se habilitó el catálogo público para visitantes anónimos.
- Se permitió consultar comercios activos.
- Se permitió consultar categorías activas.
- Se permitió consultar productos activos y disponibles.
- Se verificó el acceso público mediante el rol `anon`.
- Se creó `public.place_order()` para recibir pedidos públicos.
- Los precios y totales son calculados por la base de datos y no por el navegador.
- Se validan comercio, productos, disponibilidad, cantidades y tipo de entrega.
- Se crea automáticamente el cliente, pedido, detalle del pedido e historial inicial.
- Se verificó mediante una prueba con `ROLLBACK` la creación segura de un pedido público.

## Versión 0.0.12

Fecha: 1 de septiembre de 2026

- Se conectó el frontend HTML/JavaScript con Supabase.
- Se creó una demo pública de comercio.
- El catálogo carga comercios, categorías y productos directamente desde la base de datos.
- Se implementó un carrito con control de cantidades.
- Se agregó formulario para nombre, teléfono, dirección y notas.
- El frontend utiliza `public.place_order()` para crear pedidos.
- Se realizó el primer pedido real desde el navegador.
- Se verificó la creación correcta en `orders`, `order_items` y `order_events`.
- Los precios y totales continúan siendo calculados y validados por la base de datos.

## Versión 0.0.13

Fecha: 1 de septiembre de 2026

- Se creó el primer acceso administrativo desde el frontend.
- Se conectó el login con Supabase Auth.
- Se verificó el inicio de sesión del owner de Mercado Demo.
- Se conectó el panel administrativo con la tabla `orders`.
- Los pedidos son consultados mediante la sesión autenticada y RLS.
- Se verificó que Mercado Demo puede visualizar sus pedidos recibidos.
- El panel muestra cliente, teléfono, dirección, notas, estado y total.

## Versión 0.0.14

Fecha: 1 de septiembre de 2026

- Se creó `public.change_order_status()`.
- Se implementaron transiciones controladas de estados de pedidos.
- Se verificó que únicamente usuarios pertenecientes al comercio puedan administrar sus pedidos.
- Se agregó el botón `Aceptar pedido` al panel administrativo.
- Se cambió correctamente un pedido de `pending` a `accepted` desde el navegador.
- Se registró automáticamente el evento `status_changed`.
- Se guardaron `from_status`, `to_status`, `actor_type` y `actor_user_id`.
- Se verificó que el historial identifica al usuario administrativo que realizó el cambio.

## Versión 0.0.15

Fecha: 1 de septiembre de 2026

- Se convirtió la gestión de pedidos en un flujo dinámico según el estado actual.
- El panel administrativo muestra automáticamente la acción correspondiente a cada pedido.
- Se verificó el flujo `accepted → preparing`.
- Se verificó el flujo `preparing → ready`.
- Se verificó el flujo `ready → out_for_delivery`.
- Se verificó el flujo `out_for_delivery → completed`.
- Los pedidos completados dejan de mostrar acciones administrativas.
- Se verificó en `order_events` el historial completo del ciclo de un pedido a domicilio.
- Cada cambio de estado registra al usuario administrativo responsable.
- Se completó correctamente el primer ciclo operativo completo de un pedido desde el frontend.

## Versión 0.0.16

Fecha: 1 de septiembre de 2026

- Se publicó Commerce Platform en GitHub.
- Se activó GitHub Pages desde la rama `main`.
- Se verificó el catálogo conectado a Supabase desde Internet.
- Se verificó el panel administrativo desde Internet.
- Se verificó el inicio de sesión del comercio desde la versión pública.
- Se verificó la consulta de pedidos mediante RLS desde GitHub Pages.
- Commerce Platform ya cuenta con una demo pública accesible sin servidor local.
- Se agregó `index.html` para redirigir la URL principal al catálogo.